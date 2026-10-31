<script lang="ts">
	import {
		calcHppTotal,
		calcMargin,
		formatFigmaPercent,
		formatFigmaRupiah
	} from '#lib/dashboard-data.js';
	import type { MenuItem } from './HppModal.svelte';

	interface Props {
		items: MenuItem[];
		storeName?: string;
		targetMargin?: number;
		oneditstore?: () => void;
	}

	let {
		items = [],
		storeName = 'Warkop Ceria Bingit',
		targetMargin = 30,
		oneditstore = () => {}
	}: Props = $props();

	let processedItems = $derived(
		items.map((item) => {
			const totalHpp = item.hppCost !== undefined ? item.hppCost : calcHppTotal(item.hpp);
			const margin = calcMargin(item.price, totalHpp);
			const isStar = margin >= targetMargin;
			return {
				...item,
				totalHpp,
				margin,
				isStar
			};
		})
	);

	let avgMargin = $derived(
		processedItems.length > 0
			? processedItems.reduce((acc, curr) => acc + curr.margin, 0) / processedItems.length
			: 0
	);

	let marginDiff = $derived(avgMargin - targetMargin);
	let starCount = $derived(processedItems.filter((i) => i.isStar).length);
	let evalCount = $derived(processedItems.filter((i) => !i.isStar).length);
	let starPct = $derived(
		processedItems.length > 0 ? Math.round((starCount / processedItems.length) * 100) : 0
	);
</script>

