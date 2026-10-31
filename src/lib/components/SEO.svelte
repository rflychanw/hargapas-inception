<script lang="ts">
	import { page } from '$app/state';

	let {
		title = 'HargaPas',
		description = 'Decision Engine & Financial Simulator HPP untuk UMKM Kuliner.',
		image = '',
		url = '',
		type = 'website'
	}: {
		title?: string;
		description?: string;
		image?: string;
		url?: string;
		type?: string;
	} = $props();

	const baseDomain = 'https://hargapas.app';
	const absoluteImage = $derived(image.startsWith('http') ? image : `${baseDomain}${image}`);
	const autoUrl = $derived(url || `${baseDomain}${page.url.pathname}`);
	const fullTitle = $derived(
		title === 'HargaPas' || title.includes('HargaPas —') ? title : `${title} — HargaPas`
	);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={autoUrl} />

	<!-- Open Graph / Facebook / WhatsApp -->
	<meta property="og:type" content={type} />
	<meta property="og:url" content={autoUrl} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={absoluteImage} />
	<meta property="og:image:secure_url" content={absoluteImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={autoUrl} />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={absoluteImage} />
</svelte:head>

