<script lang="ts">
	import { formatFigmaRupiah } from '#lib/dashboard-data.js';

	export interface IngredientItem {
		id: string;
		name: string;
		buyPrice: number;
		capacity: number;
		baseUnit: string;
		buyUnit: string;
		unitCost: number;
	}

	interface Props {
		ingredients?: IngredientItem[];
		onsaveingredient?: (item: IngredientItem) => void;
		ondeleteingredient?: (id: string) => void;
	}

	let {
		ingredients = [],
		onsaveingredient = () => {},
		ondeleteingredient = () => {}
	}: Props = $props();

	let isModalOpen = $state(false);
	let editingId = $state<string | null>(null);
	let formName = $state('');
	let formBuyPrice = $state(38000);
	let formCapacity = $state(1000);
	let formBaseUnit = $state('gram');
	let formBuyUnit = $state('kg');

	let computedUnitCost = $derived(
		formCapacity > 0 ? Math.round(formBuyPrice / formCapacity) : 0
	);

	function openAddModal() {
		editingId = null;
		formName = '';
		formBuyPrice = 25000;
		formCapacity = 1000;
		formBaseUnit = 'gram';
		formBuyUnit = 'kg';
		isModalOpen = true;
	}

	function openEditModal(ing: IngredientItem) {
		editingId = ing.id;
		formName = ing.name;
		formBuyPrice = ing.buyPrice;
		formCapacity = ing.capacity;
		formBaseUnit = ing.baseUnit;
		formBuyUnit = ing.buyUnit;
		isModalOpen = true;
	}

	function handleSave(e: SubmitEvent) {
		e.preventDefault();
		if (!formName.trim()) return;
		onsaveingredient({
			id: editingId || `i-${Date.now()}`,
			name: formName.trim(),
			buyPrice: Number(formBuyPrice) || 0,
			capacity: Number(formCapacity) || 1,
			baseUnit: formBaseUnit,
			buyUnit: formBuyUnit,
			unitCost: computedUnitCost
		});
		isModalOpen = false;
	}
</script>

