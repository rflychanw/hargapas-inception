<!-- src/routes/[storeId]/menu/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/state';
	import { formatRupiah, formatPercent } from '#lib/utils/format.ts';
	import {
		Plus,
		UtensilsCrossed,
		ChevronDown,
		ChevronUp,
		Calculator,
		Pen,
		Trash,
		LoaderCircle
	} from '@lucide/svelte';
	import SEO from '#lib/components/SEO.svelte';
	import { slide } from 'svelte/transition';
	import Fab from '#lib/components/Fab.svelte';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();

	let storeId = $derived(page.params.storeId || '');

	let expandedMenuId = $state<string | null>(null);
	let animatingMenuId = $state<string | null>(null);
	let deletingMenuItemId = $state<string | null>(null);

	function clickOutsideCard(node: HTMLElement, menuId: string) {
		const handleClick = (event: MouseEvent) => {
			if (expandedMenuId === menuId && !node.contains(event.target as Node)) {
				animatingMenuId = menuId;
				expandedMenuId = null;
			}
		};
		document.addEventListener('click', handleClick, true);
		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			}
		};
	}

	function toggleExpand(id: string, e?: MouseEvent) {
		e?.stopPropagation();
		if (expandedMenuId === id) {
			animatingMenuId = id;
			expandedMenuId = null;
		} else {
			if (expandedMenuId) {
				animatingMenuId = expandedMenuId;
			}
			expandedMenuId = id;
		}
	}
</script>

<SEO title="Menu & Resep" />

