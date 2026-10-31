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

	let selectedCat = $state('Semua');
	const categories = ['Semua', 'Makanan Utama', 'Lauk Pendamping', 'Minuman', 'Camilan'];

	let filtered = $derived(
		selectedCat === 'Semua' ? items : items.filter((i) => i.category === selectedCat)
	);
</script>

<div class="dash-view">
	<header class="dash-topbar">
		<div>
			<h2 class="dash-topbar__title">Daftar Menu & Komposisi HPP</h2>
			<p class="dash-topbar__sub">
				Rincian struktur 5 komponen biaya untuk setiap porsi hidangan.
			</p>
		</div>

		<div class="dash-topbar__actions">
			<button type="button" class="dash-btn dash-btn--orange" onclick={oncreatemenu}>
				+ Tambah Menu Baru
			</button>
		</div>
	</header>

	<!-- Filter Chips Kategori -->
	<div class="dash-cat-chips" role="group" aria-label="Filter kategori">
		{#each categories as cat (cat)}
			<button
				type="button"
				class="dash-cat-chip"
				class:dash-cat-chip--active={selectedCat === cat}
				onclick={() => (selectedCat = cat)}
			>
				{cat}
			</button>
		{/each}
	</div>

	<!-- Cards Grid (sesuai desktop_r2_4.png) -->
	<div class="dash-menu-grid">
		{#each filtered as item (item.id)}
			{@const totalHpp = calcHppTotal(item.hpp)}
			{@const margin = calcMargin(item.price, totalHpp)}
			{@const isThin = margin < 40}

			<article class="dash-card dash-menu-card" class:dash-menu-card--warn={isThin}>
				<div class="dash-menu-card__head">
					<div>
						<span class="dash-badge-cat">{item.category}</span>
						<h3 class="dash-menu-card__name">{item.name}</h3>
					</div>
					<span
						class="dash-margin-tag"
						class:dash-margin-tag--alert={isThin}
					>
						Margin {percent(margin)}
					</span>
				</div>

				<div class="dash-menu-card__figures">
					<div>
						<span class="dash-menu-card__fig-label">Harga Jual</span>
						<p class="dash-menu-card__fig-val tabular">{rupiah(item.price)}</p>
					</div>
					<div>
						<span class="dash-menu-card__fig-label">Total HPP</span>
						<p class="dash-menu-card__fig-val tabular">{rupiah(totalHpp)}</p>
					</div>
					<div>
						<span class="dash-menu-card__fig-label">Laba Bersih</span>
						<p class="dash-menu-card__fig-val tabular">{rupiah(Math.max(0, item.price - totalHpp))}</p>
					</div>
				</div>

				<!-- Visual Komponen HPP Breakdown -->
				<div class="dash-hpp-bars">
					<p class="dash-hpp-bars__title">Komposisi 5 Komponen:</p>

					<div class="dash-bar-row">
						<span>Bahan baku</span>
						<div class="dash-bar-track">
							<div
								class="dash-bar-fill"
								style="width: {totalHpp > 0 ? (item.hpp.bahan / totalHpp) * 100 : 0}%"
							></div>
						</div>
						<span class="tabular">{rupiah(item.hpp.bahan)}</span>
					</div>

					<div class="dash-bar-row">
						<span>Kemasan</span>
						<div class="dash-bar-track">
							<div
								class="dash-bar-fill"
								style="width: {totalHpp > 0 ? (item.hpp.kemasan / totalHpp) * 100 : 0}%"
							></div>
						</div>
						<span class="tabular">{rupiah(item.hpp.kemasan)}</span>
					</div>

					<div class="dash-bar-row">
						<span>Gas & listrik</span>
						<div class="dash-bar-track">
							<div
								class="dash-bar-fill"
								style="width: {totalHpp > 0 ? (item.hpp.energi / totalHpp) * 100 : 0}%"
							></div>
						</div>
						<span class="tabular">{rupiah(item.hpp.energi)}</span>
					</div>

					<div class="dash-bar-row">
						<span>Tenaga kerja</span>
						<div class="dash-bar-track">
							<div
								class="dash-bar-fill"
								style="width: {totalHpp > 0 ? (item.hpp.tenaga / totalHpp) * 100 : 0}%"
							></div>
						</div>
						<span class="tabular">{rupiah(item.hpp.tenaga)}</span>
					</div>

					<div class="dash-bar-row">
						<span>Susut & sisa</span>
						<div class="dash-bar-track">
							<div
								class="dash-bar-fill"
								style="width: {totalHpp > 0 ? (item.hpp.susut / totalHpp) * 100 : 0}%"
							></div>
						</div>
						<span class="tabular">{rupiah(item.hpp.susut)}</span>
					</div>
				</div>

				<div class="dash-menu-card__foot">
					<button
						type="button"
						class="dash-btn dash-btn--sm"
						onclick={() => onopenmodal(item)}
					>
						Ubah 5 Komponen HPP
					</button>

					<button
						type="button"
						class="dash-btn dash-btn--sm dash-btn--ghost"
						onclick={() => onaskai(`Bagaimana strategi harga optimal untuk ${item.name}?`)}
					>
						Tanya AI
					</button>
				</div>
			</article>
		{/each}
	</div>
</div>
