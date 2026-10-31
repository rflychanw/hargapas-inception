<script lang="ts">
	import { onMount } from 'svelte';
	import { slide, fade } from 'svelte/transition';

	let isScrolled = $state(false);
	let isMobileMenuOpen = $state(false);

	onMount(() => {
		const handleScroll = () => {
			isScrolled = window.scrollY > 15;
		};

		handleScroll();
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', handleScroll);
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

<header class="sticky-nav" class:is-scrolled={isScrolled} class:is-open={isMobileMenuOpen} aria-label="Navigasi Utama">
	<div class="shell sticky-nav__shell">
		<div class="sticky-nav__inner">
			<!-- Logo / Wordmark -->
			<a class="wordmark" href="#atas" aria-label="HargaPas, ke awal halaman" onclick={handleLinkClick}>
				<span class="wordmark-mark" aria-hidden="true"></span>
				<span class="wordmark-text">HargaPas</span>
			</a>

			<!-- Desktop Nav (>= 768px) -->
			<nav class="nav-links desktop-nav" aria-label="Menu navigasi desktop">
				<a href="#dashboard">Produk</a>
				<a href="#cara-kerja">Cara kerja</a>
				<a href="#hpp">Rincian HPP</a>
				<a href="#tanya">Tanya</a>
			</nav>

			<!-- Desktop CTA Button (>= 768px) -->
			<div class="desktop-cta">
				<a href="/dashboard" class="btn btn--orange desktop-cta__btn">
					<span>Buka Dashboard</span>
					<span class="btn__arrow" aria-hidden="true">→</span>
				</a>
			</div>

			<!-- Mobile Nav Toggle (< 768px) - Hanya ada SATU tombol hamburger pada header mobile -->
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

	<!-- Mobile Menu Drawer (< 768px) -->
	{#if isMobileMenuOpen}
		<div class="mobile-drawer" transition:slide={{ duration: 220 }}>
			<div class="shell mobile-drawer__shell">
				<nav class="mobile-drawer__links" aria-label="Menu navigasi mobile">
					<a href="#dashboard" class="mobile-drawer__link" onclick={handleLinkClick}>
						<span class="mobile-drawer__link-text">Produk & Ringkasan</span>
						<span class="mobile-drawer__arrow">→</span>
					</a>
					<a href="#cara-kerja" class="mobile-drawer__link" onclick={handleLinkClick}>
						<span class="mobile-drawer__link-text">Cara Kerja 4 Langkah</span>
						<span class="mobile-drawer__arrow">→</span>
					</a>
					<a href="#hpp" class="mobile-drawer__link" onclick={handleLinkClick}>
						<span class="mobile-drawer__link-text">5 Komponen HPP</span>
						<span class="mobile-drawer__arrow">→</span>
					</a>
					<a href="#konsultan" class="mobile-drawer__link" onclick={handleLinkClick}>
						<span class="mobile-drawer__link-text">Tanya Konsultan AI</span>
						<span class="mobile-drawer__arrow">→</span>
					</a>
					<a href="#tanya" class="mobile-drawer__link" onclick={handleLinkClick}>
						<span class="mobile-drawer__link-text">Pertanyaan Umum</span>
						<span class="mobile-drawer__arrow">→</span>
					</a>
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
		transition: background-color 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
	}

	.sticky-nav.is-scrolled {
		background: rgba(255, 255, 255, 0.98);
		border-bottom-color: rgba(17, 17, 17, 0.1);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
	}

	.sticky-nav.is-open {
		background: #ffffff;
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

	.wordmark-mark {
		width: 12px;
		height: 12px;
		background: #ff6b1a;
		border-radius: 3px;
		flex-shrink: 0;
		box-shadow: 0 2px 6px rgba(255, 107, 26, 0.35);
	}

	.wordmark-text {
		font-size: 20px;
		font-weight: 800;
		letter-spacing: -0.035em;
		color: #111111;
	}

	@media (min-width: 768px) {
		.wordmark-text {
			font-size: 22px;
		}
	}

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
		transition: background-color 0.15s ease, transform 0.12s ease;
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
</style>
