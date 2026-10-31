<script lang="ts">
	import Logo from '#lib/components/Logo.svelte';
	interface Props {
		activeTab?: string;
		storeName?: string;
		onselect?: (tab: string) => void;
		onlogout?: () => void;
	}

	let {
		activeTab = 'dashboard',
		storeName = 'Warkop Ceria Bingit',
		onselect = () => {},
		onlogout = () => {}
	}: Props = $props();

	const tabs = [
		{ id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
		{ id: 'menu', label: 'Menu', icon: 'menu' },
		{ id: 'bahan', label: 'Bahan', icon: 'bahan' },
		{ id: 'konsultan', label: 'Konsultan', icon: 'konsultan' }
	];
</script>

<!-- Mobile Top Header (< 1024px) -->
<header class="hp-mobile-header" aria-label="Header Mobile HargaPas">
	<a href="/" class="hp-brand-link" title="HargaPas">
		<Logo size={28} variant="horizontal" theme="light" />
	</a>

	<div style="display: flex; align-items: center; gap: 8px;">
		<button
			type="button"
			class="hp-mobile-logout-btn"
			onclick={onlogout}
			aria-label="Keluar / Logout dari sesi"
			title="Logout"
		>
			<!-- Logout Icon -->
			<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#e64a0a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
				<polyline points="16 17 21 12 16 7" />
				<line x1="21" x2="9" y1="12" y2="12" />
			</svg>
		</button>
	</div>
</header>

<!-- Desktop Sidebar (>= 1024px) -->
<aside class="hp-sidebar" aria-label="Navigasi Utama Dashboard">
	<div class="hp-sidebar__top">
		<div class="hp-sidebar__brand-row">
			<a href="/" class="hp-sidebar__brand" title="Ke Beranda HargaPas">
				<Logo size={34} variant="horizontal" theme="light" showTagline={true} tagline="Solusi Harga Terbaik" />
			</a>
		</div>

		<div
			class="hp-store-pill"
			style="width: 100%; cursor: default; text-align: left;"
			title="Toko Aktif: {storeName}"
		>
			<span class="hp-store-pill__icon" aria-hidden="true">
				<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E64A0A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
					<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
					<path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
					<path d="M2 7h20" />
				</svg>
			</span>
			<span class="hp-store-pill__name" style="flex: 1;">{storeName}</span>
		</div>
	</div>

	<nav class="hp-sidebar__nav" aria-label="Menu Utama">
		<p class="hp-sidebar__section-title">MENU UTAMA</p>
		<ul class="hp-sidebar__list">
			{#each tabs as tab (tab.id)}
				<li>
					<button
						type="button"
						class="hp-nav-item"
						class:hp-nav-item--active={activeTab === tab.id}
						onclick={() => onselect(tab.id)}
					>
						<span class="hp-nav-item__icon" aria-hidden="true">
							{#if tab.icon === 'dashboard'}
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<rect width="7" height="7" x="3" y="3" rx="1.5" />
									<rect width="7" height="7" x="14" y="3" rx="1.5" />
									<rect width="7" height="7" x="14" y="14" rx="1.5" />
									<rect width="7" height="7" x="3" y="14" rx="1.5" />
								</svg>
							{:else if tab.icon === 'menu'}
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
									<path d="M7 2v20" />
									<path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
								</svg>
							{:else if tab.icon === 'bahan'}
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
									<path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
									<path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
								</svg>
							{:else}
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72" />
									<path d="m14 7 3 3" />
									<path d="M5 6v4" />
									<path d="M19 14v4" />
									<path d="M10 2v2" />
									<path d="M7 8H3" />
									<path d="M21 16h-4" />
									<path d="M11 3H9" />
								</svg>
							{/if}
						</span>
						<span class="hp-nav-item__label">{tab.label}</span>
					</button>
				</li>
			{/each}
		</ul>
	</nav>

	<div class="hp-sidebar__foot">
		<button
			type="button"
			class="hp-logout-btn"
			onclick={onlogout}
			title="Keluar dari sesi akun"
		>
			<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
				<polyline points="16 17 21 12 16 7" />
				<line x1="21" x2="9" y1="12" y2="12" />
			</svg>
			<span>Logout</span>
		</button>
	</div>
</aside>

<!-- Mobile Bottom Navigation (< 1024px) -->
<nav class="hp-bottom-nav" aria-label="Navigasi Bawah Mobile">
	{#each tabs as tab (tab.id)}
		<button
			type="button"
			class="hp-bottom-nav__item"
			class:hp-bottom-nav__item--active={activeTab === tab.id}
			onclick={() => onselect(tab.id)}
		>
			<span class="hp-bottom-nav__icon" aria-hidden="true">
				{#if tab.icon === 'dashboard'}
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<rect width="7" height="7" x="3" y="3" rx="1.5" />
						<rect width="7" height="7" x="14" y="3" rx="1.5" />
						<rect width="7" height="7" x="14" y="14" rx="1.5" />
						<rect width="7" height="7" x="3" y="14" rx="1.5" />
					</svg>
				{:else if tab.icon === 'menu'}
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
						<path d="M7 2v20" />
						<path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
					</svg>
				{:else if tab.icon === 'bahan'}
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
						<path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
						<path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
					</svg>
				{:else}
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72" />
						<path d="m14 7 3 3" />
						<path d="M5 6v4" />
						<path d="M19 14v4" />
						<path d="M10 2v2" />
						<path d="M7 8H3" />
						<path d="M21 16h-4" />
						<path d="M11 3H9" />
					</svg>
				{/if}
			</span>
			<span class="hp-bottom-nav__label">{tab.label}</span>
		</button>
	{/each}
</nav>
