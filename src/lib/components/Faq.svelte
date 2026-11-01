<script>
	import { faqs } from '#lib/data.js';
</script>

<section id="tanya" class="chapter chapter--paper faq" aria-labelledby="faq-title">
	<div class="shell faq-grid">
		<div class="faq-head" data-reveal>
			<h2 id="faq-title" class="h2">Yang sering ditanya.</h2>
		</div>

		<div class="faq-list">
			{#each faqs as faq, i (faq.question)}
				<details class="faq-item" data-reveal data-delay={String(Math.min(i + 1, 5))} name="faq" open={i === 0}>
					<summary class="faq-q">
						{faq.question}
						<span class="faq-mark" aria-hidden="true"></span>
					</summary>
					<p class="faq-a">{faq.answer}</p>
				</details>
			{/each}
		</div>
	</div>
</section>
