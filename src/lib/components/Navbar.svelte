<script lang="ts">
	import { onMount } from 'svelte';
	import { slide, fade } from 'svelte/transition';
	import Logo from '#lib/components/Logo.svelte';

	type NavItem = { id: string; label: string; drawer: string };

	// Bagian yang dipantau, urut sesuai urutan section di halaman.
	const sections: NavItem[] = [
		{ id: 'dashboard', label: 'Produk', drawer: 'Produk & Ringkasan' },
		{ id: 'cara-kerja', label: 'Cara kerja', drawer: 'Cara Kerja 4 Langkah' },
		{ id: 'hpp', label: 'Rincian HPP', drawer: '5 Komponen HPP' },
		{ id: 'konsultan', label: 'Konsultan', drawer: 'Tanya Konsultan AI' },
		{ id: 'tanya', label: 'Tanya', drawer: 'Pertanyaan Umum' }
	];

	// Desktop memuat empat tautan utama; "Konsultan" cukup di drawer mobile.
	const desktopItems = sections.filter((item) => item.id !== 'konsultan');

	let isScrolled = $state(false);
	let isMobileMenuOpen = $state(false);
	let isOverDark = $state(false);
	let activeId = $state('');
	let progress = $state(0);

	onMount(() => {
		let frame = 0;
		let queued = false;

		const read = () => {
			queued = false;

			const y = window.scrollY;
			const vh = window.innerHeight;
			const docHeight = document.documentElement.scrollHeight;

			isScrolled = y > 12;
			progress = docHeight > vh ? Math.min(1, Math.max(0, y / (docHeight - vh))) : 0;

			// Dua titik ukur: tepat di bawah navbar (untuk warna gelap) dan
			// sekitar 40% tinggi layar (untuk menandai section yang sedang dibaca).
			const navProbe = y + 72;
			const readProbe = y + Math.min(vh * 0.4, 340);

			let dark = false;
			let current = '';

			for (const item of sections) {
				const el = document.getElementById(item.id);
				if (!el) continue;

				const rect = el.getBoundingClientRect();
				const top = rect.top + y;
				const bottom = top + rect.height;

				if (navProbe >= top && navProbe < bottom && el.classList.contains('chapter--ink')) {
					dark = true;
				}

				if (!current && readProbe >= top && readProbe < bottom) current = item.id;
			}

			// Sudah di dasar halaman: tautan terakhir tetap menyala.
			if (!current && y + vh >= docHeight - 4) {
				current = sections[sections.length - 1].id;
			}

			isOverDark = dark;
			activeId = current;
		};

		const onScroll = () => {
			if (queued) return;
			queued = true;
			frame = requestAnimationFrame(read);
		};

		read();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll, { passive: true });

		return () => {
			if (frame) cancelAnimationFrame(frame);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
			document.body.style.overflow = '';
		};
	});

	$effect(() => {
		if (typeof document !== 'undefined') {
			if (isMobileMenuOpen) {
				document.body.style.overflow = 'hidden';
			} else {
				document.body.style.overflow = '';
			}
		}
	});

	function handleLinkClick() {
		isMobileMenuOpen = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isMobileMenuOpen) {
			isMobileMenuOpen = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<header
	class="sticky-nav"
	class:is-scrolled={isScrolled}
	class:is-open={isMobileMenuOpen}
	class:is-dark={isOverDark}
	aria-label="Navigasi Utama"
>
	<div class="shell sticky-nav__shell">
		<div class="sticky-nav__inner">
			<!-- Logo / Wordmark -->
			<a class="wordmark" href="#atas" aria-label="HargaPas, ke awal halaman" onclick={handleLinkClick}>
				<Logo size={28} variant="horizontal" theme={isOverDark ? "dark" : "light"} />
			</a>

			<!-- Desktop Nav (>= 768px) -->
			<nav class="nav-links desktop-nav" aria-label="Menu navigasi desktop">
				{#each desktopItems as item (item.id)}
					<a
						href="#{item.id}"
						class:is-active={activeId === item.id}
						aria-current={activeId === item.id ? 'true' : undefined}
						onclick={() => (activeId = item.id)}
					>
						{item.label}
					</a>
				{/each}
			</nav>

			<!-- Desktop CTA Button (>= 768px) -->
			<div class="desktop-cta">
				<a href="/dashboard" class="btn btn--orange desktop-cta__btn">
					<span>Buka Dashboard</span>
					<span class="btn__arrow" aria-hidden="true">→</span>
				</a>
			</div>

			<!-- Mobile Nav Toggle (< 768px) -->
			<div class="mobile-toggle-wrap">
				<button
					type="button"
					class="mobile-menu-btn"
					aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu navigasi'}
					aria-expanded={isMobileMenuOpen}
					onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
				>
					{#if isMobileMenuOpen}
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					{:else}
						<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="4" y1="7" x2="20" y2="7"></line>
							<line x1="4" y1="12" x2="20" y2="12"></line>
							<line x1="4" y1="17" x2="20" y2="17"></line>
						</svg>
					{/if}
				</button>
			</div>
		</div>
	</div>

	<!-- Garis kemajuan baca: seberapa jauh halaman sudah digulir -->
	<div class="nav-progress" aria-hidden="true" style="transform: scaleX({progress})"></div>

	<!-- Mobile Menu Drawer (< 768px) -->
	{#if isMobileMenuOpen}
		<div class="mobile-drawer" transition:slide={{ duration: 220 }}>
			<div class="shell mobile-drawer__shell">
				<nav class="mobile-drawer__links" aria-label="Menu navigasi mobile">
					{#each sections as item (item.id)}
						<a
							href="#{item.id}"
							class="mobile-drawer__link"
							class:is-active={activeId === item.id}
							aria-current={activeId === item.id ? 'true' : undefined}
							onclick={() => {
								activeId = item.id;
								handleLinkClick();
							}}
						>
							<span class="mobile-drawer__link-text">{item.drawer}</span>
							<span class="mobile-drawer__arrow">→</span>
						</a>
					{/each}
				</nav>

				<div class="mobile-drawer__foot">
					<a href="/dashboard" class="btn btn--orange mobile-drawer__cta" onclick={handleLinkClick}>
						<span>Buka Dashboard</span>
						<span class="btn__arrow" aria-hidden="true">→</span>
					</a>
				</div>
			</div>
		</div>
		<!-- Backdrop click to close -->
		<div 
			class="mobile-backdrop" 
			transition:fade={{ duration: 180 }}
			onclick={() => (isMobileMenuOpen = false)}
			aria-hidden="true"
		></div>
	{/if}
</header>

<style>
	.sticky-nav {
		position: sticky;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		background: rgba(255, 255, 255, 0.94);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border-bottom: 1px solid rgba(17, 17, 17, 0.08);
		padding-top: env(safe-area-inset-top, 0px);
		transition:
			background-color 0.25s ease,
			box-shadow 0.25s ease,
			border-color 0.25s ease,
			color 0.25s ease;
	}

	.sticky-nav.is-scrolled {
		background: rgba(255, 255, 255, 0.98);
		border-bottom-color: rgba(17, 17, 17, 0.1);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
	}

	/* Dark mode when scrolling over .chapter--ink (Showcase, Consultant, FAQ) */
	.sticky-nav.is-dark {
		background: rgba(17, 17, 17, 0.92);
		border-bottom-color: rgba(255, 255, 255, 0.12);
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
	}

	.sticky-nav.is-dark.is-scrolled {
		background: rgba(17, 17, 17, 0.96);
		border-bottom-color: rgba(255, 255, 255, 0.16);
	}

	/* .wordmark handled by Logo component */

	.sticky-nav.is-dark .desktop-nav a {
		color: rgba(255, 255, 255, 0.76);
	}

	.sticky-nav.is-dark .desktop-nav a:hover {
		color: #ffffff;
	}

	.sticky-nav.is-dark .mobile-menu-btn {
		background: rgba(255, 255, 255, 0.1);
		color: #ffffff;
		border-color: rgba(255, 255, 255, 0.18);
	}

	.sticky-nav.is-dark .mobile-menu-btn:active {
		background: rgba(255, 255, 255, 0.18);
	}

	.sticky-nav.is-open {
		background: #ffffff;
	}

	.sticky-nav.is-dark.is-open {
		background: #111111;
	}

	.sticky-nav__shell {
		padding-top: 0;
		padding-bottom: 0;
	}

	.sticky-nav__inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 60px;
		gap: 16px;
	}

	@media (min-width: 768px) {
		.sticky-nav__inner {
			height: 68px;
		}
	}

	.wordmark {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		min-height: 44px;
		user-select: none;
	}

	/* .wordmark-mark retired */

	/* .wordmark-text retired */

	

	/* Desktop Navigation */
	.desktop-nav {
		display: none;
	}

	.desktop-cta {
		display: none;
	}

	@media (min-width: 768px) {
		.desktop-nav {
			display: flex;
			align-items: center;
			gap: 28px;
		}

		.desktop-cta {
			display: block;
		}

		.desktop-cta__btn {
			min-height: 42px;
			padding: 8px 18px;
			font-size: 14px;
			border-radius: 10px;
			box-shadow: 0 2px 8px rgba(255, 107, 26, 0.25);
		}
	}

	/* Mobile Toggle Button */
	.mobile-toggle-wrap {
		display: flex;
		align-items: center;
	}

	@media (min-width: 768px) {
		.mobile-toggle-wrap {
			display: none;
		}
	}

	.mobile-menu-btn {
		width: 42px;
		height: 42px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #111111;
		background: #f5f5f5;
		border: 1px solid rgba(17, 17, 17, 0.08);
		cursor: pointer;
		touch-action: manipulation;
		transition: background-color 0.15s ease, transform 0.12s ease, color 0.2s ease, border-color 0.2s ease;
		user-select: none;
		-webkit-user-select: none;
	}

	.mobile-menu-btn:active {
		background: #eaeaea;
		transform: scale(0.95);
	}

	/* Mobile Drawer */
	.mobile-drawer {
		position: relative;
		z-index: 101;
		background: #ffffff;
		border-bottom: 1px solid rgba(17, 17, 17, 0.08);
		box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.12);
	}

	.sticky-nav.is-dark .mobile-drawer {
		background: #111111;
		border-bottom-color: rgba(255, 255, 255, 0.12);
	}

	@media (min-width: 768px) {
		.mobile-drawer,
		.mobile-backdrop {
			display: none;
		}
	}

	.mobile-drawer__shell {
		padding-top: 8px;
		padding-bottom: 20px;
	}

	.mobile-drawer__links {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.mobile-drawer__link {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 48px;
		padding: 12px 14px;
		border-radius: 10px;
		font-size: 15px;
		font-weight: 600;
		color: #111111;
		text-decoration: none;
		transition: background-color 0.12s ease, color 0.12s ease;
	}

	.sticky-nav.is-dark .mobile-drawer__link {
		color: #ffffff;
	}

	.mobile-drawer__link:active {
		background: rgba(255, 107, 26, 0.08);
		color: #ff6b1a;
	}

	.mobile-drawer__link-text {
		letter-spacing: -0.015em;
	}

	.mobile-drawer__arrow {
		color: #9ca3af;
		font-size: 14px;
		font-weight: 500;
		transition: transform 0.15s ease, color 0.15s ease;
	}

	.mobile-drawer__link:active .mobile-drawer__arrow {
		color: #ff6b1a;
		transform: translateX(3px);
	}

	.mobile-drawer__foot {
		margin-top: 14px;
		padding-top: 14px;
		border-top: 1px solid rgba(17, 17, 17, 0.06);
	}

	.sticky-nav.is-dark .mobile-drawer__foot {
		border-top-color: rgba(255, 255, 255, 0.1);
	}

	.mobile-drawer__cta {
		width: 100%;
		justify-content: center;
		min-height: 48px;
		font-size: 15px;
		font-weight: 700;
		border-radius: 12px;
		box-shadow: 0 4px 14px rgba(255, 107, 26, 0.35);
	}

	/* Dimmed Backdrop behind drawer */
	.mobile-backdrop {
		position: fixed;
		top: 60px;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.35);
		backdrop-filter: blur(2px);
		-webkit-backdrop-filter: blur(2px);
		z-index: 99;
	}

	/* ---- Status baca ------------------------------------------------
	   Garis tipis di tepi bawah navbar: menunjukkan seberapa jauh
	   halaman sudah digulir. Dipakai juga sebagai umpan balik halus
	   saat tautan navigasi diklik. */

	.nav-progress {
		position: absolute;
		left: 0;
		right: 0;
		bottom: -1px;
		height: 2px;
		transform: scaleX(0);
		transform-origin: 0 50%;
		background: linear-gradient(90deg, #ff8a3d, #ff6b1a);
		pointer-events: none;
		transition: transform 90ms linear;
		will-change: transform;
	}

	/* ---- Tautan aktif ------------------------------------------------ */

	.desktop-nav a::after {
		content: '';
		position: absolute;
		left: 8px;
		right: 8px;
		bottom: 9px;
		height: 2px;
		border-radius: 2px;
		background: #ff6b1a;
		opacity: 0;
		transform: scaleX(0);
		transform-origin: 0 50%;
		transition:
			transform 260ms cubic-bezier(0.23, 1, 0.32, 1),
			opacity 200ms ease;
	}

	.desktop-nav a:hover::after {
		opacity: 0.4;
		transform: scaleX(1);
	}

	.desktop-nav a.is-active {
		color: #ff6b1a;
	}

	.desktop-nav a.is-active::after {
		opacity: 1;
		transform: scaleX(1);
	}

	.sticky-nav.is-dark .desktop-nav a.is-active {
		color: #ff8a3d;
	}

	.sticky-nav.is-dark .desktop-nav a.is-active::after {
		background: #ff8a3d;
	}

	.mobile-drawer__link.is-active {
		color: #ff6b1a;
		background: rgba(255, 107, 26, 0.08);
	}

	.mobile-drawer__link.is-active .mobile-drawer__arrow {
		color: #ff6b1a;
	}

	.sticky-nav.is-dark .mobile-drawer__link.is-active {
		color: #ff8a3d;
		background: rgba(255, 107, 26, 0.14);
	}
</style>
