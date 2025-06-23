/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

import { useState, useEffect, useRef } from 'react';
import { PanelBody, Button, TextControl, Spinner, Modal, SearchControl, Card, CardBody, CardMedia, CardHeader, SelectControl, RangeControl, Notice } from '@wordpress/components';
import { useSelect } from '@wordpress/data';

function useDebouncedValue(value, delay) {
	const [debounced, setDebounced] = useState(value);
	useEffect(() => {
		const handler = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(handler);
	}, [value, delay]);
	return debounced;
}

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
export default function Edit({ attributes, setAttributes }) {
	const { videoId, videoTitle, videoGuid, libraryId, alignment = 'center', width = 100 } = attributes;
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const debouncedSearch = useDebouncedValue(searchTerm, 300);
	const [videos, setVideos] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const blockProps = useBlockProps({
		className: `bunny-video-block align-${alignment}`,
		style: { width: `${width}%` }
	});

	// Get library ID from WordPress options (from the other plugin)
	const currentLibraryId = useSelect(select => {
		return select('core').getEntityRecord('root', 'site')?.bunny_video_library_id || '';
	}, []);

	const fetchVideos = async (search = '') => {
		setLoading(true);
		setError('');
		try {
			const response = await fetch(`/wp-json/wp/v2/video?per_page=100&search=${encodeURIComponent(search)}`);
			const data = await response.json();
			
			if (Array.isArray(data)) {
				setVideos(data);
			} else {
				setVideos([]);
				setError(__('Failed to fetch videos. Please make sure you have synced videos from Bunny.net.', 'bunny-video-block'));
			}
		} catch (err) {
			console.error('Error fetching videos:', err);
			setError(__('Failed to fetch videos. Please make sure you have synced videos from Bunny.net.', 'bunny-video-block'));
			setVideos([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (isModalOpen) {
			fetchVideos(debouncedSearch);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isModalOpen, debouncedSearch]);

	const handleSearch = (term) => {
		setSearchTerm(term);
	};

	const selectVideo = (video) => {
		const videoGuid = video._bvp_guid || '';
		const videoLibraryId = video._bvp_library_id || currentLibraryId;
		
		setAttributes({
			videoId: video.id,
			videoTitle: video.title.rendered,
			videoGuid: videoGuid,
			libraryId: videoLibraryId,
		});
		setIsModalOpen(false);
	};

	const generateEmbedCode = () => {
		const finalLibraryId = libraryId || currentLibraryId;
		if (!videoGuid || !finalLibraryId) return '';
		
		return `<div class="bunny-video-player" style="position: relative; padding-bottom: 56.25%; height: 0; margin-bottom: 30px;">
			<iframe src="https://iframe.mediadelivery.net/embed/${finalLibraryId}/${videoGuid}" 
				style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
				allowfullscreen></iframe>
		</div>`;
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Video Settings', 'bunny-video-block')}>
					<Button
						isPrimary
						onClick={() => setIsModalOpen(true)}
						style={{ width: '100%', marginBottom: '10px' }}
					>
						{videoId ? __('Change Video', 'bunny-video-block') : __('Select Video', 'bunny-video-block')}
					</Button>
					{videoId && (
						<>
							<TextControl
								label={__('Video Title', 'bunny-video-block')}
								value={videoTitle}
								onChange={(value) => setAttributes({ videoTitle: value })}
							/>
							<SelectControl
								label={__('Alignment', 'bunny-video-block')}
								value={alignment}
								options={[
									{ label: __('Left', 'bunny-video-block'), value: 'left' },
									{ label: __('Center', 'bunny-video-block'), value: 'center' },
									{ label: __('Right', 'bunny-video-block'), value: 'right' },
								]}
								onChange={(value) => setAttributes({ alignment: value })}
							/>
							<RangeControl
								label={__('Width (%)', 'bunny-video-block')}
								value={width}
								onChange={(value) => setAttributes({ width: value })}
								min={10}
								max={100}
							/>
						</>
					)}
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				{videoId ? (
					<div className="bunny-video-preview" dangerouslySetInnerHTML={{ __html: generateEmbedCode() }} />
				) : (
					<div className="bunny-video-placeholder">
						<div style={{ border: '2px dashed #ccc', padding: '40px', textAlign: 'center', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
							<p style={{ margin: '0 0 20px 0', color: '#666' }}>{__('No video selected', 'bunny-video-block')}</p>
							<Button isPrimary onClick={() => setIsModalOpen(true)}>{__('Select Video', 'bunny-video-block')}</Button>
						</div>
					</div>
				)}
			</div>

			{isModalOpen && (
				<Modal
					title={__('Select Video', 'bunny-video-block')}
					onRequestClose={() => setIsModalOpen(false)}
					className="bunny-video-modal"
					overlayClassName="bunny-video-modal-overlay"
				>
					<div style={{ padding: '20px' }}>
						<SearchControl
							placeholder={__('Search videos...', 'bunny-video-block')}
							value={searchTerm}
							onChange={handleSearch}
							style={{ marginBottom: '20px' }}
						/>
						{error && <Notice status="error" isDismissible={false}>{error}</Notice>}
						<div style={{ position: 'relative', minHeight: 420 }}>
							{videos.length > 0 ? (
								<div style={{
									display: 'grid',
									gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
									gap: '20px',
									maxHeight: '400px',
									overflowY: 'auto',
									paddingBottom: 20
								}}>
									{videos.map((video) => {
										const videoGuid = video._bvp_guid || '';
										const videoLibraryId = video._bvp_library_id || currentLibraryId;
										const thumbnailUrl = videoGuid && videoLibraryId ?
											`https://thumbnail.bunnycdn.com/${videoLibraryId}/${videoGuid}.jpg` : '';
										return (
											<Card
												key={video.id}
												isElevated
												style={{
													cursor: 'pointer',
													transition: 'box-shadow 0.2s, transform 0.2s',
													boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
													borderRadius: 8
												}}
												onClick={() => selectVideo(video)}
												onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.16)'}
												onMouseOut={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)'}
											>
												<CardMedia>
													{thumbnailUrl ? (
														<img
															src={thumbnailUrl}
															alt={video.title.rendered}
															style={{
																width: '100%',
																height: '150px',
																objectFit: 'cover',
																borderTopLeftRadius: 8,
																borderTopRightRadius: 8
															}}
															onError={e => { e.target.style.display = 'none'; }}
														/>
													) : (
														<div style={{
															width: '100%',
															height: '150px',
															backgroundColor: '#f0f0f0',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															borderTopLeftRadius: 8,
															borderTopRightRadius: 8
														}}>
															<span style={{ color: '#666' }}>{__('No thumbnail', 'bunny-video-block')}</span>
														</div>
													)}
												</CardMedia>
												<CardHeader>
													<h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{video.title.rendered}</h3>
												</CardHeader>
												<CardBody>
													<p style={{
														margin: 0,
														fontSize: '12px',
														color: '#666',
														overflow: 'hidden',
														textOverflow: 'ellipsis',
														whiteSpace: 'nowrap'
													}}>
														{videoGuid ? __('Video available', 'bunny-video-block') : __('No video data', 'bunny-video-block')}
													</p>
												</CardBody>
											</Card>
										);
									})}
								</div>
							) : loading ? null : (
								<div style={{ textAlign: 'center', padding: '40px' }}>
									<p>{__('No videos found. Please sync videos from Bunny.net first.', 'bunny-video-block')}</p>
								</div>
							)}
							{loading && (
								<div style={{
									position: 'absolute',
									top: 0,
									left: 0,
									width: '100%',
									height: 420,
									background: 'rgba(255,255,255,0.7)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									zIndex: 2,
									borderRadius: 8
								}}>
									<Spinner />
								</div>
							)}
						</div>
					</div>
				</Modal>
			)}
		</>
	);
}
