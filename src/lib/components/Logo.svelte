<script lang="ts">
	interface Props {
		concept?: 'nexus' | 'prism' | 'scale' | 'tag';
		variant?: 'mark' | 'horizontal' | 'stacked';
		size?: number;
		theme?: 'auto' | 'light' | 'dark' | 'orange' | 'mono';
		class?: string;
		showTagline?: boolean;
		tagline?: string;
	}

	let {
		concept = 'tag',
		variant = 'horizontal',
		size = 36,
		theme = 'auto',
		class: className = '',
		showTagline = false,
		tagline = 'Decision Engine'
	}: Props = $props();

	// Unik id untuk filter/gradient agar tidak tabrakan jika ada multiple logo di 1 halaman
	const id = Math.random().toString(36).substring(2, 7);
</script>

<div
	class="hp-logo-wrap hp-logo--{concept} hp-logo--{variant} hp-logo-theme--{theme} {className}"
	style="--logo-size: {size}px;"
>
	<!-- LOGO MARK (ICON) -->
	<div class="hp-logo-icon" style="width: {size}px; height: {size}px;">
		{#if concept === 'nexus'}
			<!-- KONSEP 1: The Sovereign Nexus (Interlocking H-P Monogram with Precision Core) -->
			<svg
				viewBox="0 0 100 100"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				class="hp-logo-svg"
				aria-hidden="true"
			>
				<defs>
					<!-- Gradient Oranye Mewah (Liquid Vermilion) -->
					<linearGradient id="nexusGold_{id}" x1="12" y1="12" x2="88" y2="88" gradientUnits="userSpaceOnUse">
						<stop offset="0%" stop-color="#FF964A" />
						<stop offset="45%" stop-color="#FF6B1A" />
						<stop offset="100%" stop-color="#E04F00" />
					</linearGradient>

					<!-- Gradient Batang Fondasi Kiri (H Pillar) -->
					<linearGradient id="pillarGrad_{id}" x1="20" y1="15" x2="45" y2="85" gradientUnits="userSpaceOnUse">
						<stop offset="0%" stop-color="var(--hp-pillar-top, #111111)" />
						<stop offset="100%" stop-color="var(--hp-pillar-bottom, #2B2E38)" />
					</linearGradient>

					<!-- Glow Halus Elegan -->
					<filter id="nexusGlow_{id}" x="-20%" y="-20%" width="140%" height="140%">
						<feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#FF6B1A" flood-opacity="0.32" />
					</filter>
				</defs>

				<!-- Ring Golden Ratio Geometris (Aksen Presisi) -->
				<rect
					x="8"
					y="8"
					width="84"
					height="84"
					rx="24"
					stroke="currentColor"
					stroke-opacity="0.08"
					stroke-width="1.5"
					class="hp-logo-frame"
				/>

				<!-- Pilar Kiri Huruf 'H' (Fondasi Bisnis & Modal) -->
				<rect
					x="22"
					y="20"
					width="14"
					height="60"
					rx="7"
					fill="url(#pillarGrad_{id})"
					class="hp-logo-pillar"
				/>

				<!-- Pita Loop Interlocking Huruf 'P' & Jembatan 'H' (Pertumbuhan Margin & Keputusan) -->
				<path
					d="M 31 50 C 37 50 43 43 43 33 C 43 25.8 48.8 20 56 20 H 68 C 77.94 20 86 28.06 86 38 C 86 47.94 77.94 56 68 56 H 52 V 80"
					stroke="url(#nexusGold_{id})"
					stroke-width="11"
					stroke-linecap="round"
					stroke-linejoin="round"
					filter="url(#nexusGlow_{id})"
					class="hp-logo-ribbon"
				/>

				<!-- Titik Temu Emas: The "Pas" Precision Core / Golden Fulcrum -->
				<circle cx="65" cy="38" r="4.2" fill="#FFFFFF" class="hp-logo-core-bg" />
				<circle cx="65" cy="38" r="2.2" fill="#FF6B1A" class="hp-logo-core-fg" />
			</svg>
		{:else if concept === 'tag'}
			<!-- KONSEP: Label Harga Pas 2.0 (Precision Lanyard Tag + 5 Skala HPP) -->
			<svg
				viewBox="0 0 64 64"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				class="hp-logo-svg"
				aria-hidden="true"
			>
				<!-- Tali Gantung Minimalis (Lanyard Loop) -->
				<path
					d="M22 18 C22 10, 32 8, 38 14 C44 20, 38 26, 32 23"
					stroke="var(--hp-tag-lanyard, #FF6B1A)"
					stroke-width="2.2"
					stroke-linecap="round"
					class="hp-logo-tag-lanyard"
				/>

				<!-- Badan Label Harga Bersudut 32 derajat -->
				<g transform="rotate(32 30 32)">
					<path
						d="M18 14 H48 C51.5 14 54 16.5 54 20 V46 C54 49.5 51.5 52 48 52 H18 L6 33 Z"
						fill="var(--hp-tag-body, #111111)"
						stroke="var(--hp-tag-body, #111111)"
						stroke-width="2"
						stroke-linejoin="round"
						class="hp-logo-tag-body"
					/>
					<!-- Lubang Mata Cincin Presisi (Eyelet) -->
					<circle cx="15" cy="33" r="3.2" fill="var(--hp-tag-eyelet, #FFFFFF)" />
					<!-- 5 Skala HPP (5 micro notches vertikal: 5 pilar biaya) -->
					<line
						x1="48"
						y1="22"
						x2="48"
						y2="44"
						stroke="var(--hp-tag-eyelet, #FFFFFF)"
						stroke-opacity="0.3"
						stroke-width="2"
						stroke-linecap="round"
						stroke-dasharray="1 4"
					/>
				</g>

				<!-- Centang Oranye Presisi: Harga Sudah Pas -->
				<path
					d="M12 28 L19 35 L33 19"
					stroke="var(--hp-tag-check, #FF6B1A)"
					stroke-width="4.8"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="hp-logo-tag-check"
				/>
			</svg>
		{:else if concept === 'prism'}
			<!-- KONSEP 2: The Obsidian Prism (Berlian Presisi Faset & Negative Space P) -->
			<svg
				viewBox="0 0 100 100"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				class="hp-logo-svg"
				aria-hidden="true"
			>
				<defs>
					<linearGradient id="prismGrad_{id}" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
						<stop offset="0%" stop-color="#FF9B53" />
						<stop offset="100%" stop-color="#FF6B1A" />
					</linearGradient>
					<filter id="prismGlow_{id}">
						<feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#FF6B1A" flood-opacity="0.3" />
					</filter>
				</defs>

				<!-- Bodi Heksagonal Faset Berlian -->
				<polygon
					points="50,12 86,32 86,68 50,88 14,68 14,32"
					fill="var(--hp-facet-bg, #161822)"
					stroke="currentColor"
					stroke-opacity="0.12"
					stroke-width="1.8"
				/>

				<!-- Faset Atas Reflektif -->
				<polygon points="50,12 86,32 50,42 14,32" fill="currentColor" fill-opacity="0.08" />

				<!-- Pilar Kiri 'H' -->
				<path d="M 26 34 L 37 31 L 37 69 L 26 66 Z" fill="var(--hp-pillar-top, #FFFFFF)" />

				<!-- Kurva Kanan 'P' Faset Oranye -->
				<path
					d="M 43 28 H 68 C 76.5 28 81 33.5 81 41 C 81 48.5 76.5 54 68 54 H 43 V 73 H 37 V 28 H 43 Z"
					fill="url(#prismGrad_{id})"
					filter="url(#prismGlow_{id})"
				/>

				<!-- Negative Space Rhombus di dalam P -->
				<polygon points="56,36 66,41 56,46 46,41" fill="var(--hp-facet-bg, #161822)" />
				<circle cx="56" cy="41" r="2.5" fill="#FFFFFF" />
			</svg>
		{:else if concept === 'scale'}
			<!-- KONSEP 3: The Sovereign Scale (Timbangan Presisi & Mahkota Kemakmuran) -->
			<svg
				viewBox="0 0 100 100"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				class="hp-logo-svg"
				aria-hidden="true"
			>
				<defs>
					<linearGradient id="scaleGrad_{id}" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
						<stop offset="0%" stop-color="#FFA057" />
						<stop offset="50%" stop-color="#FF6B1A" />
						<stop offset="100%" stop-color="#E8590C" />
					</linearGradient>
					<filter id="scaleGlow_{id}">
						<feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#FF6B1A" flood-opacity="0.35" />
					</filter>
				</defs>

				<!-- Busur Luar Lingkaran Siklus Bisnis -->
				<circle cx="50" cy="50" r="41" stroke="currentColor" stroke-opacity="0.08" stroke-width="2" />
				<path
					d="M 50 9 A 41 41 0 0 1 91 50"
					stroke="url(#scaleGrad_{id})"
					stroke-width="3"
					stroke-linecap="round"
				/>

				<!-- Pilar Timbangan (H Monogram Arch) -->
				<path
					d="M 25 66 V 36 C 25 36 34 25 50 25 C 66 25 76 35 76 46 C 76 57 66 63 50 63 V 77"
					stroke="url(#scaleGrad_{id})"
					stroke-width="6.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					filter="url(#scaleGlow_{id})"
				/>

				<!-- Titik Tumpu Pas (Equilibrium Fulcrum) -->
				<circle cx="50" cy="44" r="5" fill="#FFFFFF" />
				<circle cx="50" cy="44" r="2.5" fill="#FF6B1A" />

				<!-- Garis Keseimbangan Biaya -->
				<line
					x1="28"
					y1="57"
					x2="38"
					y2="57"
					stroke="currentColor"
					stroke-width="3"
					stroke-linecap="round"
				/>
			</svg>
		{/if}
	</div>

	<!-- WORDMARK TYPOGRAPHY (IF VARIANT != 'mark') -->
	{#if variant !== 'mark'}
		<div class="hp-logo-text">
			<div class="hp-logo-brand">
				<span class="hp-brand-main">Harga</span><span class="hp-brand-accent">Pas</span>
			</div>
			{#if showTagline}
				<div class="hp-logo-tagline">{tagline}</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.hp-logo-wrap {
		display: inline-flex;
		align-items: center;
		text-decoration: none;
		user-select: none;
		vertical-align: middle;
		transition: opacity 0.2s ease, transform 0.2s ease;
	}

	.hp-logo--horizontal {
		flex-direction: row;
		gap: calc(var(--logo-size) * 0.32);
	}

	.hp-logo--stacked {
		flex-direction: column;
		text-align: center;
		gap: calc(var(--logo-size) * 0.2);
	}

	.hp-logo--stacked .hp-logo-text {
		align-items: center;
	}

	.hp-logo--stacked .hp-logo-brand {
		font-size: calc(var(--logo-size) * 0.5);
	}

	.hp-logo--stacked .hp-logo-tagline {
		font-size: calc(var(--logo-size) * 0.11);
		margin-top: calc(var(--logo-size) * 0.1);
	}

	.hp-logo--mark {
		display: inline-flex;
	}

	.hp-logo-icon {
		position: relative;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.hp-logo-svg {
		width: 100%;
		height: 100%;
		display: block;
		overflow: visible;
		transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.hp-logo-wrap:hover .hp-logo-svg {
		transform: scale(1.05);
	}

	/* Wordmark typography */
	.hp-logo-text {
		display: flex;
		flex-direction: column;
		justify-content: center;
		line-height: 1;
	}

	.hp-logo-brand {
		font-size: calc(var(--logo-size) * 0.64);
		font-weight: 800;
		letter-spacing: -0.035em;
		display: inline-flex;
		align-items: baseline;
		line-height: 1.05;
	}

	.hp-brand-main {
		color: var(--hp-brand-text, #111111);
		transition: color 0.25s ease;
	}

	.hp-brand-accent {
		color: var(--hp-brand-accent, #ff6b1a);
		transition: color 0.25s ease;
	}

	.hp-logo-tagline {
		font-size: calc(var(--logo-size) * 0.24);
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--hp-tagline-text, rgba(17, 17, 17, 0.6));
		margin-top: calc(var(--logo-size) * 0.08);
	}

	/* Theme Adjustments */
	.hp-logo-theme--auto {
		--hp-pillar-top: currentColor;
		--hp-pillar-bottom: currentColor;
		--hp-brand-text: currentColor;
		--hp-tagline-text: currentColor;
		--hp-tag-body: currentColor;
		--hp-tag-check: #ff6b1a;
		--hp-tag-lanyard: #ff6b1a;
		--hp-tag-eyelet: #ffffff;
		color: inherit;
	}

	.hp-logo-theme--light {
		--hp-pillar-top: #111111;
		--hp-pillar-bottom: #2d3039;
		--hp-facet-bg: #f4f4f7;
		--hp-brand-text: #111111;
		--hp-tagline-text: rgba(17, 17, 17, 0.6);
		--hp-tag-body: #111111;
		--hp-tag-check: #ff6b1a;
		--hp-tag-lanyard: #ff6b1a;
		--hp-tag-eyelet: #ffffff;
		color: #111111;
	}

	.hp-logo-theme--dark {
		--hp-pillar-top: #ffffff;
		--hp-pillar-bottom: #c7cbd6;
		--hp-facet-bg: #14161f;
		--hp-brand-text: #ffffff;
		--hp-tagline-text: rgba(255, 255, 255, 0.64);
		--hp-tag-body: #ffffff;
		--hp-tag-check: #ff6b1a;
		--hp-tag-lanyard: #ff6b1a;
		--hp-tag-eyelet: #111111;
		color: #ffffff;
	}

	/* Di latar oranye, aksen oranye tidak terlihat: "Pas" dan centang pindah ke hitam/oranye-di-putih. */
	.hp-logo-theme--orange {
		--hp-pillar-top: #ffffff;
		--hp-pillar-bottom: #ffffff;
		--hp-facet-bg: #111111;
		--hp-brand-text: #ffffff;
		--hp-brand-accent: #111111;
		--hp-tagline-text: rgba(255, 255, 255, 0.85);
		--hp-tag-body: #ffffff;
		--hp-tag-check: #111111;
		--hp-tag-lanyard: #ffffff;
		--hp-tag-eyelet: #111111;
		color: #ffffff;
	}

	.hp-logo-theme--mono {
		--hp-pillar-top: currentColor;
		--hp-pillar-bottom: currentColor;
		--hp-brand-text: currentColor;
		--hp-brand-accent: currentColor;
		--hp-tagline-text: currentColor;
		--hp-tag-body: currentColor;
		--hp-tag-check: #ffffff;
		--hp-tag-lanyard: currentColor;
		--hp-tag-eyelet: transparent;
		color: currentColor;
	}
	.hp-logo-theme--mono :global(.hp-logo-ribbon) {
		stroke: currentColor !important;
		filter: none !important;
	}
	.hp-logo-theme--mono :global(.hp-logo-core-fg) {
		fill: currentColor !important;
	}
</style>

