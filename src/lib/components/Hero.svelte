<script>
	import { rupiah } from '#lib/format.js';
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
				<div class="devices">
					<div class="device device--laptop">
						<div class="device__screen">
							<img
								src="/img/dashboard-laptop.png"
								alt="Dashboard HargaPas di laptop: ringkasan Warung Bu Sirep, rata-rata margin, dan tabel HPP tiap menu"
								width="1440"
								height="900"
								fetchpriority="high"
								decoding="async"
							/>
						</div>
						<div class="device__base" aria-hidden="true"></div>
					</div>

					<div class="device device--phone" aria-hidden="true">
						<div class="device__screen">
							<img
								src="/img/dashboard-phone.png"
								alt=""
								width="390"
								height="844"
								loading="lazy"
								decoding="async"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
