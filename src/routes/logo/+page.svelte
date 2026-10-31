<script lang="ts">
	import { page } from '$app/state';
	import Logo from '#lib/components/Logo.svelte';

	type ConceptId = 'tag' | 'nexus' | 'prism' | 'scale';
	const conceptIds: ConceptId[] = ['tag', 'nexus', 'prism', 'scale'];

	// ?concept=nexus dsb. memudahkan membandingkan konsep lewat tautan langsung.
	const fromUrl = page.url.searchParams.get('concept') as ConceptId | null;
	let activeConcept: ConceptId = $state(fromUrl && conceptIds.includes(fromUrl) ? fromUrl : 'tag');
	let activeBg: 'white' | 'dark' | 'orange' | 'glass' = $state('white');
	let copiedSvg = $state(false);

	const concepts = [
		{
			id: 'tag' as const,
			title: 'Label Harga Pas 2.0 (Precision Tag)',
			subtitle: 'Label harga presisi dengan tali gantung, 5 skala HPP, dan centang terpasak',
			badge: 'Rekomendasi Utama (Upgraded)',
			tagline: 'Otentik, berkarakter, dan sarat cerita perhitungan HPP',
			description:
				'Upgrade yang mempertahankan esensi label harga, namun diperkaya dengan tali gantung aerodinamis, mata cincin otentik, serta 5 garis skala mikro di tepi tag yang melambangkan 5 pilar perhitungan HPP (Bahan, Tenaga Kerja, Kemasan, Operasional, Margin). Centang oranye mengunci di poros sudut sebagai simbol harga yang terverifikasi pas.',
			strengths: [
				'Tali gantung & mata cincin memberi siluet otentik yang lebih hidup dan berkelas',
				'5 garis skala mikro menjadi cerita fungsional yang sangat disukai juri hackathon',
				'Flat murni tanpa gradasi, 100% patuh pada aturan palet hitam, putih, dan oranye',
				'Tetap tajam dan mudah dibedakan dari ukuran sekecil favicon 16px'
			]
		},
		{
			id: 'nexus' as const,
			title: 'The Sovereign Nexus',
			subtitle: 'Monogram H dan P dengan titik inti',
			badge: 'Alternatif monogram',
			tagline: 'Monogram huruf dengan pita oranye',
			description:
				'Pilar kiri membentuk huruf H, pita oranye melengkung membentuk huruf P. Titik di tengah lengkungan melambangkan titik harga yang pas. Versi ini masih memakai gradasi dan glow, sehingga belum sesuai aturan palet flat.',
			strengths: [
				'Inisial HP masih terbaca',
				'Punya cerita makna yang bisa dijelaskan',
				'Catatan: perlu disederhanakan (tanpa gradasi) sebelum dipakai',
				'Catatan: detail titik inti hilang di ukuran 16px'
			]
		},
		{
			id: 'prism' as const,
			title: 'The Obsidian Prism',
			subtitle: 'Heksagon berfaset dengan ruang negatif P',
			badge: 'Alternatif geometris',
			tagline: 'Bentuk heksagon solid',
			description:
				'Heksagon berfaset seperti permata, dengan huruf P dan belah ketupat di ruang negatifnya. Kesannya solid, tetapi paling ramai dan terasa berat di latar putih.',
			strengths: [
				'Kesan kokoh',
				'Catatan: paling banyak detail di antara keempat konsep',
				'Catatan: bidang gelap besar kurang cocok dengan landing yang minimalis',
				'Catatan: memakai gradasi'
			]
		},
		{
			id: 'scale' as const,
			title: 'The Sovereign Scale',
			subtitle: 'Timbangan dengan titik tumpu',
			badge: 'Alternatif simbol',
			tagline: 'Simbol timbangan dan keseimbangan',
			description:
				'Kurva timbangan dengan titik tumpu di tengah, melambangkan keseimbangan antara harga untuk pembeli dan margin untuk penjual. Ide relevan, tetapi huruf dan bentuknya kurang tegas.',
			strengths: [
				'Ide keseimbangan harga relevan',
				'Catatan: huruf H dan P tidak terbaca',
				'Catatan: simbol timbangan kurang jelas di ukuran kecil',
				'Catatan: memakai gradasi'
			]
		}
	];

	const currentConceptData = $derived(
		concepts.find((c) => c.id === activeConcept) || concepts[0]
	);

	function copySvgMark() {
		// Salin elemen <svg> saja, bukan pembungkus HTML-nya.
		const svgElement = document.querySelector('#primary-logo-svg svg');
		if (svgElement) {
			const serializer = new XMLSerializer();
			const svgString = serializer.serializeToString(svgElement);
			navigator.clipboard.writeText(svgString).then(() => {
				copiedSvg = true;
				setTimeout(() => (copiedSvg = false), 2500);
			});
		}
	}
