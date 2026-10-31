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
					{#if plan.recommended}
						<p class="ticket-badge">Paling sering dipilih</p>
					{/if}
					<p class="ticket-note">{plan.note}</p>
					<div class="perf" aria-hidden="true"></div>
					<div class="ticket-rows">
						{#each rows as row (row.label)}
							<div class="ticket-row">
								<span>{row.label}</span>
								<span>{row.values[i]}</span>
							</div>
						{/each}
					</div>
					<a class="ticket-action" href={plan.href}>{plan.action}</a>
				</article>
			{/each}
		</div>
	</div>
</section>
