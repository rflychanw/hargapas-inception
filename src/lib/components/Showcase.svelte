<script>
	import { hpp, hppTotal, menu } from '#lib/data.js';
	import { number, percent, rupiah } from '#lib/format.js';

	let active = $state('menu');

	const panels = [
		{ id: 'menu', label: 'Daftar menu' },
		{ id: 'hpp', label: 'Rincian HPP' },
		{ id: 'laporan', label: 'Laporan bulanan' }
	];

	const pick = menu.find((item) => item.name === 'Nasi goreng telur balado') ?? menu[0];
	const fattest = [...menu].sort((a, b) => b.margin - a.margin).slice(0, 3);
	const maxShare = Math.max(...hpp.map((row) => row.share));
</script>

<section id="dashboard" class="chapter chapter--ink showcase" aria-labelledby="dashboard-title">
	<div class="shell showcase-grid">
		<div class="showcase-side">
			<h2 id="dashboard-title" class="h2" data-reveal>Satu layar untuk semua menu.</h2>
			<p class="lead lead--soft" data-reveal>
				Daftar menu, rincian HPP, dan laporan bulanan ada di tempat yang sama. Tidak ada lagi
				berkas terpisah atau hitungan di kertas.
			</p>

			<div class="index" role="tablist" data-reveal aria-label="Tampilan dashboard">
				{#each panels as panel (panel.id)}
					<button
						class="index-btn"
						role="tab"
						id="tab-{panel.id}"
						aria-selected={active === panel.id}
						aria-controls="panel-{panel.id}"
						onclick={() => (active = panel.id)}
					>
						{panel.label}
					</button>
				{/each}
			</div>

			<figure class="showcase-photo" data-reveal>
				<img
					src="/img/pasar-buah.jpg"
					alt="Kios buah di pasar dengan keranjang dagangan tersusun rapat"
					width="1920"
					height="1042"
					loading="lazy"
				/>
				<figcaption>
					Harga bahan berubah tiap pekan. Angka di dashboard ikut diubah, margin langsung
					terlihat.
				</figcaption>
			</figure>
		</div>

		<div class="sheet-stage" data-reveal data-ui>
			<div
				class="sheet"
				data-ui
				id="panel-menu"
				role="tabpanel"
				aria-labelledby="tab-menu"
				hidden={active !== 'menu'}
			>
				<div class="sheet-top">
					<p class="sheet-title">Warung Bu Sirep</p>
					<p class="sheet-meta">Daftar menu, 8 menu aktif</p>
				</div>
				<table class="sheet-table">
					<thead>
						<tr>
							<th scope="col">Menu</th>
							<th scope="col">HPP</th>
							<th scope="col">Harga</th>
							<th scope="col">Margin</th>
						</tr>
					</thead>
					<tbody>
						{#each menu as row (row.name)}
							<tr class:is-thin={row.margin < 40}>
								<td>{row.name}</td>
								<td>{number(row.hpp)}</td>
								<td>{number(row.price)}</td>
								<td>{percent(row.margin)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<p class="sheet-foot">
					<span>Margin di bawah 40% ditandai oranye</span>
					<span>Diperbarui hari ini</span>
				</p>
			</div>

			<div
				class="sheet"
				data-ui
				id="panel-hpp"
				role="tabpanel"
				aria-labelledby="tab-hpp"
				hidden={active !== 'hpp'}
			>
				<div class="sheet-top">
					<p class="sheet-title">Nasi goreng telur balado</p>
					<p class="sheet-meta">Rincian HPP per piring</p>
				</div>
				<div class="bars">
					{#each hpp as row (row.label)}
						<div class="bar" class:bar--accent={row.share === maxShare}>
							<span class="bar__name">{row.label}</span>
							<span class="bar__track">
								<span class="bar__fill" style="width: {(row.share / maxShare) * 100}%"></span>
							</span>
							<span class="bar__val">{rupiah(row.value)}</span>
						</div>
					{/each}
				</div>
				<p class="sheet-foot">
					<span>Total HPP {rupiah(hppTotal)}</span>
					<span>Harga jual {rupiah(pick.price)}</span>
				</p>
			</div>

			<div
				class="sheet"
				data-ui
				id="panel-laporan"
				role="tabpanel"
				aria-labelledby="tab-laporan"
				hidden={active !== 'laporan'}
			>
				<div class="sheet-top">
					<p class="sheet-title">Satu menu, satu bulan.</p>
					<p class="sheet-meta">Laporan bulanan, contoh</p>
				</div>
				<div class="figs">
					<div>
						<p class="fig-num">30</p>
						<p class="fig-cap">piring sehari</p>
					</div>
					<div>
						<p class="fig-num">{percent(45.9)}</p>
						<p class="fig-cap">margin setelah harga naik</p>
					</div>
					<div>
						<p class="fig-num">Rp 1,35 jt</p>
						<p class="fig-cap">tambahan sebulan</p>
					</div>
				</div>
				<div class="bars">
					{#each fattest as row (row.name)}
						<div class="bar">
							<span class="bar__name">{row.name}</span>
							<span class="bar__track">
								<span class="bar__fill" style="width: {row.margin}%"></span>
							</span>
							<span class="bar__val">{percent(row.margin)}</span>
						</div>
					{/each}
				</div>
				<p class="sheet-foot">
					<span>Tiga menu bermargin paling tebal</span>
					<span>Diunduh sebagai PDF</span>
				</p>
			</div>
		</div>
	</div>
</section>
