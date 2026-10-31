<script lang="ts">
	import { rupiah, percent } from '#lib/format.js';
	import { calcMargin } from '#lib/dashboard-data.js';

	export interface MenuItem {
		id: string;
		name: string;
		category: string;
		price: number;
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
		onclose?: () => void;
		onsave?: (updated: MenuItem) => void;
	}

	let {
		item = null,
		onclose = () => {},
		onsave = () => {}
	}: Props = $props();

	let currentPrice = $state(0);
	let bahan = $state(0);
	let kemasan = $state(0);
	let energi = $state(0);
	let tenaga = $state(0);
	let susut = $state(0);

	$effect(() => {
		if (item) {
			currentPrice = item.price;
			bahan = item.hpp.bahan;
			kemasan = item.hpp.kemasan;
			energi = item.hpp.energi;
			tenaga = item.hpp.tenaga;
			susut = item.hpp.susut;
		}
	});

	let totalHpp = $derived(bahan + kemasan + energi + tenaga + susut);
	let currentMargin = $derived(calcMargin(currentPrice, totalHpp));
	let profitPerPortion = $derived(Math.max(0, currentPrice - totalHpp));

	function handleSave() {
		if (!item) return;
		onsave({
			...item,
			price: currentPrice,
			hpp: { bahan, kemasan, energi, tenaga, susut }
		});
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if item}
	<div class="dash-modal-backdrop">
		<button
			type="button"
			class="dash-modal-scrim"
			onclick={onclose}
			aria-label="Tutup rincian modal"
		></button>
		<div
			class="dash-modal"
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			aria-labelledby="modal-title"
		>
			<header class="dash-modal__head">
				<div>
					<p class="dash-modal__tag">{item.category}</p>
					<h3 id="modal-title" class="dash-modal__title">{item.name}</h3>
				</div>
				<button type="button" class="dash-modal__close" onclick={onclose} aria-label="Tutup rincian">
					&times;
				</button>
			</header>

			<div class="dash-modal__body">
				<!-- KPI Ringkas -->
				<div class="dash-modal__stats">
					<div class="dash-stat-box">
						<span class="dash-stat-box__label">Harga Jual</span>
						<p class="dash-stat-box__val tabular">{rupiah(currentPrice)}</p>
					</div>
					<div class="dash-stat-box">
						<span class="dash-stat-box__label">Total HPP</span>
						<p class="dash-stat-box__val tabular">{rupiah(totalHpp)}</p>
					</div>
					<div class="dash-stat-box" class:dash-stat-box--alert={currentMargin < 40}>
						<span class="dash-stat-box__label">Margin</span>
						<p class="dash-stat-box__val tabular">{percent(currentMargin)}</p>
					</div>
				</div>

				<!-- Edit 5 Komponen HPP -->
				<div class="dash-comp-group">
					<h4 class="dash-comp-group__title">Lima Komponen Biaya Per Piring</h4>

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
							<span class="dash-field__label">3. Gas, Air & Listrik</span>
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
							<span class="dash-field__label">4. Tenaga Kerja / Olah</span>
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
							<span class="dash-field__label">5. Susut Bahan & Sisa</span>
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

				<!-- Pengaturan Harga Jual -->
				<div class="dash-comp-group">
					<h4 class="dash-comp-group__title">Penyesuaian Harga Jual</h4>
					<div class="dash-price-row">
						<label class="dash-field" style="flex: 1;">
							<span class="dash-field__label">Harga di Menu Pelanggan</span>
							<div class="dash-field__input-wrap">
								<span class="dash-field__prefix">Rp</span>
								<input
									type="number"
									class="dash-field__input"
									bind:value={currentPrice}
									min="1000"
									step="500"
								/>
							</div>
						</label>

						<div class="dash-profit-callout">
							<span>Laba Kotor / Porsi:</span>
							<strong class="tabular">{rupiah(profitPerPortion)}</strong>
						</div>
					</div>
				</div>
			</div>

			<footer class="dash-modal__foot">
				<button type="button" class="dash-btn dash-btn--ghost" onclick={onclose}>
					Batal
				</button>
				<button type="button" class="dash-btn dash-btn--orange" onclick={handleSave}>
					Simpan Perubahan
				</button>
			</footer>
		</div>
	</div>
{/if}