<div class="hp-page-stack">
	<!-- Top Banner Card -->
	<section class="hp-card hp-store-banner" data-reveal>
		<div class="hp-store-banner__main">
			<div class="hp-icon-box hp-icon-box--orange-lg" aria-hidden="true">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E64A0A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
					<path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
					<path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
				</svg>
			</div>
			<div class="hp-store-banner__info">
				<h1 class="hp-store-banner__title">Inventaris Bahan Baku</h1>
				<p class="hp-store-banner__sub-desktop">
					Kelola harga grosir dan konversi satuan dasar untuk kalkulasi HPP.
				</p>
			</div>
		</div>

		<button type="button" class="hp-btn-primary hp-desktop-only-btn" onclick={openAddModal}>
			<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
				<line x1="12" x2="12" y1="5" y2="19" />
				<line x1="5" x2="19" y1="12" y2="12" />
			</svg>
			<span>Tambah Bahan Baku</span>
		</button>
	</section>

	<!-- Ingredients Card (Desktop Table & Mobile Stacked List) -->
	<section class="hp-card hp-table-card" data-reveal data-delay="1">
		<!-- Desktop Table (>= 768px) -->
		<div class="hp-table-scroll hp-ing-desktop">
			<table class="hp-table hp-table--ing">
				<thead>
					<tr>
						<th scope="col">NAMA BAHAN</th>
						<th scope="col">HARGA BELI GROSIR</th>
						<th scope="col">SATUAN & KAPASITAS</th>
						<th scope="col">BIAYA / SATUAN DASAR</th>
						<th scope="col" class="hp-th-right">AKSI</th>
					</tr>
				</thead>
				<tbody>
					{#each ingredients as ing (ing.id)}
						<tr>
							<td class="hp-td-bold">{ing.name}</td>
							<td class="hp-td-regular">{formatFigmaRupiah(ing.buyPrice)}</td>
							<td class="hp-td-regular">
								{ing.capacity.toLocaleString('id-ID')} {ing.baseUnit} / {ing.buyUnit}
							</td>
							<td>
								<span class="hp-unit-cost">
									{formatFigmaRupiah(ing.unitCost)} / {ing.baseUnit}
								</span>
							</td>
							<td class="hp-td-right">
								<div class="hp-icon-actions hp-icon-actions--end">
									<button
										type="button"
										class="hp-icon-btn"
										onclick={() => openEditModal(ing)}
										aria-label="Edit {ing.name}"
										title="Edit Bahan"
									>
										<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
										</svg>
									</button>
									<button
										type="button"
										class="hp-icon-btn hp-icon-btn--danger"
										onclick={() => ondeleteingredient(ing.id)}
										aria-label="Hapus {ing.name}"
										title="Hapus Bahan"
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
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Mobile Stacked List (< 768px) -->
		<ul class="hp-ing-mobile-list">
			{#each ingredients as ing (ing.id)}
				<li class="hp-ing-mobile-item">
					<div class="hp-ing-mobile-item__info">
						<p class="hp-ing-mobile-item__name">{ing.name}</p>
						<p class="hp-ing-mobile-item__price">{formatFigmaRupiah(ing.buyPrice)}</p>
						<p class="hp-ing-mobile-item__unit">
							{formatFigmaRupiah(ing.unitCost)} / {ing.baseUnit}
						</p>
					</div>
					<div class="hp-icon-actions">
						<button
							type="button"
							class="hp-icon-btn"
							onclick={() => openEditModal(ing)}
							aria-label="Edit {ing.name}"
						>
							<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
							</svg>
						</button>
						<button
							type="button"
							class="hp-icon-btn hp-icon-btn--danger"
							onclick={() => ondeleteingredient(ing.id)}
							aria-label="Hapus {ing.name}"
						>
							<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M3 6h18" />
								<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
								<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
								<line x1="10" x2="10" y1="11" y2="17" />
								<line x1="14" x2="14" y1="11" y2="17" />
							</svg>
						</button>
					</div>
				</li>
			{/each}
		</ul>
	</section>

	<!-- Mobile Floating Action Button (+) -->
	<button
		type="button"
		class="hp-fab"
		onclick={openAddModal}
		aria-label="Tambah Bahan Baku"
		title="Tambah Bahan Baku"
	>
		<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round">
			<line x1="12" x2="12" y1="5" y2="19" />
			<line x1="5" x2="19" y1="12" y2="12" />
		</svg>
	</button>
</div>

{#if isModalOpen}
	<div class="hp-modal-backdrop">
		<button
			type="button"
			class="hp-modal-scrim"
			onclick={() => (isModalOpen = false)}
			aria-label="Tutup modal"
		></button>
		<div class="hp-modal" role="dialog" aria-modal="true" aria-labelledby="ing-modal-title">
			<header class="hp-modal__head">
				<div>
					<p class="hp-modal__tag">INVENTARIS BAHAN BAKU</p>
					<h3 id="ing-modal-title" class="hp-modal__title">
						{editingId ? 'Edit Bahan Baku' : 'Tambah Bahan Baku'}
					</h3>
				</div>
				<button type="button" class="hp-modal__close" onclick={() => (isModalOpen = false)} aria-label="Tutup">
					&times;
				</button>
			</header>

			<form class="hp-modal__body" onsubmit={handleSave}>
				<label class="hp-field">
					<span class="hp-field__label">Nama Bahan Baku</span>
					<input
						type="text"
						class="hp-field__input"
						placeholder="Contoh: Ayam Mentah"
						bind:value={formName}
						required
					/>
				</label>

				<div class="hp-field-row">
					<label class="hp-field">
						<span class="hp-field__label">Harga Beli Grosir (Rp)</span>
						<input
							type="number"
							class="hp-field__input"
							min="100"
							step="100"
							bind:value={formBuyPrice}
							required
						/>
					</label>

					<label class="hp-field">
						<span class="hp-field__label">Kapasitas Isi</span>
						<input
							type="number"
							class="hp-field__input"
							min="1"
							bind:value={formCapacity}
							required
						/>
					</label>
				</div>

				<div class="hp-field-row">
					<label class="hp-field">
						<span class="hp-field__label">Satuan Dasar (Resep)</span>
						<select class="hp-field__input" bind:value={formBaseUnit}>
							<option value="gram">gram</option>
							<option value="pcs">pcs</option>
							<option value="ml">ml</option>
						</select>
					</label>

					<label class="hp-field">
						<span class="hp-field__label">Satuan Beli Grosir</span>
						<select class="hp-field__input" bind:value={formBuyUnit}>
							<option value="kg">kg</option>
							<option value="pack">pack</option>
							<option value="liter">liter</option>
						</select>
					</label>
				</div>

				<div class="hp-calc-preview">
					<span>Biaya / Satuan Dasar:</span>
					<strong>{formatFigmaRupiah(computedUnitCost)} / {formBaseUnit}</strong>
				</div>

				<div class="hp-modal__foot">
					<button type="button" class="hp-btn-outline" onclick={() => (isModalOpen = false)}>
						Batal
					</button>
					<button type="submit" class="hp-btn-primary">
						Simpan Bahan
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
