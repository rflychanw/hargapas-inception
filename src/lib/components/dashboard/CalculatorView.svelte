<script lang="ts">
	import { rupiah, percent } from '#lib/format.js';
	import { calcMargin } from '#lib/dashboard-data.js';
	import type { MenuItem } from './HppModal.svelte';

	interface Props {
		onaddmenu?: (item: MenuItem) => void;
	}

	let {
		onaddmenu = () => {}
	}: Props = $props();

	let name = $state('');
	let category = $state('Makanan Utama');
	let bahan = $state(7500);
	let kemasan = $state(1000);
	let energi = $state(1200);
	let tenaga = $state(1500);
	let susut = $state(600);

	let targetMargin = $state(45);

	let totalHpp = $derived(bahan + kemasan + energi + tenaga + susut);
	let recommendedPrice = $derived(
		targetMargin < 100
			? Math.ceil(totalHpp / (1 - targetMargin / 100) / 500) * 500
			: totalHpp * 2
	);
	let actualMargin = $derived(calcMargin(recommendedPrice, totalHpp));
	let profitPerPortion = $derived(Math.max(0, recommendedPrice - totalHpp));

	let savedSuccess = $state(false);

	function handleAdd() {
		if (!name.trim()) return;

		const newItem: MenuItem = {
			id: `m-${Date.now()}`,
			name: name.trim(),
			category,
			price: recommendedPrice,
			hpp: {
				bahan,
				kemasan,
				energi,
				tenaga,
				susut
			},
			monthlySales: 300
		};

		onaddmenu(newItem);
		savedSuccess = true;
		name = '';
		setTimeout(() => {
			savedSuccess = false;
		}, 3000);
	}
</script>

<div class="dash-view">
	<header class="dash-topbar">
		<div>
			<h2 class="dash-topbar__title">Kalkulator HPP & Tambah Menu</h2>
			<p class="dash-topbar__sub">
				Hitung biaya modal nyata 5 komponen dan tentukan harga jual yang menjamin margin warung.
			</p>
		</div>
	</header>

	{#if savedSuccess}
		<div class="dash-alert dash-alert--success" role="alert">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
				<path d="M20 6 9 17l-5-5"></path>
			</svg>
			<span>Menu baru berhasil disimpan ke daftar warung Anda!</span>
		</div>
	{/if}

	<div class="dash-calc-grid">
		<!-- Sisi Kiri: Form Input 5 Komponen -->
		<div class="dash-card dash-calc-form">
			<h3 class="dash-calc-form__title">1. Data Menu & 5 Komponen Biaya</h3>

			<div class="dash-field-group">
				<label class="dash-field">
					<span class="dash-field__label">Nama Menu / Hidangan *</span>
					<input
						type="text"
						class="dash-field__input"
						placeholder="Misal: Soto Ayam Lamongan"
						bind:value={name}
						required
					/>
				</label>

				<label class="dash-field">
					<span class="dash-field__label">Kategori</span>
					<select class="dash-field__select" bind:value={category}>
						<option value="Makanan Utama">Makanan Utama</option>
						<option value="Lauk Pendamping">Lauk Pendamping</option>
						<option value="Minuman">Minuman</option>
						<option value="Camilan">Camilan</option>
					</select>
				</label>
			</div>

			<div class="dash-comp-group">
				<h4 class="dash-comp-group__title">Rincian Modal Bahan Baku & Operasional (Per Porsi)</h4>

				<div class="dash-comp-grid">
					<label class="dash-field">
						<span class="dash-field__label">1. Bahan Baku</span>
						<div class="dash-field__input-wrap">
							<span class="dash-field__prefix">Rp</span>
							<input
								type="number"
								class="dash-field__input"
								bind:value={bahan}
								min="0"
								step="100"
							/>
						</div>
					</label>

					<label class="dash-field">
						<span class="dash-field__label">2. Kemasan / Bungkus</span>
						<div class="dash-field__input-wrap">
							<span class="dash-field__prefix">Rp</span>
							<input
								type="number"
								class="dash-field__input"
								bind:value={kemasan}
								min="0"
								step="100"
							/>
						</div>
					</label>

					<label class="dash-field">
						<span class="dash-field__label">3. Gas & Listrik</span>
						<div class="dash-field__input-wrap">
							<span class="dash-field__prefix">Rp</span>
							<input
								type="number"
								class="dash-field__input"
								bind:value={energi}
								min="0"
								step="100"
							/>
						</div>
					</label>

					<label class="dash-field">
						<span class="dash-field__label">4. Tenaga Kerja</span>
						<div class="dash-field__input-wrap">
							<span class="dash-field__prefix">Rp</span>
							<input
								type="number"
								class="dash-field__input"
								bind:value={tenaga}
								min="0"
								step="100"
							/>
						</div>
					</label>

					<label class="dash-field dash-field--span-2">
						<span class="dash-field__label">5. Susut Bahan & Sisa Bumbu</span>
						<div class="dash-field__input-wrap">
							<span class="dash-field__prefix">Rp</span>
							<input
								type="number"
								class="dash-field__input"
								bind:value={susut}
								min="0"
								step="100"
							/>
						</div>
					</label>
				</div>
			</div>
		</div>

		<!-- Sisi Kanan: Target Margin & Hasil Rekomendasi -->
		<div class="dash-card dash-calc-result">
			<h3 class="dash-calc-form__title">2. Target Margin & Rekomendasi</h3>

			<div class="dash-result-summary">
				<div class="dash-summary-row">
					<span>Total HPP Terhitung</span>
					<strong class="tabular">{rupiah(totalHpp)}</strong>
				</div>

				<div class="dash-margin-slider-wrap">
					<div class="dash-margin-slider-head">
						<span>Target Margin Keuntungan:</span>
						<strong class="dash-margin-target-badge tabular">{percent(targetMargin)}</strong>
					</div>

					<input
						type="range"
						class="slider"
						min="20"
						max="75"
						step="1"
						bind:value={targetMargin}
						aria-label="Target margin persentase"
					/>
					<div class="dash-slider-scale">
						<span>20% (Tipis)</span>
						<span>40% (Batas Aman)</span>
						<span>75% (Tebal)</span>
					</div>
				</div>

				<div class="dash-recom-box">
					<span class="dash-recom-box__label">Rekomendasi Harga Jual:</span>
					<p class="dash-recom-box__price tabular">{rupiah(recommendedPrice)}</p>
					<p class="dash-recom-box__sub">
						Dibulatkan ke kelipatan Rp 500 terdekat untuk kemudahan kembalian.
					</p>

					<div class="dash-recom-stats">
						<div>
							<span>Margin Nyata:</span>
							<strong class="tabular">{percent(actualMargin)}</strong>
						</div>
						<div>
							<span>Laba Bersih / Porsi:</span>
							<strong class="tabular">{rupiah(profitPerPortion)}</strong>
						</div>
					</div>
				</div>

				<button
					type="button"
					class="dash-btn dash-btn--orange dash-btn--block"
					onclick={handleAdd}
					disabled={!name.trim() || totalHpp <= 0}
				>
					Simpan Menu Baru ke Warung
				</button>
			</div>
		</div>
	</div>
</div>
