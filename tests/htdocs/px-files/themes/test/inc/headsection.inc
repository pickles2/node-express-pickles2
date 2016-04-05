<?php /*
すべての layout について共通の、headセクションの記述
*/ ?>

		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<meta name="keywords" content="<?= htmlspecialchars($px->site()->get_current_page_info('keywords')); ?>" />
		<meta name="description" content="<?= htmlspecialchars($px->site()->get_current_page_info('description')); ?>" />

<?= $px->get_contents_manifesto(); ?>

		<!-- Bootstrap Theme -->
		<link rel="stylesheet" href="<?= htmlspecialchars( $px->path_plugin_files('/styles/bootstrap-theme.min.css') ); ?>">
		<link rel="stylesheet" href="<?= htmlspecialchars( $px->path_plugin_files('/styles/theme.css') ); ?>">
