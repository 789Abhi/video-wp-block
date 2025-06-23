<?php
/**
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 */

// Debug: Log the attributes to see what's being passed
error_log('Bunny Video Block Attributes: ' . print_r($attributes, true));

// Try different ways to access the attributes
$videoGuid = '';
$libraryId = '';
$alignment = 'center';
$width = 100;

// Check for different possible attribute names
if (isset($attributes['videoGuid'])) {
    $videoGuid = $attributes['videoGuid'];
} elseif (isset($attributes['video_guid'])) {
    $videoGuid = $attributes['video_guid'];
}

if (isset($attributes['libraryId'])) {
    $libraryId = $attributes['libraryId'];
} elseif (isset($attributes['library_id'])) {
    $libraryId = $attributes['library_id'];
}

if (isset($attributes['alignment'])) {
    $alignment = $attributes['alignment'];
}

if (isset($attributes['width'])) {
    $width = intval($attributes['width']);
}

// If no library ID from block, try to get it from WordPress options
if (empty($libraryId)) {
    $libraryId = get_option('bunny_video_library_id', '');
}

// Debug: Log the final values
error_log('Bunny Video Block Final Values - videoGuid: ' . $videoGuid . ', libraryId: ' . $libraryId);
?>
<div <?php echo get_block_wrapper_attributes(['class' => "bunny-video-block align-{$alignment}"]); ?> style="width: <?php echo esc_attr($width); ?>%;">
<?php if ($videoGuid && $libraryId): ?>
    <div class="bunny-video-player" style="position: relative; padding-bottom: 56.25%; height: 0; margin-bottom: 30px;">
        <iframe src="https://iframe.mediadelivery.net/embed/<?php echo esc_attr($libraryId); ?>/<?php echo esc_attr($videoGuid); ?>"
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
                allowfullscreen></iframe>
    </div>
<?php else: ?>
    <p><?php esc_html_e('No video selected. Debug: videoGuid=' . $videoGuid . ', libraryId=' . $libraryId, 'bunny-video-block'); ?></p>
<?php endif; ?>
</div>
