<script lang="ts">
	interface Props {
		activeTab?: string;
		onselect?: (tab: string) => void;
	}

	let {
		activeTab = 'ringkasan',
		onselect = () => {}
	}: Props = $props();

	const tabs = [
		{
			id: 'ringkasan',
			label: 'Ringkasan',
			icon: 'dashboard'
		},
		{
			id: 'menu',
			label: 'Daftar Menu',
			icon: 'menu'
		},
		{
			id: 'ai',
			label: 'Konsultan AI',
			icon: 'sparkle'
		},
		{
			id: 'kalkulator',
			label: 'Kalkulator HPP',
			icon: 'calc'
		}
	];
</script>

<!-- Desktop Sidebar (>= 1024px) -->
<aside class="dash-sidebar" aria-label="Navigasi Utama Dashboard">
	<div class="dash-sidebar__top">
		<a href="/" class="dash-brand">
			<span class="dash-brand__mark"></span>
			<span class="dash-brand__text">HargaPas</span>
		</a>

		<div class="dash-store-badge">
			<span class="dash-store-badge__indicator"></span>
			<div>
				<p class="dash-store-badge__name">Warung Bu Sirep</p>
				<p class="dash-store-badge__sub">Dapur Aktif · 8 Menu</p>
			</div>
		</div>
	</div>

	<nav class="dash-nav">
		<p class="dash-nav__heading">Menu Utama</p>
		<ul class="dash-nav__list">
			{#each tabs as tab (tab.id)}
				<li>
					<button
						type="button"
						class="dash-nav__btn"
						class:dash-nav__btn--active={activeTab === tab.id}
						onclick={() => onselect(tab.id)}
					>
						<span class="dash-nav__icon" aria-hidden="true">
							{#if tab.icon === 'dashboard'}
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<rect x="3" y="3" width="7" height="7"></rect>
									<rect x="14" y="3" width="7" height="7"></rect>
									<rect x="14" y="14" width="7" height="7"></rect>
									<rect x="3" y="14" width="7" height="7"></rect>
								</svg>
							{:else if tab.icon === 'menu'}
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<line x1="8" y1="6" x2="21" y2="6"></line>
									<line x1="8" y1="12" x2="21" y2="12"></line>
									<line x1="8" y1="18" x2="21" y2="18"></line>
									<line x1="3" y1="6" x2="3.01" y2="6"></line>
									<line x1="3" y1="12" x2="3.01" y2="12"></line>
									<line x1="3" y1="18" x2="3.01" y2="18"></line>
								</svg>
							{:else if tab.icon === 'sparkle'}
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
								</svg>
							{:else}
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<rect x="4" y="2" width="16" height="20" rx="0"></rect>
									<line x1="8" y1="6" x2="16" y2="6"></line>
									<line x1="16" y1="14" x2="16" y2="18"></line>
									<line x1="8" y1="10" x2="8.01" y2="10"></line>
									<line x1="12" y1="10" x2="12.01" y2="10"></line>
									<line x1="16" y1="10" x2="16.01" y2="10"></line>
									<line x1="8" y1="14" x2="8.01" y2="14"></line>
									<line x1="12" y1="14" x2="12.01" y2="14"></line>
									<line x1="8" y1="18" x2="8.01" y2="18"></line>
									<line x1="12" y1="18" x2="12.01" y2="18"></line>
								</svg>
							{/if}
						</span>
						<span class="dash-nav__label">{tab.label}</span>
					</button>
				</li>
			{/each}
		</ul>
	</nav>

	<div class="dash-sidebar__foot">
		<div class="dash-plan-card">
			<div class="dash-plan-card__head">
				<span class="dash-plan-card__dot"></span>
				<span class="dash-plan-card__name">Paket Warung</span>
			</div>
			<p class="dash-plan-card__desc">Analisis HPP & Konsultan AI aktif penuh.</p>
		</div>

		<a href="/" class="dash-back-link">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="19" y1="12" x2="5" y2="12"></line>
				<polyline points="12 19 5 12 12 5"></polyline>
			</svg>
			<span>Kembali ke Beranda</span>
		</a>
	</div>
</aside>

<!-- Mobile Bottom Navigation (< 1024px) -->
<nav class="dash-bottom-nav" aria-label="Navigasi Bawah Mobile">
	{#each tabs as tab (tab.id)}
		<button
			type="button"
			class="dash-bottom-nav__btn"
			class:dash-bottom-nav__btn--active={activeTab === tab.id}
			onclick={() => onselect(tab.id)}
		>
			<span class="dash-bottom-nav__icon" aria-hidden="true">
				{#if tab.icon === 'dashboard'}
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="3" y="3" width="7" height="7"></rect>
						<rect x="14" y="3" width="7" height="7"></rect>
						<rect x="14" y="14" width="7" height="7"></rect>
						<rect x="3" y="14" width="7" height="7"></rect>
					</svg>
				{:else if tab.icon === 'menu'}
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="8" y1="6" x2="21" y2="6"></line>
						<line x1="8" y1="12" x2="21" y2="12"></line>
						<line x1="8" y1="18" x2="21" y2="18"></line>
						<line x1="3" y1="6" x2="3.01" y2="6"></line>
						<line x1="3" y1="12" x2="3.01" y2="12"></line>
						<line x1="3" y1="18" x2="3.01" y2="18"></line>
					</svg>
				{:else if tab.icon === 'sparkle'}
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
					</svg>
				{:else}
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="4" y="2" width="16" height="20"></rect>
						<line x1="8" y1="6" x2="16" y2="6"></line>
						<line x1="8" y1="10" x2="16" y2="10"></line>
						<line x1="8" y1="14" x2="16" y2="14"></line>
					</svg>
				{/if}
			</span>
			<span class="dash-bottom-nav__text">{tab.label}</span>
		</button>
	{/each}
</nav>
