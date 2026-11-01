<script lang="ts">
	import Logo from '#lib/components/Logo.svelte';
</script>

<footer class="footer">
	<div class="shell">
		<div class="footer-top">
			<a class="wordmark" href="#atas" aria-label="HargaPas, kembali ke atas">
				<Logo size={28} variant="horizontal" theme="dark" />
			</a>
			<nav class="footer-links" aria-label="Tautan kaki">
				<a href="#dashboard">Produk</a>
				<a href="#cara-kerja">Cara kerja</a>
				<a href="#tanya">Pertanyaan</a>
			</nav>
		</div>

		<p class="footer-contact" data-reveal>Harga Pas, Untung Pas</p>

		<div class="footer-meta">
			<div>
				<p><b>HargaPas.</b> Jakarta, Indonesia. Senin sampai Jumat.</p>
			</div>
			<div>
				<p>
					<b>Produk.</b> Daftar menu, rincian HPP, laporan bulanan, dan konsultan AI dalam satu
					dashboard.
				</p>
			</div>
			<div>
				<p>
					<b>Gambar.</b> Semua tangkapan layar memakai dashboard HargaPas. Ilustrasi bergaya
					unDraw berlisensi terbuka.
				</p>
			</div>
			<p class="footer-legal">
				© 2026 HargaPas. Contoh menu, HPP, dan harga di halaman ini adalah ilustrasi, bukan
				penawaran atau jaminan pendapatan. Data usaha Anda tetap milik Anda.
			</p>
		</div>
	</div>
</footer>
