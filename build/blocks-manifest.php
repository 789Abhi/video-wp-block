<?php
// This file is generated. Do not modify it manually.
return array(
	'bunny-video-block' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'create-block/bunny-video-block',
		'version' => '0.1.0',
		'title' => 'Bunny Video Block',
		'category' => 'widgets',
		'icon' => 'smiley',
		'description' => 'Example block scaffolded with Create Block tool.',
		'example' => array(
			
		),
		'supports' => array(
			'html' => false
		),
		'textdomain' => 'bunny-video-block',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'render' => 'file:./render.php',
		'viewScript' => 'file:./view.js',
		'attributes' => array(
			'videoId' => array(
				'type' => 'integer',
				'default' => null
			),
			'videoTitle' => array(
				'type' => 'string',
				'default' => ''
			),
			'videoGuid' => array(
				'type' => 'string',
				'default' => ''
			),
			'libraryId' => array(
				'type' => 'string',
				'default' => ''
			),
			'alignment' => array(
				'type' => 'string',
				'default' => 'center'
			),
			'width' => array(
				'type' => 'number',
				'default' => 100
			)
		)
	)
);
