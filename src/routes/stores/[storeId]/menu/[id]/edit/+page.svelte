<!-- src/routes/[storeId]/menu/[id]/edit/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import type { Ingredient } from '#lib/types/database.ts';
	import { page } from '$app/state';
	import { formatRupiah } from '#lib/utils/format.ts';
	import { CirclePlus, Trash, Pen } from '@lucide/svelte';
	import SEO from '#lib/components/SEO.svelte';
	import SelectInput from '#lib/components/SelectInput.svelte';
	import TextInput from '#lib/components/TextInput.svelte';
	import NumberInput from '#lib/components/NumberInput.svelte';
	import StickyFormBar from '#lib/components/StickyFormBar.svelte';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();

	let isSubmitting = $state(false);

	let storeId = $derived(page.params.storeId || '');

	let formName = $state('');
	let formPrice = $state<number | ''>('');
	let formCategory = $state('Minuman');
	let formIngredients = $state<Array<{ ingredientId: string; quantityUsed: number }>>([]);
	let isFormInitialized = $state(false);

	const categoryOptions = [
		{ value: 'Minuman', label: 'Minuman' },
		{ value: 'Makanan', label: 'Makanan' },
		{ value: 'Camilan', label: 'Camilan' },
		{ value: 'Paket', label: 'Paket' }
	];

	// Inisialisasi state form satu kali setelah data menuItem ter-stream
	$effect(() => {
		if (!isFormInitialized && data.menuItem && data.ingredients) {
			Promise.all([Promise.resolve(data.menuItem), Promise.resolve(data.ingredients)]).then(
				([menuItem, rawIngredients]) => {
					if (menuItem) {
						formName = menuItem.name || '';
						formPrice = Number(menuItem.sellingPrice) || '';
						formCategory = menuItem.category || 'Minuman';

						if (menuItem.ingredients && menuItem.ingredients.length > 0) {
							formIngredients = menuItem.ingredients.map((i) => ({
								ingredientId: i.ingredientId,
								quantityUsed: Number(i.quantityUsed)
							}));
						} else if (rawIngredients && rawIngredients.length > 0) {
							formIngredients = [{ ingredientId: rawIngredients[0].id, quantityUsed: 1 }];
						}

						isFormInitialized = true;
					}
				}
			);
		}
	});

	function addIngredientRow(firstIngredientId: string = '') {
		formIngredients = [...formIngredients, { ingredientId: firstIngredientId, quantityUsed: 1 }];
	}

	function removeIngredientRow(index: number) {
		if (formIngredients.length > 1) {
			formIngredients = formIngredients.filter((_, idx) => idx !== index);
		}
	}
</script>

<SEO title="Ubah Menu & Resep" />

