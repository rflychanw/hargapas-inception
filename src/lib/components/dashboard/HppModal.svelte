<script lang="ts">
	import {
		calcHppTotal,
		calcMargin,
		formatFigmaPercent,
		formatFigmaRupiah
	} from '#lib/dashboard-data.js';

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
		onclose?: () => void;
		onsave?: (updated: MenuItem) => void;
	}

	let {
		item = null,
		isNew = false,
		onclose = () => {},
		onsave = () => {}
	}: Props = $props();

	let formName = $state('');
	let formCategory = $state('MAKANAN');
	let formPrice = $state(12000);
	let formHppCost = $state(6270);
	let formRecipeCount = $state(1);

	$effect(() => {
		if (item) {
			formName = item.name;
			formCategory = (item.category || 'MAKANAN').toUpperCase();
			formPrice = item.price;
			formHppCost = item.hppCost !== undefined ? item.hppCost : calcHppTotal(item.hpp);
			formRecipeCount = item.recipeCount ?? (item.recipe ? item.recipe.length : 1);
		}
	});

	let currentMargin = $derived(calcMargin(formPrice, formHppCost));

	function handleSave(e: SubmitEvent) {
		e.preventDefault();
		if (!item || !formName.trim()) return;
		onsave({
			...item,
			name: formName.trim(),
			category: formCategory,
			price: Number(formPrice) || 0,
			hppCost: Number(formHppCost) || 0,
			recipeCount: Number(formRecipeCount) || 1,
			hpp: {
				bahan: Number(formHppCost) || 0,
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
						</select>
					</label>
				</div>

				<div class="hp-field-row">
					<label class="hp-field">
						<span class="hp-field__label">Harga Jual (Rp)</span>
						<input
							type="number"
							class="hp-field__input"
							min="500"
							step="500"
							bind:value={formPrice}
							required
						/>
					</label>

					<label class="hp-field">
						<span class="hp-field__label">Total HPP / Porsi (Rp)</span>
						<input
							type="number"
							class="hp-field__input"
							min="0"
							step="10"
							bind:value={formHppCost}
							required
						/>
					</label>
				</div>

				<label class="hp-field">
					<span class="hp-field__label">Jumlah Komponen Bahan di Resep</span>
					<input
						type="number"
						class="hp-field__input"
						min="1"
						max="20"
						bind:value={formRecipeCount}
					/>
				</label>

				<div class="hp-calc-preview">
					<span>Estimasi Margin Aktif:</span>
					<strong style="color: #009B71;">
						{formatFigmaPercent(currentMargin)} (Laba {formatFigmaRupiah(Math.max(0, formPrice - formHppCost))})
					</strong>
				</div>

				<div class="hp-modal__foot">
					<button type="button" class="hp-btn-outline" onclick={onclose}>
						Batal
					</button>
					<button type="submit" class="hp-btn-primary">
						Simpan Menu
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
