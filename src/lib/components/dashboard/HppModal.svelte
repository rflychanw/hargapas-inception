<script lang="ts">
	import {
		calcHppTotal,
		calcMargin,
		formatFigmaPercent,
		formatFigmaRupiah
	} from '#lib/dashboard-data.js';
	import type { IngredientItem } from './CalculatorView.svelte';

	export interface RecipeRow {
		ingredientId?: string;
		name: string;
		qty: number;
		unit: string;
		cost: number;
	}

	export interface MenuItem {
		id: string;
		name: string;
		category: string;
		price: number;
		hppCost?: number;
		recipeCount?: number;
		recipe?: RecipeRow[];
		hpp: {
			bahan: number;
			kemasan: number;
			energi: number;
			tenaga: number;
			susut: number;
		};
		monthlySales?: number;
	}

	interface Props {
		item: MenuItem | null;
		isNew?: boolean;
		availableIngredients?: IngredientItem[];
		onclose?: () => void;
		onsave?: (updated: MenuItem) => void;
	}

	let {
		item = null,
		isNew = false,
		availableIngredients = [],
		onclose = () => {},
		onsave = () => {}
	}: Props = $props();

	let formName = $state('');
	let formCategory = $state('MAKANAN');
	let formPrice = $state(12000);
	let formRows = $state<Array<{ ingredientId: string; qty: number }>>([]);

	$effect(() => {
		if (item) {
			formName = item.name;
			formCategory = (item.category || 'MAKANAN').toUpperCase();
			formPrice = item.price;

			if (item.recipe && item.recipe.length > 0) {
				formRows = item.recipe.map((r) => {
					const matched =
						availableIngredients.find((ing) => ing.id === r.ingredientId) ||
						availableIngredients.find((ing) => ing.name.toLowerCase() === r.name.toLowerCase());
					return {
						ingredientId: matched?.id || r.ingredientId || availableIngredients[0]?.id || '',
						qty: Number(r.qty) || 1
					};
				});
			} else if (availableIngredients.length > 0) {
				formRows = [{ ingredientId: availableIngredients[0].id, qty: 1 }];
			} else {
				formRows = [];
			}
		}
	});

	let ingMap = $derived(new Map(availableIngredients.map((i) => [i.id, i])));

	let computedRecipeRows = $derived(
		formRows
			.filter((r) => r.ingredientId && Number(r.qty) > 0)
			.map((r) => {
				const ing = ingMap.get(r.ingredientId);
				const unitCost = Number(ing?.unitCost ?? 0);
				const qty = Number(r.qty) || 0;
				return {
					ingredientId: r.ingredientId,
					name: ing?.name || 'Bahan',
					qty,
					unit: ing?.baseUnit || 'pcs',
					cost: Math.round(unitCost * qty)
				};
			})
	);

	let calculatedHpp = $derived(
		computedRecipeRows.length > 0
			? computedRecipeRows.reduce((acc, r) => acc + r.cost, 0)
			: item
				? item.hppCost !== undefined
					? item.hppCost
					: calcHppTotal(item.hpp)
				: 0
	);

	let currentMargin = $derived(calcMargin(formPrice, calculatedHpp));

	function addIngredientRow() {
		const defaultId = availableIngredients[0]?.id || '';
		formRows = [...formRows, { ingredientId: defaultId, qty: 1 }];
	}

	function removeIngredientRow(idx: number) {
		if (formRows.length > 1) {
			formRows = formRows.filter((_, i) => i !== idx);
		}
	}

	function handleSave(e: SubmitEvent) {
		e.preventDefault();
		if (!item || !formName.trim()) return;
		onsave({
			...item,
			name: formName.trim(),
			category: formCategory,
			price: Number(formPrice) || 0,
			hppCost: calculatedHpp,
			recipeCount: computedRecipeRows.length,
			recipe: computedRecipeRows,
			hpp: {
				bahan: calculatedHpp,
				kemasan: 0,
				energi: 0,
				tenaga: 0,
				susut: 0
			}
		});
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if item}
	<div class="hp-modal-backdrop">
		<button
			type="button"
			class="hp-modal-scrim"
			onclick={onclose}
			aria-label="Tutup modal"
		></button>
		<div
			class="hp-modal"
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			aria-labelledby="modal-title"
		>
			<header class="hp-modal__head">
				<div>
					<p class="hp-modal__tag">MENU & PERACIK RESEP HPP</p>
					<h3 id="modal-title" class="hp-modal__title">
						{isNew ? 'Buat Menu & Resep Baru' : `Edit ${item.name}`}
					</h3>
				</div>
				<button type="button" class="hp-modal__close" onclick={onclose} aria-label="Tutup">
					&times;
				</button>
			</header>

			<form class="hp-modal__body" onsubmit={handleSave}>
				<div class="hp-field-row">
					<label class="hp-field">
						<span class="hp-field__label">Nama Menu</span>
						<input
							type="text"
							class="hp-field__input"
							placeholder="Contoh: Ayam Geprek"
							bind:value={formName}
							required
						/>
					</label>

					<label class="hp-field">
						<span class="hp-field__label">Kategori</span>
						<select class="hp-field__input" bind:value={formCategory}>
							<option value="MAKANAN">MAKANAN</option>
							<option value="MINUMAN">MINUMAN</option>
							<option value="CAMILAN">CAMILAN</option>
							<option value="PAKET">PAKET</option>
						</select>
					</label>
				</div>

				<label class="hp-field">
					<span class="hp-field__label">Harga Jual Target (Rp)</span>
					<input
						type="number"
						class="hp-field__input"
						min="500"
						step="500"
						bind:value={formPrice}
						required
					/>
				</label>

				<!-- Komposisi Bahan Resep Builder -->
				<div class="hp-recipe-builder">
					<div class="hp-recipe-builder__head">
						<span class="hp-field__label">Komposisi Bahan Resep ({formRows.length})</span>
						{#if availableIngredients.length > 0}
							<button
								type="button"
								class="hp-recipe-builder__add"
								onclick={addIngredientRow}
							>
								+ Tambah Bahan
							</button>
						{/if}
					</div>

					{#if availableIngredients.length === 0}
						<p class="hp-recipe-builder__empty">
							Belum ada bahan baku di inventaris toko ini. Tambahkan bahan baku di tab "Bahan" terlebih dahulu.
						</p>
					{:else}
						<div class="hp-recipe-builder__rows">
							{#each formRows as row, idx (idx)}
								{@const selectedIng = ingMap.get(row.ingredientId)}
								{@const rowSubtotal = Math.round((selectedIng?.unitCost ?? 0) * (Number(row.qty) || 0))}
								<div class="hp-recipe-builder__row">
									<select
										class="hp-field__input hp-recipe-builder__select"
										bind:value={row.ingredientId}
										aria-label="Pilih bahan baku"
									>
										{#each availableIngredients as ing (ing.id)}
											<option value={ing.id}>
												{ing.name} ({formatFigmaRupiah(ing.unitCost)}/{ing.baseUnit})
											</option>
										{/each}
									</select>

									<input
										type="number"
										class="hp-field__input hp-recipe-builder__qty"
										min="0.01"
										step="any"
										bind:value={row.qty}
										aria-label="Takaran bahan"
										required
									/>

									<span class="hp-recipe-builder__cost">
										{formatFigmaRupiah(rowSubtotal)}
									</span>

									{#if formRows.length > 1}
										<button
											type="button"
											class="hp-icon-btn hp-icon-btn--danger"
											onclick={() => removeIngredientRow(idx)}
											aria-label="Hapus baris bahan"
										>
											&times;
										</button>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<div class="hp-calc-preview">
					<span>Total HPP: <strong>{formatFigmaRupiah(calculatedHpp)}</strong></span>
					<strong style="color: #009B71;">
						Margin {formatFigmaPercent(currentMargin)} (Laba {formatFigmaRupiah(Math.max(0, formPrice - calculatedHpp))})
					</strong>
				</div>

				<div class="hp-modal__foot">
					<button type="button" class="hp-btn-outline" onclick={onclose}>
						Batal
					</button>
					<button type="submit" class="hp-btn-primary">
						Simpan Menu & Resep
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.hp-recipe-builder {
		display: flex;
		flex-direction: column;
		gap: 8px;
		border-top: 1px solid #eef2f6;
		padding-top: 12px;
	}

	.hp-recipe-builder__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.hp-recipe-builder__add {
		background: none;
		border: 0;
		color: #e64a0a;
		font-size: 12px;
		font-weight: 700;
		cursor: pointer;
		padding: 2px 4px;
	}

	.hp-recipe-builder__add:hover {
		text-decoration: underline;
	}

	.hp-recipe-builder__empty {
		font-size: 12px;
		color: #64748b;
		margin: 0;
		padding: 10px;
		background: #f8fafc;
		border-radius: 8px;
	}

	.hp-recipe-builder__rows {
		display: flex;
		flex-direction: column;
		gap: 8px;
		max-height: 210px;
		overflow-y: auto;
		padding-right: 2px;
	}

	.hp-recipe-builder__row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 82px auto auto;
		gap: 8px;
		align-items: center;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 10px;
		padding: 8px;
	}

	.hp-recipe-builder__select,
	.hp-recipe-builder__qty {
		height: 36px;
		font-size: 12.5px;
		padding: 0 8px;
	}

	.hp-recipe-builder__cost {
		font-size: 12px;
		font-weight: 800;
		color: #0f172a;
		min-width: 68px;
		text-align: right;
	}
</style>
