<script>
	import { planRows, plans } from '#lib/data.js';

	const rows = planRows.map((row) => ({ label: row.label, values: [row.coba, row.warung, row.dapur] }));
</script>

<section id="harga" class="chapter chapter--paper pricing" aria-labelledby="pricing-title">
	<div class="shell">
		<div class="pricing-head" data-reveal>
			<h2 id="pricing-title" class="h2">Satu harga, tiga dapur.</h2>
			<p class="lead lead--soft">
				Bayar bulanan, berhenti kapan saja. Paket Coba gratis dan tidak meminta kartu.
			</p>
		</div>

		<div class="tickets" data-reveal>
			{#each plans as plan, i (plan.id)}
				<article class="ticket" class:ticket--on={plan.recommended}>
					<h3 class="ticket-name">{plan.name}</h3>
					<div>
						<p class="ticket-price">{plan.price}</p>
						<p class="ticket-period">{plan.period}</p>
					</div>
					<p class="ticket-note">
						{plan.note}{#if plan.recommended} · <strong class="ticket-tag">Paling sering dipilih</strong>{/if}
					</p>
					<ul class="ticket-rows">
						{#each rows as row (row.label)}
							<li class="ticket-row">
								<span>{row.label}</span>
								<span>{row.values[i]}</span>
							</li>
						{/each}
					</ul>
					<a class="ticket-action" href={plan.href}>{plan.action}</a>
				</article>
			{/each}
		</div>
	</div>
</section>
