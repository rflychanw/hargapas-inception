<script lang="ts">
    import { onMount } from "svelte";
    import { initLandingMotion } from "#lib/scroll.js";
    import Navbar from "#lib/components/Navbar.svelte";
    import Hero from "#lib/components/Hero.svelte";
    import Showcase from "#lib/components/Showcase.svelte";
    import Steps from "#lib/components/Steps.svelte";
    import HppList from "#lib/components/HppList.svelte";
    import Consultant from "#lib/components/Consultant.svelte";
    import Faq from "#lib/components/Faq.svelte";
    import Closing from "#lib/components/Closing.svelte";
    import Footer from "#lib/components/Footer.svelte";

    // Animasi gulir (reveal + parallax) ditangani di satu tempat: src/lib/scroll.js
    onMount(() => initLandingMotion());
</script>

<svelte:head>
    <title>HargaPas, harga jual dan margin untuk warung</title>
    <link
        rel="preload"
        href="/img/dashboard-laptop.png"
        as="image"
        fetchpriority="high"
    />
    <meta
        name="description"
        content="HargaPas adalah dashboard harga untuk warung: daftar menu, lima komponen HPP, margin tiap piring, dan konsultan AI dalam satu layar."
    />
</svelte:head>

<!-- Accessibility Skip Link (Melompat langsung ke konten utama saat navigasi keyboard) -->
<a
    href="#dashboard"
    class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
>
    Lewati ke dashboard
</a>

<Navbar />

<main class="block w-full min-h-screen bg-white text-slate-900">
    <Hero />
    <Showcase />
    <Steps />
    <HppList />
    <Consultant />
    <Faq />
    <Closing />
</main>

<Footer />
