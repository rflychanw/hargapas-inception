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
		onopenmodal?: (item: MenuItem) => void;
		oncreatemenu?: () => void;
		ondeletemenu?: (id: string) => void;
	}

	let {
		items = [],
		onopenmodal = () => {},
		oncreatemenu = () => {},
		ondeletemenu = () => {}
	}: Props = $props();

	let expandedIds = $state<Record<string, boolean>>({});

	function toggleRecipe(id: string) {
		expandedIds = {
			...expandedIds,
			[id]: !expandedIds[id]
		};
	}
</script>

<div class="hp-page-stack">
	<!-- Top Banner Card -->
	<section class="hp-card hp-store-banner" data-reveal>
		<div class="hp-store-banner__main">
			<div class="hp-icon-box hp-icon-box--orange-lg" aria-hidden="true">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E64A0A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
					<path d="M7 2v20" />
					<path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
				</svg>
			</div>
			<div class="hp-store-banner__info">
				<h1 class="hp-store-banner__title">Menu & Peracik Resep HPP</h1>
				<p class="hp-store-banner__sub-desktop">
					Hubungkan menu dengan komposisi bahan baku untuk menghitung HPP per porsi secara akurat.
				</p>
			</div>
		</div>

		<button type="button" class="hp-btn-primary hp-desktop-only-btn" onclick={oncreatemenu}>
			<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
				<line x1="12" x2="12" y1="5" y2="19" />
				<line x1="5" x2="19" y1="12" y2="12" />
			</svg>
			<span>Buat Menu & Resep</span>
		</button>
	</section>

	<!-- 2-Column Menu Cards Grid -->
	<div class="hp-recipe-grid">
		{#each items as item, idx (item.id)}
			{@const totalHpp = item.hppCost !== undefined ? item.hppCost : calcHppTotal(item.hpp)}
			{@const margin = calcMargin(item.price, totalHpp)}
			{@const rCount = item.recipeCount ?? (item.recipe ? item.recipe.length : 1)}
			{@const isOpen = !!expandedIds[item.id]}

			<article class="hp-card hp-recipe-card">
				<div class="hp-recipe-card__top">
					<span class="hp-cat-pill">{item.category.toUpperCase()}</span>
					<div class="hp-icon-actions">
						<button
							type="button"
							class="hp-icon-btn"
							onclick={() => onopenmodal(item)}
							aria-label="Edit {item.name}"
							title="Edit Menu"
						>
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
							</svg>
						</button>
						<button
							type="button"
							class="hp-icon-btn hp-icon-btn--danger"
							onclick={() => ondeletemenu(item.id)}
							aria-label="Hapus {item.name}"
							title="Hapus Menu"
						>
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M3 6h18" />
								<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
								<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
								<line x1="10" x2="10" y1="11" y2="17" />
								<line x1="14" x2="14" y1="11" y2="17" />
							</svg>
						</button>
					</div>
				</div>

				<h2 class="hp-recipe-card__title">{item.name}</h2>

				<div class="hp-recipe-stats">
					<div class="hp-recipe-stats__col">
						<span class="hp-recipe-stats__label">HARGA JUAL</span>
						<span class="hp-recipe-stats__val">{formatFigmaRupiah(item.price)}</span>
					</div>
					<div class="hp-recipe-stats__col">
						<span class="hp-recipe-stats__label">HPP / PORSI</span>
						<span class="hp-recipe-stats__val">{formatFigmaRupiah(totalHpp)}</span>
					</div>
					<div class="hp-recipe-stats__col">
						<span class="hp-recipe-stats__label">MARGIN AKTIF</span>
						<span class="hp-recipe-stats__val hp-recipe-stats__val--green">
							{formatFigmaPercent(margin)}
						</span>
					</div>
				</div>

				<div class="hp-recipe-card__foot">
					<button
						type="button"
						class="hp-recipe-toggle"
						aria-expanded={isOpen}
						onclick={() => toggleRecipe(item.id)}
					>
						<span class="hp-recipe-toggle__left">
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E64A0A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<rect width="16" height="20" x="4" y="2" rx="2" />
								<line x1="8" x2="16" y1="6" y2="6" />
								<line x1="16" x2="16" y1="14" y2="18" />
								<path d="M16 10h.01" />
								<path d="M12 10h.01" />
								<path d="M8 10h.01" />
								<path d="M12 14h.01" />
								<path d="M8 14h.01" />
								<path d="M12 18h.01" />
								<path d="M8 18h.01" />
							</svg>
							<span>Komposisi Resep ({rCount} bahan)</span>
						</span>
						<svg
							class="hp-recipe-toggle__chevron"
							class:hp-recipe-toggle__chevron--open={isOpen}
							width="15"
							height="15"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="m6 9 6 6 6-6" />
						</svg>
					</button>

					{#if isOpen}
						<div class="hp-recipe-drawer">
							{#if item.recipe && item.recipe.length > 0}
								<ul class="hp-recipe-list">
									{#each item.recipe as r (r.name)}
										<li class="hp-recipe-list__row">
											<span>{r.name} ({r.qty} {r.unit})</span>
											<strong>{formatFigmaRupiah(r.cost)}</strong>
										</li>
									{/each}
								</ul>
							{:else}
								<p class="hp-recipe-empty">Total bahan baku: {formatFigmaRupiah(totalHpp)}</p>
							{/if}
						</div>
					{/if}
				</div>
			</article>
		{/each}
	</div>

	<!-- Mobile Floating Action Button (+) -->
	<button
		type="button"
		class="hp-fab"
		onclick={oncreatemenu}
		aria-label="Buat Menu & Resep"
		title="Buat Menu & Resep"
	>
		<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round">
			<line x1="12" x2="12" y1="5" y2="19" />
			<line x1="5" x2="19" y1="12" y2="12" />
		</svg>
	</button>
</div>
