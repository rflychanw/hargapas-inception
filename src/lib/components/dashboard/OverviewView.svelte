<script lang="ts">
	import { rupiah, percent } from '#lib/format.js';
	import { calcHppTotal, calcMargin } from '#lib/dashboard-data.js';
	import type { MenuItem } from './HppModal.svelte';

	interface Props {
		items: MenuItem[];
		onopenmodal?: (item: MenuItem) => void;
		onaskai?: (query: string) => void;
		oncreatemenu?: () => void;
	}

	let {
		items = [],
		onopenmodal = () => {},
		onaskai = () => {},
		oncreatemenu = () => {}
	}: Props = $props();

	let filter = $state('all'); // 'all' | 'thin' | 'healthy'
	let searchQuery = $state('');

	let processedItems = $derived(
		items.map((item) => {
			const totalHpp = calcHppTotal(item.hpp);
			const margin = calcMargin(item.price, totalHpp);
			const grossProfit = Math.max(0, item.price - totalHpp);
			const isThin = margin < 40;
			return {
				...item,
				totalHpp,
				margin,
				grossProfit,
				isThin
			};
		})
	);

	let thinCount = $derived(processedItems.filter((i) => i.isThin).length);
	let healthyCount = $derived(processedItems.filter((i) => !i.isThin).length);
	let avgMargin = $derived(
		processedItems.length > 0
			? processedItems.reduce((acc, curr) => acc + curr.margin, 0) / processedItems.length
			: 0
	);

	let filteredItems = $derived(
		processedItems.filter((i) => {
			const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase());
			if (!matchesSearch) return false;
			if (filter === 'thin') return i.isThin;
			if (filter === 'healthy') return !i.isThin;
			return true;
		})
	);
</script>

<div class="dash-view">
	<!-- Top Bar -->
	<header class="dash-topbar">
		<div>
			<h2 class="dash-topbar__title">Ringkasan Margin & Menu</h2>
			<p class="dash-topbar__sub">
				Warung Bu Sirep · Pantau kesehatan laba {items.length} menu aktif.
			</p>
		</div>

		<div class="dash-topbar__actions">
			<button type="button" class="dash-btn dash-btn--orange" onclick={oncreatemenu}>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<line x1="12" y1="5" x2="12" y2="19"></line>
					<line x1="5" y1="12" x2="19" y2="12"></line>
				</svg>
				<span>+ Tambah Menu</span>
			</button>
		</div>
	</header>

	<!-- 4 KPI Cards (Sesuai Figma Prototype) -->
	<section class="dash-kpi-grid" aria-label="Indikator Kinerja Utama">
		<div class="dash-card dash-card--kpi">
			<div class="dash-card__top">
				<span class="dash-card__label">Total Menu Aktif</span>
				<span class="dash-pill">{items.length} Menu</span>
			</div>
			<p class="dash-card__value tabular">{items.length}</p>
			<p class="dash-card__footnote">Semua terhitung 5 komponen HPP</p>
		</div>

		<div class="dash-card dash-card--kpi">
			<div class="dash-card__top">
				<span class="dash-card__label">Rata-rata Margin</span>
				<span class="dash-pill dash-pill--success">Sehat</span>
			</div>
			<p class="dash-card__value tabular">{percent(avgMargin)}</p>
			<p class="dash-card__footnote">Target warung: minimum 40.0%</p>
		</div>

		<div class="dash-card dash-card--kpi" class:dash-card--warn={thinCount > 0}>
			<div class="dash-card__top">
				<span class="dash-card__label">Perlu Perhatian</span>
				<span class="dash-pill dash-pill--orange">Margin &lt; 40%</span>
			</div>
			<p class="dash-card__value dash-card__value--accent tabular">{thinCount} Menu</p>
			<p class="dash-card__footnote">Sate ayam & Ayam geprek</p>
		</div>

		<div class="dash-card dash-card--kpi">
			<div class="dash-card__top">
				<span class="dash-card__label">Potensi Tambah Laba</span>
				<span class="dash-pill">Rekomendasi AI</span>
			</div>
			<p class="dash-card__value tabular">+Rp 1.450.000</p>
			<p class="dash-card__footnote">Per bulan jika harga disesuaikan</p>
		</div>
	</section>

	<!-- Section Tabel Menu & Margin -->
	<section class="dash-card dash-card--table" aria-labelledby="table-heading">
		<div class="dash-table-controls">
			<div class="dash-filter-tabs" role="tablist">
				<button
					type="button"
					class="dash-filter-tab"
					class:dash-filter-tab--active={filter === 'all'}
					onclick={() => (filter = 'all')}
				>
					Semua Menu ({items.length})
				</button>
				<button
					type="button"
					class="dash-filter-tab"
					class:dash-filter-tab--active={filter === 'thin'}
					onclick={() => (filter = 'thin')}
				>
					Margin Tipis ({thinCount})
				</button>
				<button
					type="button"
					class="dash-filter-tab"
					class:dash-filter-tab--active={filter === 'healthy'}
					onclick={() => (filter = 'healthy')}
				>
					Margin Sehat ({healthyCount})
				</button>
			</div>

			<div class="dash-search">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="11" cy="11" r="8"></circle>
					<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
				</svg>
				<input
					type="search"
					placeholder="Cari menu warung..."
					class="dash-search__input"
					bind:value={searchQuery}
				/>
			</div>
		</div>

		<div class="dash-table-wrap">
			<table class="dash-table">
				<thead>
					<tr>
						<th scope="col">Nama Menu</th>
						<th scope="col">Kategori</th>
						<th scope="col" class="text-right">HPP</th>
						<th scope="col" class="text-right">Harga Jual</th>
						<th scope="col" class="text-right">Margin</th>
						<th scope="col" class="text-right">Laba Kotor</th>
						<th scope="col" class="text-right">Aksi</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredItems as item (item.id)}
						<tr class:dash-row--thin={item.isThin}>
							<td>
								<strong class="dash-menu-name">{item.name}</strong>
							</td>
							<td>
								<span class="dash-badge-cat">{item.category}</span>
							</td>
							<td class="text-right tabular">{rupiah(item.totalHpp)}</td>
							<td class="text-right tabular">{rupiah(item.price)}</td>
							<td class="text-right">
								<span
									class="dash-margin-tag"
									class:dash-margin-tag--alert={item.isThin}
								>
									{percent(item.margin)}
								</span>
							</td>
							<td class="text-right tabular">{rupiah(item.grossProfit)}</td>
							<td class="text-right">
								<div class="dash-row-actions">
									<button
										type="button"
										class="dash-btn dash-btn--sm"
										onclick={() => onopenmodal(item)}
									>
										Rincian
									</button>
									<button
										type="button"
										class="dash-btn dash-btn--sm dash-btn--sparkle"
										onclick={() => onaskai(`Bagaimana cara menaikkan margin untuk ${item.name}?`)}
										title="Analisis AI untuk menu ini"
									>
										Tanya AI
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<footer class="dash-table-foot">
			<span>Menampilkan {filteredItems.length} dari {items.length} menu</span>
			<span>Margin di bawah 40.0% ditandai oranye</span>
		</footer>
	</section>
</div>