<div class="relative space-y-6 font-sans sm:space-y-8">
	<div
		class="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:rounded-3xl sm:p-6 md:p-8"
	>
		<div class="flex items-center gap-3">
			<div
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-600 sm:h-12 sm:w-12 sm:rounded-2xl"
			>
				<UtensilsCrossed class="h-5 w-5 sm:h-6 sm:w-6" />
			</div>
			<div class="min-w-0 flex-1">
				<h1 class="truncate text-base font-extrabold text-slate-900 sm:text-2xl md:text-3xl">
					Menu & Peracik Resep HPP
				</h1>
				<p class="hidden text-xs font-medium text-slate-500 sm:block sm:text-sm">
					Hubungkan menu dengan komposisi bahan baku untuk menghitung HPP per porsi secara akurat.
				</p>
			</div>
		</div>

		<a
			href="/{storeId}/menu/new"
			class="hidden shrink-0 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95 sm:inline-flex"
		>
			<Plus class="h-4 w-4" />
			<span>Buat Menu & Resep</span>
		</a>
	</div>

	{#await Promise.all([Promise.resolve(data.store), data.menuItems])}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			{#each Array(4) as _, i (i)}
				<div
					class="flex min-h-65 w-full flex-col justify-between space-y-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs"
				>
					<div class="h-6 w-36 animate-pulse rounded-lg bg-slate-200/80"></div>
				</div>
			{/each}
		</div>
	{:then [storeObj, menuItems]}
		{@const targetMargin = storeObj?.targetMargin ?? 0.35}

		{#if menuItems.length === 0}
			<div
				class="space-y-4 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-xs sm:p-12"
			>
				<div
					class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-500"
				>
					<UtensilsCrossed class="h-7 w-7" />
				</div>
				<div>
					<h3 class="text-base font-bold text-slate-900">Belum Ada Menu Terdaftar</h3>
					<p class="mx-auto mt-1 max-w-sm text-xs font-medium text-slate-400">
						Pastikan bahan baku sudah terisi, lalu buat resep menu pertama Anda untuk melihat
						kalkulasi HPP dan margin otomatis.
					</p>
				</div>
				<a
					href="/{storeId}/menu/new"
					class="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95"
				>
					<Plus class="h-4 w-4" />
					<span>Buat Menu Sekarang</span>
				</a>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				{#each menuItems as item (item.id)}
					{@const hppVal = Number(item.totalHpp ?? 0)}
					{@const sellPrice = Number(item.sellingPrice ?? 0)}
					{@const profit = sellPrice - hppVal}
					{@const margin = sellPrice > 0 ? profit / sellPrice : 0}
					{@const isHealthy = margin >= targetMargin}
					{@const isExpanded = expandedMenuId === item.id}
					{@const isAnimating = animatingMenuId === item.id}

					<div class="relative min-h-65 w-full">
						<div
							use:clickOutsideCard={item.id}
							role="button"
							tabindex="0"
							onclick={() => {
								if (expandedMenuId && !isExpanded) {
									animatingMenuId = expandedMenuId;
									expandedMenuId = item.id;
								}
							}}
							onkeydown={(e) => {
								if ((e.key === 'Enter' || e.key === ' ') && expandedMenuId && !isExpanded) {
									e.preventDefault();
									animatingMenuId = expandedMenuId;
									expandedMenuId = item.id;
								}
							}}
							class="top-0 left-0 flex w-full flex-col justify-between space-y-5 rounded-3xl border border-slate-200/80 bg-white p-6 transition-all duration-300 focus:outline-none {isExpanded ||
							isAnimating
								? 'absolute z-40 shadow-2xl ring-2 ring-orange-500/20'
								: 'relative z-10 shadow-xs hover:shadow-md'}"
						>
							<div class="flex items-start justify-between gap-3">
								<div>
									<span
										class="rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-orange-700 uppercase"
									>
										{item.category || 'General'}
									</span>
									<h3 class="mt-2 text-lg font-bold text-slate-900">
										{item.name}
									</h3>
								</div>

								<div class="flex items-center gap-1">
									<a
										href="/{storeId}/menu/{item.id}/edit"
										onclick={(e) => e.stopPropagation()}
										class="rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-800"
										title="Ubah menu dan resep"
									>
										<Pen class="h-4 w-4" />
									</a>

									<form
										method="POST"
										action="?/delete"
										class="inline"
										use:enhance={({ cancel }) => {
											if (!confirm(`Hapus menu "${item.name}"?`)) {
												cancel();
												return;
											}

											deletingMenuItemId = item.id;

											return async ({ update }) => {
												deletingMenuItemId = null;
												await update();
											};
										}}
									>
										<input type="hidden" name="id" value={item.id} />
										<input type="hidden" name="storeId" value={storeId} />

										<button
											type="submit"
											disabled={deletingMenuItemId === item.id}
											class="rounded-xl p-2 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
											title="Hapus menu"
										>
											{#if deletingMenuItemId === item.id}
												<LoaderCircle class="h-4 w-4 animate-spin text-rose-600" />
											{:else}
												<Trash class="h-4 w-4" />
											{/if}
										</button>
									</form>
								</div>
							</div>

							<div
								class="grid grid-cols-3 gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-center"
							>
								<div>
									<div class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
										Harga Jual
									</div>
									<div class="mt-1 text-sm font-extrabold text-slate-900">
										{formatRupiah(sellPrice)}
									</div>
								</div>
								<div>
									<div class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
										HPP / Porsi
									</div>
									<div class="mt-1 text-sm font-extrabold text-slate-800">
										{formatRupiah(hppVal)}
									</div>
								</div>
								<div>
									<div class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
										Margin Aktif
									</div>
									<div
										class="mt-1 text-sm font-extrabold {isHealthy
											? 'text-emerald-600'
											: 'text-orange-600'}"
									>
										{formatPercent(margin)}
									</div>
								</div>
							</div>

							<div class="border-t border-slate-100 pt-3">
								<button
									onclick={(e) => toggleExpand(item.id, e)}
									class="flex w-full cursor-pointer items-center justify-between py-1 text-xs font-bold text-slate-600 transition-colors hover:text-slate-900"
								>
									<span class="flex items-center gap-2">
										<Calculator class="h-4 w-4 text-orange-500" />
										<span>Komposisi Resep ({(item.ingredients || []).length} bahan)</span>
									</span>
									{#if isExpanded}
										<ChevronUp class="h-4 w-4 text-slate-400" />
									{:else}
										<ChevronDown class="h-4 w-4 text-slate-400" />
									{/if}
								</button>

								{#if isExpanded}
									<div
										transition:slide={{ duration: 250 }}
										onoutroend={() => {
											if (animatingMenuId === item.id) {
												animatingMenuId = null;
											}
										}}
									>
										<div
											class="mt-3 space-y-2 rounded-2xl border border-slate-200/60 bg-slate-50/80 p-4 text-xs font-medium"
										>
											{#if (item.ingredients || []).length === 0}
												<p class="py-1 text-center text-slate-400">
													Belum ada bahan dalam resep ini.
												</p>
											{:else}
												{#each item.ingredients as ing (ing.id)}
													<div class="flex items-center justify-between text-slate-700">
														<span>
															{ing.ingredientName}
															<span class="text-slate-400"
																>({ing.quantityUsed}
																{ing.purchaseUnit === 'kg'
																	? 'g'
																	: ing.purchaseUnit === 'liter'
																		? 'ml'
																		: ing.purchaseUnit || 'pcs'})</span
															>
														</span>
														<span class="font-bold text-slate-900"
															>{formatRupiah(ing.subtotalCost ?? 0)}</span
														>
													</div>
												{/each}
											{/if}
										</div>
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{:catch error}
		<div
			class="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-center text-xs text-rose-600"
		>
			Gagal memuat data menu: {error.message || 'Terjadi kesalahan sistem.'}
		</div>
	{/await}

	<Fab href="/{storeId}/menu/new" label="Buat Menu & Resep Baru" />
</div>

