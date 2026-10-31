<script lang="ts">
	import { onMount } from 'svelte';
	import Hero from '#lib/components/Hero.svelte';
	import Showcase from '#lib/components/Showcase.svelte';
	import Steps from '#lib/components/Steps.svelte';
	import HppList from '#lib/components/HppList.svelte';
	import PhotoBand from '#lib/components/PhotoBand.svelte';
	import Consultant from '#lib/components/Consultant.svelte';
	import Pricing from '#lib/components/Pricing.svelte';
	import Faq from '#lib/components/Faq.svelte';
	import Closing from '#lib/components/Closing.svelte';
	import Footer from '#lib/components/Footer.svelte';

	onMount(() => {
		const targets = document.querySelectorAll('[data-reveal]');
		if (!('IntersectionObserver' in window)) {
			targets.forEach((target) => target.classList.add('is-in'));
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					entry.target.classList.add('is-in');
					observer.unobserve(entry.target);
				}
			},
			{ threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
		);

		targets.forEach((target) => observer.observe(target));
		return () => observer.disconnect();
	});
</script>

<svelte:head>
	<title>HargaPas, harga jual dan margin untuk warung</title>
	<meta
		name="description"
		content="HargaPas adalah dashboard harga untuk warung: daftar menu, lima komponen HPP, margin tiap piring, dan konsultan AI dalam satu layar."
	/>
</svelte:head>

<a class="skip-link" href="#dashboard">Lewati ke dashboard</a>

<main class="page">
	<Hero />
	<Showcase />
	<Steps />
	<HppList />
	<PhotoBand />
	<Consultant />
	<Pricing />
	<Faq />
	<Closing />
</main>
<Footer />
