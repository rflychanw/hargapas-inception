<!-- src/routes/[storeId]/ingredients/[id]/edit/+page.svelte -->
<script lang="ts">
	import type { Ingredient, Store } from '#lib/types/database.ts';
	import { page } from '$app/state';
	import { formatRupiah } from '#lib/utils/format.ts';
	import { Pen, Info } from '@lucide/svelte';
	import SEO from '#lib/components/SEO.svelte';
	import SelectInput from '#lib/components/SelectInput.svelte';
	import TextInput from '#lib/components/TextInput.svelte';
	import NumberInput from '#lib/components/NumberInput.svelte';
	import StickyFormBar from '#lib/components/StickyFormBar.svelte';
	import { enhance } from '$app/forms';

	interface EditIngredientPageData {
		store?: Store | Promise<Store>;
		ingredient: Promise<Ingredient>;
	}

	let { data }: { data: EditIngredientPageData } = $props();

	let storeId = $derived(page.params.storeId || '');

	let formName = $state('');
	let formPrice = $state<number | ''>('');
	let formUnit = $state('kg');
	let formCapacity = $state<number | ''>(1000);
	let previousUnit = $state('kg');
	let isFormInitialized = $state(false);

	let previewCostPerUnit = $derived(
		Number(formPrice) > 0 && Number(formCapacity) > 0 ? Number(formPrice) / Number(formCapacity) : 0
	);
	let baseUnitLabel = $derived(formUnit === 'kg' ? 'gram' : formUnit === 'liter' ? 'ml' : 'pcs');

	const unitOptions = [
		{ value: 'kg', label: 'Kilogram (kg)' },
		{ value: 'liter', label: 'Liter (liter)' },
		{ value: 'pcs', label: 'Pcs / Butir (pcs)' },
		{ value: 'pack', label: 'Pack / Kemasan' },
		{ value: 'gram', label: 'Gram (g)' },
		{ value: 'ml', label: 'Mililiter (ml)' }
	];

	$effect(() => {
		if (!isFormInitialized && data.ingredient) {
			Promise.resolve(data.ingredient).then((rawIngredient) => {
				if (rawIngredient && !isFormInitialized) {
					formName = rawIngredient.name || '';
					formPrice = Number(rawIngredient.purchasePrice) || '';
					formUnit = rawIngredient.purchaseUnit || 'kg';
					previousUnit = formUnit;
					formCapacity = Number(rawIngredient.unitCapacity) || 1;
					isFormInitialized = true;
				}
			});
		}
	});

	$effect(() => {
		if (formUnit !== previousUnit) {
			previousUnit = formUnit;
			if (formUnit === 'kg' || formUnit === 'liter') {
				formCapacity = 1000;
			} else if (
				formUnit === 'pcs' ||
				formUnit === 'pack' ||
				formUnit === 'gram' ||
				formUnit === 'ml'
			) {
				formCapacity = 1;
			}
		}
	});

	let isSubmitting = $state(false);
</script>

<SEO title="Ubah Bahan Baku" />

<div class="relative mx-auto max-w-2xl space-y-6 pb-36 font-sans sm:pb-12">
	<div class="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-8">
		<div class="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
			<div
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600"
			>
				<Pen class="h-5 w-5" />
			</div>
			<div>
				<h1 class="text-lg font-bold text-slate-900 sm:text-xl">Ubah Bahan Baku</h1>
				<p class="text-xs text-slate-500">Perbarui harga beli grosir atau rasio kapasitas.</p>
			</div>
		</div>

		{#await data.ingredient}
			<div class="space-y-5">
				<div class="h-10 w-full animate-pulse rounded-xl bg-slate-200/60"></div>
			</div>
		{:then rawIngredient}
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
				class="space-y-5"
			>
				<input type="hidden" name="id" value={rawIngredient.id} />
				<input type="hidden" name="storeId" value={storeId} />

				<TextInput
					id="name"
					name="name"
					label="Nama Bahan Baku"
					placeholder="Contoh: Kopi Robusta Roast / Ayam Fillet"
					required
					disabled={isSubmitting}
					bind:value={formName}
				/>

				<NumberInput
					id="purchasePrice"
					name="purchasePrice"
					label="Harga Beli Grosir (Rp)"
					placeholder="Contoh: 85000"
					required
					min="0"
					step="100"
					disabled={isSubmitting}
					bind:value={formPrice}
				/>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<SelectInput
						id="purchaseUnit"
						name="purchaseUnit"
						label="Satuan Pembelian"
						disabled={isSubmitting}
						bind:value={formUnit}
						options={unitOptions}
					/>
					<NumberInput
						id="unitCapacity"
						name="unitCapacity"
						label="Kapasitas Satuan Dasar"
						required
						min="1"
						disabled={isSubmitting}
						bind:value={formCapacity}
					/>
				</div>

				<div
					class="flex items-center justify-between rounded-2xl border border-orange-200 bg-orange-50/60 p-4"
				>
					<div class="flex items-center gap-1.5 text-xs font-medium text-slate-600">
						<Info class="h-4 w-4 shrink-0 text-orange-500" />
						<span>Modal per satuan dasar:</span>
					</div>
					<div class="text-xs font-extrabold text-orange-600">
						{formatRupiah(previewCostPerUnit)} / {baseUnitLabel}
					</div>
				</div>

				<StickyFormBar
					backUrl="/{storeId}/ingredients"
					saveLabel={isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
					disabled={isSubmitting}
				>
					<div class="text-xs font-bold text-slate-200">
						Modal:
						<span class="font-extrabold text-orange-400">
							{formatRupiah(previewCostPerUnit)}
						</span>
						/ {baseUnitLabel}
					</div>
				</StickyFormBar>
			</form>
		{:catch error}
			<div
				class="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-center text-xs text-rose-600"
			>
				Gagal memuat data bahan baku: {error.message || 'Terjadi kesalahan sistem.'}
			</div>
		{/await}
	</div>
</div>