<div class="relative mx-auto max-w-3xl space-y-6 pb-36 font-sans sm:pb-12">
	<div class="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-8">
		<!-- Header Form Instan -->
		<div class="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
			<div
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600"
			>
				<Pen class="h-5 w-5" />
			</div>
			<div>
				<h1 class="text-lg font-bold text-slate-900 sm:text-xl">Ubah Menu & Resep</h1>
				<p class="text-xs text-slate-500">Perbarui harga jual atau komposisi resep.</p>
			</div>
		</div>

		{#await Promise.all([Promise.resolve(data.menuItem), Promise.resolve(data.ingredients)])}
			<!-- SKELETON LOADER ANIMATED STREAMING -->
			<div class="animate-pulse space-y-6">
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div class="space-y-2 sm:col-span-2">
						<div class="h-4 w-24 rounded-md bg-slate-200"></div>
						<div class="h-11 w-full rounded-2xl bg-slate-100"></div>
					</div>
					<div class="space-y-2">
						<div class="h-4 w-16 rounded-md bg-slate-200"></div>
						<div class="h-11 w-full rounded-2xl bg-slate-100"></div>
					</div>
				</div>

				<div class="space-y-2">
					<div class="h-4 w-32 rounded-md bg-slate-200"></div>
					<div class="h-11 w-full rounded-2xl bg-slate-100"></div>
				</div>

				<div class="space-y-4 border-t border-slate-100 pt-5">
					<div class="flex items-center justify-between">
						<div class="h-4 w-44 rounded-md bg-slate-200"></div>
						<div class="h-4 w-24 rounded-md bg-slate-200"></div>
					</div>

					<div class="space-y-3">
						{#each Array(2) as _, i}
							<div
								class="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 sm:flex-row sm:items-center sm:justify-between"
							>
								<div class="h-10 flex-1 rounded-xl bg-slate-200/80"></div>
								<div class="flex items-center gap-3">
									<div class="h-10 w-28 rounded-xl bg-slate-200/80"></div>
									<div class="h-4 w-16 rounded-md bg-slate-200/80"></div>
									<div class="h-9 w-9 rounded-xl bg-slate-200/60"></div>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Skeleton Sticky Bar -->
				<div
					class="fixed bottom-4 left-1/2 z-30 flex w-[calc(100%-2rem)] -translate-x-1/2 items-center justify-between rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-xl backdrop-blur-md sm:max-w-3xl"
				>
					<div class="h-8 w-48 rounded-xl bg-slate-200"></div>
					<div class="h-10 w-36 rounded-xl bg-orange-200"></div>
				</div>
			</div>
		{:then [menuItem, rawIngredients]}
			{@const ingredientList = (rawIngredients as Ingredient[]) || []}
			{@const ingredientMap = new Map(ingredientList.map((i) => [i.id, i]))}
			{@const ingredientOptions = ingredientList.map((ing) => ({
				value: ing.id,
				label: `${ing.name} (${formatRupiah(ing.costPerUnit ?? 0)}/${
					ing.purchaseUnit === 'kg'
						? 'g'
						: ing.purchaseUnit === 'liter'
							? 'ml'
							: ing.purchaseUnit || 'pcs'
				})`
			}))}

			{@const calculatedHpp = formIngredients.reduce((total, row) => {
				const ing = ingredientMap.get(row.ingredientId);
				if (ing && Number(row.quantityUsed) > 0) {
					const cost = Number(ing.costPerUnit ?? 0);
					return total + cost * Number(row.quantityUsed);
				}
				return total;
			}, 0)}
			{@const calculatedProfit = Number(formPrice || 0) - calculatedHpp}
			{@const calculatedMargin =
				Number(formPrice || 0) > 0 ? calculatedProfit / Number(formPrice || 0) : 0}

			<form
				method="POST"
				action="?/update"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						isSubmitting = false;
						await update();
					};
				}}
				class="space-y-6"
			>
				<input type="hidden" name="id" value={menuItem?.id || ''} />
				<input type="hidden" name="storeId" value={storeId} />
				<input type="hidden" name="ingredientsJson" value={JSON.stringify(formIngredients)} />

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div class="sm:col-span-2">
						<TextInput
							id="name"
							name="name"
							label="Nama Menu"
							placeholder="Contoh: Es Kopi Susu Aren"
							required
							disabled={isSubmitting}
							bind:value={formName}
						/>
					</div>
					<div>
						<SelectInput
							id="category"
							name="category"
							label="Kategori"
							disabled={isSubmitting}
							bind:value={formCategory}
							options={categoryOptions}
						/>
					</div>
				</div>

				<NumberInput
					id="sellingPrice"
					name="sellingPrice"
					label="Harga Jual Target (Rp)"
					placeholder="Contoh: 18000"
					required
					min="0"
					step="500"
					disabled={isSubmitting}
					bind:value={formPrice}
				/>

				<div class="space-y-3 border-t border-slate-100 pt-5">
					<div class="flex items-center justify-between">
						<span class="text-xs font-bold text-slate-800 sm:text-sm">
							Komposisi Bahan Resep ({formIngredients.length})
						</span>
						<button
							type="button"
							disabled={isSubmitting}
							onclick={() => addIngredientRow(ingredientList[0]?.id || '')}
							class="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 transition-colors hover:text-orange-700 disabled:opacity-50"
						>
							<CirclePlus class="h-4 w-4" />
							<span>Tambah Bahan</span>
						</button>
					</div>

					<div class="space-y-3">
						{#each formIngredients as row, idx (idx)}
							{@const selectedIng = ingredientMap.get(row.ingredientId)}
							{@const costPerUnit = Number(selectedIng?.costPerUnit ?? 0)}
							{@const rowCost = selectedIng ? costPerUnit * Number(row.quantityUsed || 0) : 0}

							<div
								class="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3 sm:flex-row sm:items-center sm:justify-between"
							>
								<div class="flex-1">
									<SelectInput
										id="ingredient-{idx}"
										name="ingredientId-{idx}"
										label=""
										disabled={isSubmitting}
										bind:value={row.ingredientId}
										options={ingredientOptions}
									/>
								</div>

								<div class="flex items-center justify-between gap-3 sm:justify-end">
									<div class="w-32">
										<NumberInput
											id="quantity-{idx}"
											name="quantityUsed-{idx}"
											label=""
											placeholder="Porsi"
											required
											min="0.01"
											step="any"
											disabled={isSubmitting}
											bind:value={row.quantityUsed}
										/>
									</div>

									<div class="w-24 text-right text-xs font-extrabold text-slate-900">
										{formatRupiah(rowCost)}
									</div>

									{#if formIngredients.length > 1}
										<button
											type="button"
											disabled={isSubmitting}
											onclick={() => removeIngredientRow(idx)}
											class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
											title="Hapus baris bahan"
										>
											<Trash class="h-4 w-4" />
										</button>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- STICKY ACTION BAR DENGAN METRIK HPP -->
				<StickyFormBar
					backUrl="/{storeId}/menu"
					saveLabel={isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
					disabled={isSubmitting}
					{calculatedHpp}
					{calculatedProfit}
					{calculatedMargin}
					targetMargin={0.35}
				/>
			</form>
		{:catch error}
			<div
				class="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-center text-xs text-rose-600"
			>
				Gagal memuat data menu atau resep: {error.message || 'Terjadi kesalahan sistem.'}
			</div>
		{/await}
	</div>
</div>
