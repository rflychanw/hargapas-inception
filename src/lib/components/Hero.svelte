<script>
	import { menu } from '#lib/data.js';
	import { percent, rupiah } from '#lib/format.js';

	const pick = menu.find((item) => item.name === 'Nasi goreng telur balado') ?? menu[0];
	const rows = menu.filter((item) =>
		['Sate ayam 10 tusuk', 'Nasi goreng telur balado', 'Kopi susu'].includes(item.name)
	);
</script>

<section class="chapter chapter--paper hero" id="atas">
	<div class="shell">
		<div class="hero-head">
			<h1 class="display" data-reveal>Harga pas, margin jelas.</h1>
		</div>

		<div class="hero-body">
			<div class="hero-copy">
				<p class="lead" data-reveal data-delay="1">
					HargaPas adalah satu dashboard untuk harga warung: daftar menu, lima komponen HPP,
					dan margin tiap piring. Semua hitungan pindah ke dalam produk.
				</p>
				<div data-reveal data-delay="2">
					<a class="btn btn--orange" href="/dashboard">
						Buka Dashboard
						<span class="btn__arrow" aria-hidden="true">→</span>
					</a>
				</div>
				<p class="note hero-footnote" data-reveal data-delay="3">
					Contoh di halaman ini memakai nasi goreng telur balado: HPP {rupiah(10000)}, harga
					jual {rupiah(18500)}.
				</p>
			</div>

			<div class="hero-stage" data-reveal data-delay="2" data-ui>
				<div class="ui">
					<p class="ui-head">
						<span>Warung Bu Sirep</span>
						<span>Margin</span>
					</p>
					<ul class="ui-list">
						{#each rows as row (row.name)}
							<li class="ui-row" class:ui-row--on={row.name === pick.name}>
								<span class="ui-row__name">{row.name}</span>
								<span class="ui-row__val tabular">{percent(row.margin)}</span>
							</li>
						{/each}
					</ul>
					<p class="ui-foot">
						<span>Harga jual {pick.name.toLowerCase()}</span>
						<b class="tabular">{rupiah(pick.price)}</b>
					</p>
				</div>
			</div>
		</div>
	</div>
</section>