</script>

<svelte:head>
	<title>Eksplorasi Logo Mewah HargaPas - Desain Identitas</title>
</svelte:head>

<div class="hp-brand-page">
	<!-- TOP BAR -->
	<header class="hp-brand-nav">
		<div class="hp-brand-nav__inner">
			<a href="/" class="hp-brand-back">
				<span class="hp-brand-back__arrow">←</span>
				<span>Kembali ke Beranda</span>
			</a>
			<div class="hp-brand-nav__title">
				<span class="hp-badge-pill">Haute Identity Suite</span>
				<span>HargaPas Brand Identity</span>
			</div>
			<a href="/dashboard" class="hp-btn-sm-orange">
				Buka Dashboard →
			</a>
		</div>
	</header>

	<main class="hp-brand-container">
		<!-- HERO SECTION -->
		<section class="hp-brand-hero">
			<div class="hp-hero-chip">EKSPLORASI IDENTITAS VISUAL</div>
			<h1 class="hp-hero-title">
				Eksplorasi Logo <span class="text-orange">HargaPas</span>
			</h1>
			<p class="hp-hero-desc">
				Empat konsep logo untuk dibandingkan di latar putih, hitam, dan oranye, pada ukuran
				kecil maupun besar. Konsep yang dipilih nanti diterapkan ke navbar, sidebar dashboard,
				dan favicon.
			</p>
		</section>

		<!-- CONCEPT SELECTOR TABS -->
		<div class="hp-concept-tabs">
			{#each concepts as concept (concept.id)}
				<button
					type="button"
					class="hp-concept-tab"
					class:is-active={activeConcept === concept.id}
					onclick={() => (activeConcept = concept.id)}
				>
					<span class="hp-concept-tab__badge">{concept.badge}</span>
					<strong class="hp-concept-tab__title">{concept.title}</strong>
					<span class="hp-concept-tab__sub">{concept.subtitle}</span>
				</button>
			{/each}
		</div>

		<!-- MAIN SHOWCASE STAGE -->
		<section class="hp-stage-card">
			<div class="hp-stage-header">
				<div>
					<h2 class="hp-stage-title">{currentConceptData.title}</h2>
					<p class="hp-stage-meta">{currentConceptData.tagline}</p>
				</div>
				<!-- Background Environment Switcher -->
				<div class="hp-bg-switcher" role="group" aria-label="Ganti Latar Preview">
					<button
						type="button"
						class="hp-bg-btn"
						class:is-active={activeBg === 'dark'}
						onclick={() => (activeBg = 'dark')}
						title="Latar Obsidian Noir (#0D0E14)"
					>
						<span class="hp-bg-dot bg-dark"></span> Noir
					</button>
					<button
						type="button"
						class="hp-bg-btn"
						class:is-active={activeBg === 'white'}
						onclick={() => (activeBg = 'white')}
						title="Latar Pure White (#FFFFFF)"
					>
						<span class="hp-bg-dot bg-white"></span> White
					</button>
					<button
						type="button"
						class="hp-bg-btn"
						class:is-active={activeBg === 'orange'}
						onclick={() => (activeBg = 'orange')}
						title="Latar Vermilion Orange Signature (#FF6B1A)"
					>
						<span class="hp-bg-dot bg-orange"></span> Orange
					</button>
					<button
						type="button"
						class="hp-bg-btn"
						class:is-active={activeBg === 'glass'}
						onclick={() => (activeBg = 'glass')}
						title="Latar Frosted Glass"
					>
						<span class="hp-bg-dot bg-glass"></span> Glass
					</button>
				</div>
			</div>

			<!-- THE LIVE STAGE -->
			<div class="hp-stage-viewport hp-stage-viewport--{activeBg}">
				<div class="hp-stage-hero-mark" id="primary-logo-svg">
					<Logo
						concept={activeConcept}
						variant="stacked"
						size={120}
						theme={activeBg === 'white' ? 'light' : activeBg === 'orange' ? 'orange' : 'dark'}
						showTagline={true}
						tagline="Decision Engine & Financial Simulator"
					/>
				</div>

				<div class="hp-stage-actions">
					<button type="button" class="hp-btn-glass" onclick={copySvgMark}>
						{#if copiedSvg}
							✓ Kode SVG Berhasil Disalin!
						{:else}
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
								<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
							</svg>
							Salin Kode Vector SVG
						{/if}
					</button>
				</div>
			</div>

			<!-- PHILOSOPHY & ANATOMY -->
			<div class="hp-philosophy-grid">
				<div class="hp-phil-col">
					<h3>Makna Bentuk</h3>
					<p class="hp-phil-text">{currentConceptData.description}</p>
				</div>
				<div class="hp-phil-col">
					<h3>Kelebihan &amp; Catatan</h3>
					<ul class="hp-phil-list">
						{#each currentConceptData.strengths as strength}
							<li>
								<span class="hp-check-icon">✓</span>
								<span>{strength}</span>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</section>

		<!-- REAL-WORLD INTEGRATION BENCH -->
		<section class="hp-integration-section">
			<div class="hp-section-head">
				<h2 class="hp-section-title">Penerapan Nyata di Seluruh Website</h2>
				<p class="hp-section-sub">
					Simulasi tampilan logo pada navbar landing page, dashboard sidebar, favicon, dan kartu merchant.
				</p>
			</div>

			<div class="hp-mockup-grid">
				<!-- MOCKUP 1: Landing Page Navbar -->
				<div class="hp-mockup-card">
					<div class="hp-mockup-card__label">1. Header Navigasi Landing Page (Light Mode)</div>
					<div class="hp-mockup-nav-preview">
						<div class="hp-mockup-nav-brand">
							<Logo concept={activeConcept} variant="horizontal" size={30} theme="light" />
						</div>
						<div class="hp-mockup-nav-links">
							<span>Produk</span>
							<span>Cara kerja</span>
							<span>Rincian HPP</span>
							<span>Tanya</span>
						</div>
						<div class="hp-mockup-nav-btn">Buka Dashboard →</div>
					</div>
				</div>

				<!-- MOCKUP 2: Landing Page Navbar (Dark Mode / Inverted) -->
				<div class="hp-mockup-card">
					<div class="hp-mockup-card__label">2. Header Saat Scroll Section Hitam (Dark Mode)</div>
					<div class="hp-mockup-nav-preview hp-mockup-nav-preview--dark">
						<div class="hp-mockup-nav-brand">
							<Logo concept={activeConcept} variant="horizontal" size={30} theme="dark" />
						</div>
						<div class="hp-mockup-nav-links hp-mockup-nav-links--dark">
							<span>Produk</span>
							<span>Cara kerja</span>
							<span>Rincian HPP</span>
						</div>
						<div class="hp-mockup-nav-btn">Buka Dashboard →</div>
					</div>
				</div>

				<!-- MOCKUP 3: Dashboard Sidebar Header -->
				<div class="hp-mockup-card">
					<div class="hp-mockup-card__label">3. Sidebar Dashboard Web App</div>
					<div class="hp-mockup-sidebar-preview">
						<div class="hp-mockup-sidebar-brand">
							<Logo concept={activeConcept} variant="horizontal" size={36} theme="light" showTagline={true} tagline="Solusi Harga Terbaik" />
						</div>
						<div class="hp-mockup-store-pill">
							<span>🏪</span>
							<strong>Warkop Ceria Bingit</strong>
						</div>
						<div class="hp-mockup-sidebar-menu">
							<div class="hp-mockup-menu-item is-active">📊 Dashboard Ringkasan</div>
							<div class="hp-mockup-menu-item">🍲 Daftar Menu Makanan</div>
							<div class="hp-mockup-menu-item">🧂 Kalkulator Bahan</div>
						</div>
					</div>
				</div>

				<!-- MOCKUP 4: Merchant VIP Card & Favicon -->
				<div class="hp-mockup-card">
					<div class="hp-mockup-card__label">4. Kartu Merchant VIP &amp; Favicon Browser</div>
					<div class="hp-mockup-card-body">
						<div class="hp-vip-card">
							<div class="hp-vip-card__top">
								<Logo concept={activeConcept} variant="horizontal" size={24} theme="dark" />
								<span class="hp-vip-chip">PREMIUM MERCHANT</span>
							</div>
							<div class="hp-vip-card__mid">
								<div class="hp-vip-number">•••• •••• •••• 2026</div>
								<div class="hp-vip-name">WARKOP CERIA BINGIT</div>
							</div>
							<div class="hp-vip-card__bot">
								<span>Target Margin: 45%</span>
								<span class="hp-vip-verified">✓ Verified Decision Engine</span>
							</div>
						</div>

						<div class="hp-favicon-strip">
							<span class="hp-favicon-label">Favicon Resolusi:</span>
							<div class="hp-fav-item">
								<Logo concept={activeConcept} variant="mark" size={16} theme="dark" />
								<span>16px</span>
							</div>
							<div class="hp-fav-item">
								<Logo concept={activeConcept} variant="mark" size={24} theme="dark" />
								<span>24px</span>
							</div>
							<div class="hp-fav-item">
								<Logo concept={activeConcept} variant="mark" size={32} theme="dark" />
								<span>32px</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- SCALE MATRIX -->
		<section class="hp-scale-matrix-card">
			<h3 class="hp-matrix-title">Uji Skalabilitas &amp; Ketajaman Optik (Optical Sizing)</h3>
			<p class="hp-matrix-desc">
				Logo yang hebat harus terbaca jernih baik di ukuran sekecil favicon tab browser (16px) hingga banner raksasa.
			</p>

			<div class="hp-matrix-row">
				<div class="hp-matrix-cell">
					<Logo concept={activeConcept} variant="mark" size={16} theme="dark" />
					<span>16px</span>
				</div>
				<div class="hp-matrix-cell">
					<Logo concept={activeConcept} variant="mark" size={24} theme="dark" />
					<span>24px</span>
				</div>
				<div class="hp-matrix-cell">
					<Logo concept={activeConcept} variant="mark" size={32} theme="dark" />
					<span>32px</span>
				</div>
				<div class="hp-matrix-cell">
					<Logo concept={activeConcept} variant="mark" size={48} theme="dark" />
					<span>48px</span>
				</div>
				<div class="hp-matrix-cell">
					<Logo concept={activeConcept} variant="mark" size={64} theme="dark" />
					<span>64px</span>
				</div>
				<div class="hp-matrix-cell">
					<Logo concept={activeConcept} variant="horizontal" size={36} theme="dark" />
					<span>Wordmark 36px</span>
				</div>
			</div>
		</section>
	</main>
</div>

<style>
	.hp-brand-page {
		min-height: 100vh;
		background: #08090d;
		color: #ffffff;
		padding-bottom: 100px;
	}

	.hp-brand-nav {
		position: sticky;
		top: 0;
		z-index: 50;
		background: rgba(8, 9, 13, 0.85);
		backdrop-filter: blur(16px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.hp-brand-nav__inner {
		max-width: 1200px;
		margin: 0 auto;
		padding: 14px 24px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.hp-brand-back {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		color: #a1a1aa;
		font-size: 14px;
		font-weight: 600;
		text-decoration: none;
		transition: color 0.2s ease;
	}
	.hp-brand-back:hover {
		color: #ffffff;
	}

	.hp-brand-nav__title {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 14px;
		font-weight: 700;
		color: #ffffff;
	}

	.hp-badge-pill {
		font-size: 11px;
		font-weight: 800;
		padding: 3px 8px;
		background: rgba(255, 107, 26, 0.15);
		border: 1px solid rgba(255, 107, 26, 0.35);
		color: #ff6b1a;
		border-radius: 999px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.hp-btn-sm-orange {
		padding: 7px 16px;
		background: #ff6b1a;
		color: #ffffff;
		font-size: 13px;
		font-weight: 700;
		border-radius: 8px;
		text-decoration: none;
		transition: transform 0.15s ease, background-color 0.15s ease;
	}
	.hp-btn-sm-orange:hover {
		background: #ea580c;
		transform: translateY(-1px);
	}

	.hp-brand-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 48px 24px 0;
	}

	/* Hero */
	.hp-brand-hero {
		text-align: center;
		margin-bottom: 48px;
	}

	.hp-hero-chip {
		display: inline-block;
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 0.12em;
		color: #ff6b1a;
		padding: 4px 12px;
		background: rgba(255, 107, 26, 0.1);
		border: 1px solid rgba(255, 107, 26, 0.25);
		border-radius: 999px;
		margin-bottom: 16px;
	}

	.hp-hero-title {
		font-size: clamp(32px, 5vw, 48px);
		font-weight: 800;
		letter-spacing: -0.035em;
		margin-bottom: 14px;
	}

	.text-orange {
		color: #ff6b1a;
	}

	.hp-hero-desc {
		font-size: 16px;
		color: #949cae;
		max-width: 680px;
		margin: 0 auto;
		line-height: 1.6;
	}

	/* Concept Tabs */
	.hp-concept-tabs {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 16px;
		margin-bottom: 36px;
	}

	.hp-concept-tab {
		background: #11131a;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 16px;
		padding: 20px;
		text-align: left;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		gap: 6px;
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
		color: #ffffff;
	}
	.hp-concept-tab:hover {
		border-color: rgba(255, 107, 26, 0.4);
		transform: translateY(-2px);
	}
	.hp-concept-tab.is-active {
		background: #171b26;
		border-color: #ff6b1a;
		box-shadow: 0 4px 20px rgba(255, 107, 26, 0.18);
	}

	.hp-concept-tab__badge {
		font-size: 10px;
		font-weight: 800;
		color: #ff6b1a;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.hp-concept-tab__title {
		font-size: 17px;
		font-weight: 700;
		letter-spacing: -0.015em;
	}

	.hp-concept-tab__sub {
		font-size: 12px;
		color: #8b92a4;
	}

	/* Stage Card */
	.hp-stage-card {
		background: #10121a;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 24px;
		padding: 36px;
		margin-bottom: 56px;
	}

	.hp-stage-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 20px;
		margin-bottom: 28px;
	}

	.hp-stage-title {
		font-size: 26px;
		font-weight: 800;
		letter-spacing: -0.02em;
	}

	.hp-stage-meta {
		font-size: 14px;
		color: #ff6b1a;
		font-weight: 600;
		margin-top: 4px;
	}

	/* Background Switcher */
	.hp-bg-switcher {
		display: inline-flex;
		background: #171922;
		padding: 4px;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		gap: 4px;
	}

	.hp-bg-btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 7px 14px;
		font-size: 12px;
		font-weight: 700;
		background: transparent;
		color: #949cae;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.hp-bg-btn:hover {
		color: #ffffff;
	}
	.hp-bg-btn.is-active {
		background: #232736;
		color: #ffffff;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
	}

	.hp-bg-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}
	.hp-bg-dot.bg-dark {
		background: #0d0e14;
	}
	.hp-bg-dot.bg-white {
		background: #ffffff;
	}
	.hp-bg-dot.bg-orange {
		background: #ff6b1a;
	}
	.hp-bg-dot.bg-glass {
		background: rgba(255, 255, 255, 0.4);
	}

	/* Viewport */
	.hp-stage-viewport {
		min-height: 340px;
		border-radius: 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 48px 24px;
		position: relative;
		overflow: hidden;
		transition: background-color 0.3s ease, border-color 0.3s ease;
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	.hp-stage-viewport--dark {
		background: #0b0c10;
		color: #ffffff;
	}
	.hp-stage-viewport--white {
		background: #ffffff;
		color: #111111;
		border-color: rgba(0, 0, 0, 0.08);
	}
	.hp-stage-viewport--orange {
		background: #ff6b1a;
		color: #ffffff;
	}
	.hp-stage-viewport--glass {
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%);
		backdrop-filter: blur(24px);
		border-color: rgba(255, 255, 255, 0.15);
	}

	.hp-stage-hero-mark {
		margin-bottom: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.hp-stage-actions {
		display: flex;
		gap: 12px;
	}

	.hp-btn-glass {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 9px 18px;
		font-size: 13px;
		font-weight: 700;
		background: rgba(0, 0, 0, 0.4);
		color: #ffffff;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 10px;
		cursor: pointer;
		backdrop-filter: blur(12px);
		transition: all 0.2s ease;
	}
	.hp-btn-glass:hover {
		background: rgba(0, 0, 0, 0.7);
		border-color: #ff6b1a;
	}

	/* Philosophy Grid */
	.hp-philosophy-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 32px;
		margin-top: 36px;
		padding-top: 32px;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}

	.hp-phil-col h3 {
		font-size: 18px;
		font-weight: 700;
		margin-bottom: 12px;
		color: #ffffff;
	}

	.hp-phil-text {
		font-size: 14px;
		color: #949cae;
		line-height: 1.7;
	}

	.hp-phil-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.hp-phil-list li {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		font-size: 13px;
		color: #c4c8d4;
		line-height: 1.5;
	}

	.hp-check-icon {
		color: #ff6b1a;
		font-weight: 800;
	}

	/* Integration section */
	.hp-integration-section {
		margin-bottom: 56px;
	}

	.hp-section-head {
		margin-bottom: 28px;
	}

	.hp-section-title {
		font-size: 26px;
		font-weight: 800;
		letter-spacing: -0.02em;
		margin-bottom: 6px;
	}

	.hp-section-sub {
		font-size: 14px;
		color: #8e95a5;
	}

	.hp-mockup-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(460px, 1fr));
		gap: 24px;
	}
	@media (max-width: 640px) {
		.hp-mockup-grid {
			grid-template-columns: 1fr;
		}
	}

	.hp-mockup-card {
		background: #11131a;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 20px;
		padding: 24px;
	}

	.hp-mockup-card__label {
		font-size: 12px;
		font-weight: 700;
		color: #8e95a5;
		letter-spacing: 0.05em;
		margin-bottom: 16px;
	}

	/* Mockup 1: Nav Light */
	.hp-mockup-nav-preview {
		background: #ffffff;
		border-radius: 14px;
		padding: 12px 20px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border: 1px solid #e4e7ec;
		color: #111111;
	}

	.hp-mockup-nav-links {
		display: flex;
		gap: 16px;
		font-size: 12px;
		font-weight: 600;
		color: #52525b;
	}

	.hp-mockup-nav-btn {
		font-size: 11px;
		font-weight: 700;
		padding: 6px 12px;
		background: #ff6b1a;
		color: #ffffff;
		border-radius: 6px;
	}

	/* Mockup 2: Nav Dark */
	.hp-mockup-nav-preview--dark {
		background: #111111;
		border-color: #262626;
		color: #ffffff;
	}

	.hp-mockup-nav-links--dark {
		color: #a1a1aa;
	}

	/* Mockup 3: Sidebar */
	.hp-mockup-sidebar-preview {
		background: #ffffff;
		border-radius: 14px;
		padding: 20px;
		color: #111111;
		border: 1px solid #e4e7ec;
	}

	.hp-mockup-sidebar-brand {
		margin-bottom: 16px;
	}

	.hp-mockup-store-pill {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		background: #f4f4f5;
		border-radius: 8px;
		font-size: 13px;
		margin-bottom: 16px;
		font-weight: 600;
	}

	.hp-mockup-sidebar-menu {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.hp-mockup-menu-item {
		padding: 8px 12px;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 600;
		color: #52525b;
	}
	.hp-mockup-menu-item.is-active {
		background: #ff6b1a;
		color: #ffffff;
	}

	/* Mockup 4: VIP Card */
	.hp-mockup-card-body {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.hp-vip-card {
		background: linear-gradient(135deg, #1f232e 0%, #0d0f15 100%);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 16px;
		padding: 20px;
		color: #ffffff;
		box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
	}

	.hp-vip-card__top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 28px;
	}

	.hp-vip-chip {
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.1em;
		color: #ff6b1a;
		background: rgba(255, 107, 26, 0.15);
		padding: 3px 8px;
		border-radius: 4px;
	}

	.hp-vip-number {
		font-family: monospace;
		font-size: 15px;
		letter-spacing: 0.2em;
		color: #cbd5e1;
		margin-bottom: 4px;
	}

	.hp-vip-name {
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.05em;
		color: #ffffff;
	}

	.hp-vip-card__bot {
		display: flex;
		justify-content: space-between;
		font-size: 11px;
		color: #8e95a5;
		margin-top: 18px;
		padding-top: 12px;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}

	.hp-vip-verified {
		color: #ff6b1a;
		font-weight: 600;
	}

	.hp-favicon-strip {
		display: flex;
		align-items: center;
		gap: 16px;
		background: #171922;
		padding: 12px 18px;
		border-radius: 12px;
	}

	.hp-favicon-label {
		font-size: 12px;
		font-weight: 700;
		color: #8e95a5;
	}

	.hp-fav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}
	.hp-fav-item span {
		font-size: 10px;
		color: #71717a;
	}

	/* Scale matrix */
	.hp-scale-matrix-card {
		background: #11131a;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 20px;
		padding: 32px;
	}

	.hp-matrix-title {
		font-size: 18px;
		font-weight: 700;
		margin-bottom: 6px;
	}

	.hp-matrix-desc {
		font-size: 13px;
		color: #8e95a5;
		margin-bottom: 24px;
	}

	.hp-matrix-row {
		display: flex;
		align-items: center;
		gap: 32px;
		flex-wrap: wrap;
		padding: 24px;
		background: #0b0c10;
		border-radius: 14px;
		border: 1px solid rgba(255, 255, 255, 0.05);
	}

	.hp-matrix-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
	}

	.hp-matrix-cell span {
		font-size: 11px;
		color: #71717a;
		font-weight: 600;
	}
</style>

