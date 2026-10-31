<script>
	import { hpp, hppTotal, menu } from '#lib/data.js';
	import { percent, rupiah } from '#lib/format.js';

	let step = $state(1);

	const steps = [
		{
			id: 1,
			short: 'Catat',
			clause:
				'Catat lima komponen HPP untuk satu menu: bahan baku, kemasan, gas dan listrik, tenaga kerja, susut dan sisa.'
		},
		{
			id: 2,
			short: 'Hitung',
			clause:
				'Total HPP dan target margin dihitung ulang setiap angka berubah. Tidak ada spreadsheet yang harus dijaga.'
		},
		{
			id: 3,
			short: 'Bandingkan',
			clause:
				'Semua menu duduk di satu tabel. Menu yang marginnya paling tipis langsung terlihat, tanpa dicari satu per satu.'
		},
		{
			id: 4,
			short: 'Putuskan',
			clause:
				'Pilih satu menu, lihat dampak kenaikan harga ke pendapatan sebulan, baru umumkan ke pelanggan.'
		}
	];

	const compare = menu.filter((row) =>
		['Sate ayam 10 tusuk', 'Ayam geprek', 'Nasi goreng telur balado', 'Kopi susu'].includes(row.name)
	);
</script>

<section id="cara-kerja" class="chapter chapter--paper steps" aria-labelledby="steps-title">
	<div class="shell steps-grid">
		<div class="steps-copy">
			<h2 id="steps-title" class="h2" data-reveal>Dari HPP ke harga, empat langkah.</h2>
			<p class="clause" data-reveal aria-live="polite">{steps[step - 1].clause}</p>

			<input
				data-reveal
				class="slider"
				type="range"
				min="1"
				max="4"
				step="1"
				bind:value={step}
				aria-label="Langkah cara kerja"
				aria-valuetext="Langkah {step}: {steps[step - 1].short}"
			/>

			<ol class="stops" data-reveal>
				{#each steps as item (item.id)}
					<li data-on={step === item.id}>
						{item.id}. {item.short}
					</li>
				{/each}
			</ol>
		</div>

		<div class="steps-stage" data-reveal>
			<div class="sheet" hidden={step !== 1}>
				<div class="sheet-head">
					<span>Langkah 1</span>
					<span>Nasi goreng telur balado</span>
				</div>
				{#each hpp as row (row.label)}
					<div class="ui-row">
						<span>{row.label}</span>
						<span class="ui-row__val tabular">{rupiah(row.value)}</span>
					</div>
				{/each}
				<p class="sheet-foot">
					<span>Lima komponen</span>
					<span>Sisa bisa ditambah sendiri</span>
				</p>
			</div>

			<div class="sheet" hidden={step !== 2}>
				<div class="sheet-head">
					<span>Langkah 2</span>
					<span>Otomatis</span>
				</div>
				<p class="sheet-title">HPP {rupiah(hppTotal)} per piring.</p>
				<div class="figs">
					<div>
						<p class="fig-num">{rupiah(hppTotal)}</p>
						<p class="fig-cap">total HPP</p>
					</div>
					<div>
						<p class="fig-num">{percent(45)}</p>
						<p class="fig-cap">target margin</p>
					</div>
					<div>
						<p class="fig-num">{rupiah(18500)}</p>
						<p class="fig-cap">harga jual</p>
					</div>
				</div>
				<p class="sheet-foot">
					<span>Harga dihitung dari HPP dan target margin</span>
					<span>Dibulatkan ke Rp 500</span>
				</p>
			</div>

			<div class="sheet" hidden={step !== 3}>
				<div class="sheet-head">
					<span>Langkah 3</span>
					<span>Empat menu</span>
				</div>
				<div class="bars">
					{#each compare as row (row.name)}
						<div class="bar" class:bar--accent={row.margin < 40}>
							<span class="bar__name">{row.name}</span>
							<span class="bar__track">
								<span class="bar__fill" style="width: {row.margin}%"></span>
							</span>
							<span class="bar__val">{percent(row.margin)}</span>
						</div>
					{/each}
				</div>
				<p class="sheet-foot">
					<span>Margin di bawah 40% diberi warna</span>
					<span>Urut dari yang paling tipis</span>
				</p>
			</div>

			<div class="sheet" hidden={step !== 4}>
				<div class="sheet-head">
					<span>Langkah 4</span>
					<span>Keputusan</span>
				</div>
				<p class="sheet-title">Naik Rp 1.500, margin jadi {percent(45.9)}.</p>
				<div class="figs">
					<div>
						<p class="fig-num">{rupiah(18500)}</p>
						<p class="fig-cap">harga baru</p>
					</div>
					<div>
						<p class="fig-num">Rp 1,35 jt</p>
						<p class="fig-cap">tambahan sebulan</p>
					</div>
				</div>
				<p class="sheet-foot">
					<span>Masih di bawah Rp 20.000</span>
					<span>30 piring sehari</span>
				</p>
			</div>
		</div>
	</div>
</section>