<div class="hp-page-stack">
	<!-- Store Banner Card -->
	<section class="hp-card hp-store-banner" data-reveal>
		<div class="hp-store-banner__main">
			<div class="hp-icon-box hp-icon-box--orange-lg" aria-hidden="true">
				<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E64A0A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
					<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
					<path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
					<path d="M2 7h20" />
					<path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7" />
				</svg>
			</div>
			<div class="hp-store-banner__info">
				<h1 class="hp-store-banner__title">{storeName}</h1>
				<p class="hp-store-banner__sub-desktop">Target Margin: {targetMargin}%</p>
				<div class="hp-store-banner__sub-mobile">
					<span class="hp-target-pill-orange">
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
							<circle cx="12" cy="12" r="9" />
							<circle cx="12" cy="12" r="4" />
						</svg>
						<span>{targetMargin}%</span>
					</span>
				</div>
			</div>
		</div>

		<button type="button" class="hp-btn-outline hp-store-banner__action" onclick={oneditstore}>
			<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<line x1="4" x2="14" y1="7" y2="7" />
				<line x1="18" x2="20" y1="7" y2="7" />
				<line x1="15" x2="15" y1="4" y2="10" />
				<line x1="4" x2="6" y1="17" y2="17" />
				<line x1="10" x2="20" y1="17" y2="17" />
				<line x1="9" x2="9" y1="14" y2="20" />
			</svg>
			<span>Edit Pengaturan Toko</span>
		</button>
	</section>

	<!-- 4 KPI Cards Grid -->
	<section class="hp-kpi-grid" aria-label="Indikator Performa Utama">
		<!-- KPI 1: Total Varian Menu -->
		<div class="hp-card hp-kpi-card" data-reveal data-delay="1">
			<div class="hp-kpi-card__top">
				<span class="hp-kpi-card__num hp-kpi-card__num--slate">{processedItems.length}</span>
				<span class="hp-kpi-icon hp-kpi-icon--slate" aria-hidden="true">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
						<path d="M3 6h18" />
						<path d="M16 10a4 4 0 0 1-8 0" />
					</svg>
				</span>
			</div>
			<hr class="hp-kpi-card__divider" />
			<div class="hp-kpi-card__bottom">
				<p class="hp-kpi-card__label">Total Varian Menu</p>
				<p class="hp-kpi-card__sub">{processedItems.length} resep aktif terdaftar</p>
			</div>
		</div>

		<!-- KPI 2: Rata-rata Margin -->
		<div class="hp-card hp-kpi-card" data-reveal data-delay="2">
			<div class="hp-kpi-card__top">
				<span class="hp-kpi-card__num hp-kpi-card__num--orange">{formatFigmaPercent(avgMargin)}</span>
				<span class="hp-kpi-icon hp-kpi-icon--orange" aria-hidden="true">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="19" x2="5" y1="5" y2="19" />
						<circle cx="6.5" cy="6.5" r="2.5" />
						<circle cx="17.5" cy="17.5" r="2.5" />
					</svg>
				</span>
			</div>
			<hr class="hp-kpi-card__divider" />
			<div class="hp-kpi-card__bottom">
				<p class="hp-kpi-card__label">Rata-rata Margin</p>
				<div class="hp-kpi-card__sub-row">
					<span class="hp-kpi-card__sub">Target: {targetMargin}%</span>
					<span class="hp-kpi-card__delta" class:hp-kpi-card__delta--neg={marginDiff < 0}>
						{marginDiff >= 0 ? '+' : ''}{formatFigmaPercent(marginDiff)}
					</span>
				</div>
			</div>
		</div>

		<!-- KPI 3: Menu Bintang -->
		<div class="hp-card hp-kpi-card" data-reveal data-delay="3">
			<div class="hp-kpi-card__top">
				<span class="hp-kpi-card__num hp-kpi-card__num--green">{starCount}</span>
				<span class="hp-kpi-icon hp-kpi-icon--green" aria-hidden="true">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 3v18h18" />
						<path d="m19 9-5 5-4-4-3 3" />
					</svg>
				</span>
			</div>
			<hr class="hp-kpi-card__divider" />
			<div class="hp-kpi-card__bottom">
				<p class="hp-kpi-card__label">Menu Bintang</p>
				<p class="hp-kpi-card__sub">{starPct}% dari total katalog</p>
			</div>
		</div>

		<!-- KPI 4: Perlu Evaluasi -->
		<div class="hp-card hp-kpi-card" data-reveal data-delay="4">
			<div class="hp-kpi-card__top">
				<span class="hp-kpi-card__num hp-kpi-card__num--rose">{evalCount}</span>
				<span class="hp-kpi-icon hp-kpi-icon--rose" aria-hidden="true">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="19" x2="5" y1="5" y2="19" />
						<circle cx="6.5" cy="6.5" r="2.5" />
						<circle cx="17.5" cy="17.5" r="2.5" />
					</svg>
				</span>
			</div>
			<hr class="hp-kpi-card__divider" />
			<div class="hp-kpi-card__bottom">
				<p class="hp-kpi-card__label">Perlu Evaluasi</p>
				<p class="hp-kpi-card__sub">
					{evalCount === 0 ? 'Semua menu sehat' : `${evalCount} menu di bawah target`}
				</p>
			</div>
		</div>
	</section>

	<!-- Analisis Performa HPP Menu Table Card -->
	<section class="hp-card hp-table-card" data-reveal data-delay="2">
		<div class="hp-table-card__head">
			<h2 class="hp-table-card__title">Analisis Performa HPP Menu</h2>
		</div>

		<div class="hp-table-scroll">
			<table class="hp-table">
				<thead>
					<tr>
						<th scope="col">Nama Menu</th>
						<th scope="col">Harga Jual</th>
						<th scope="col">HPP (Modal)</th>
						<th scope="col">Margin Keuntungan</th>
						<th scope="col">Status Target</th>
					</tr>
				</thead>
				<tbody>
					{#each processedItems as item (item.id)}
						<tr>
							<td class="hp-td-bold">{item.name}</td>
							<td class="hp-td-regular">{formatFigmaRupiah(item.price)}</td>
							<td class="hp-td-regular">{formatFigmaRupiah(item.totalHpp)}</td>
							<td>
								<span
									class="hp-margin-val"
									class:hp-margin-val--green={item.isStar}
									class:hp-margin-val--rose={!item.isStar}
								>
									{formatFigmaPercent(item.margin)}
								</span>
							</td>
							<td>
								{#if item.isStar}
									<span class="hp-status-badge hp-status-badge--ok">Sesuai Target</span>
								{:else}
									<span class="hp-status-badge hp-status-badge--warn">Perlu Evaluasi</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
</div>
