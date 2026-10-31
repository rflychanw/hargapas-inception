<script>
	import { hpp, hppTotal } from '#lib/data.js';
	import { rupiah } from '#lib/format.js';
</script>

<section id="hpp" class="chapter chapter--paper hpp" aria-labelledby="hpp-title">
	<div class="shell">
		<h2 id="hpp-title" class="display" data-reveal>Ke mana {rupiah(hppTotal)} pergi.</h2>

		<ul class="poster-list" data-reveal>
			{#each hpp as row (row.label)}
				<li class="poster-row">
					<span class="poster-name">{row.label}</span>
					<span class="poster-value">{rupiah(row.value)}</span>
				</li>
			{/each}
			<li class="poster-row poster-row--total">
				<span class="poster-name">Total HPP</span>
				<span class="poster-value poster-value--accent">{rupiah(hppTotal)}</span>
			</li>
		</ul>

		<div class="hpp-foot" data-reveal>
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
					src="/img/cabai-pasar.jpg"
					alt="Karung plastik berisi cabai merah di lantai pasar"
					width="1920"
					height="1440"
					loading="lazy"
				/>
			</figure>
		</div>
	</div>
</section>
