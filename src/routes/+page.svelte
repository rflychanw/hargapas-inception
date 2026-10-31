<script lang="ts">
	import { onMount } from 'svelte';
	import Navbar from '#lib/components/Navbar.svelte';
	import Hero from '#lib/components/Hero.svelte';
	import Showcase from '#lib/components/Showcase.svelte';
	import Steps from '#lib/components/Steps.svelte';
	import HppList from '#lib/components/HppList.svelte';
	import PhotoBand from '#lib/components/PhotoBand.svelte';
	import Consultant from '#lib/components/Consultant.svelte';
	import Faq from '#lib/components/Faq.svelte';
	import Closing from '#lib/components/Closing.svelte';
	import Footer from '#lib/components/Footer.svelte';

	onMount(() => {
		const targets = [...document.querySelectorAll('[data-reveal]')];

		const show = (target: Element) => target.classList.add('is-in');

		if (!('IntersectionObserver' in window)) {
			targets.forEach(show);
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					show(entry.target);
					observer.unobserve(entry.target);
				}
			},
			{ threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
		);

		const tall = window.innerHeight;
		for (const target of targets) {
			if (target.getBoundingClientRect().top < tall * 0.95) {
				show(target);
			} else {
				observer.observe(target);
			}
		}

		// safety net: nothing stays hidden if observer fails
		const timer = window.setTimeout(() => targets.forEach(show), 2000);

		return () => {
			window.clearTimeout(timer);
			observer.disconnect();
		};
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

<Navbar />

<main class="page">
	<Hero />
	<Showcase />
	<Steps />
	<HppList />
	<PhotoBand />
	<Consultant />
	<Faq />
	<Closing />
</main>
<Footer />
