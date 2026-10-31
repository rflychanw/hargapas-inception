<script>
	import { hpp, hppTotal } from '#lib/data.js';
	import { rupiah } from '#lib/format.js';
</script>

<section id="hpp" class="chapter chapter--paper hpp" aria-labelledby="hpp-title">
	<div class="shell">
		<h2 id="hpp-title" class="display" data-reveal>Ke mana {rupiah(hppTotal)} pergi.</h2>

		<ul class="poster-list">
			{#each hpp as row, i (row.label)}
				<li class="poster-row" data-reveal data-delay={String(i + 1)}>
					<span class="poster-name">{row.label}</span>
					<span class="poster-value">{rupiah(row.value)}</span>
				</li>
			{/each}
			<li class="poster-row poster-row--total" data-reveal data-delay="5">
				<span class="poster-name">Total HPP</span>
				<span class="poster-value poster-value--accent">{rupiah(hppTotal)}</span>
			</li>
		</ul>

		<div class="hpp-foot" data-reveal data-delay="2">
			<div class="hpp-notes">
				<p class="hpp-note">
					Lima komponen ini yang dipakai HargaPas untuk menghitung harga jual. Angkanya bisa
					diganti per menu, dan harga ikut menyesuaikan.
				</p>
				<p class="hpp-note hpp-note--muted">
					Contoh: nasi goreng telur balado, satu piring.
				</p>
			</div>
			<figure class="hpp-photo">
				<img
					src="/img/undraw_ingredients.svg"
					alt="Ilustrasi penimbangan bahan baku dan kalkulasi 5 komponen HPP"
					width="800"
					height="600"
					loading="lazy"
				/>
			</figure>
		</div>
	</div>
</section>
