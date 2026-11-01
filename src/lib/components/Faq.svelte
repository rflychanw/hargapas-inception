<script lang="ts">
    import { faqs } from "#lib/data.js";
</script>

<section
    id="tanya"
    class="relative overflow-hidden bg-[#121110] py-12 text-white md:py-24 lg:py-32 bg-[radial-gradient(900px_420px_at_85%_-10%,rgba(255,107,26,0.14),transparent_60%)]"
    aria-labelledby="faq-title"
>
    <div
        class="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,1.35fr)] lg:gap-16"
    >
        <!-- Section Header -->
        <div class="lg:sticky lg:top-10" data-reveal>
            <h2
                id="faq-title"
                class="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-[1.08]"
            >
                Yang sering ditanya.
            </h2>
        </div>

        <!-- Accordion List -->
        <div class="flex flex-col">
            {#each faqs as faq, i (faq.question)}
                <details
                    class="group border-b-2 border-white/16"
                    data-reveal
                    data-delay={String(Math.min(i + 1, 5))}
                    name="faq"
                    open={i === 0}
                >
                    <summary
                        class="flex min-h-[52px] w-full cursor-pointer list-none items-center justify-between gap-4 py-3.5 text-left text-base font-bold tracking-tight text-white transition-all duration-180 hover:text-orange-500 active:scale-[0.995] md:min-h-[64px] md:py-4 md:text-xl lg:text-2xl [&::-webkit-details-marker]:hidden"
                    >
                        <span>{faq.question}</span>

                        <!-- Custom Plus / Minus Icon Mark -->
                        <span
                            class="relative h-4 w-4 flex-none transition-transform duration-180 group-hover:scale-115"
                            aria-hidden="true"
                        >
                            <!-- Horizontal Bar -->
                            <span
                                class="absolute inset-x-0 top-[7px] h-[2px] bg-orange-500"
                            ></span>
                            <!-- Vertical Bar (Hidden when details is open) -->
                            <span
                                class="absolute inset-y-0 left-[7px] w-[2px] bg-orange-500 transition-transform duration-180 group-open:scale-y-0"
                            ></span>
                        </span>
                    </summary>

                    <p
                        class="max-w-[58ch] pb-4 text-xs leading-relaxed text-white/74 sm:text-sm md:text-base"
                    >
                        {faq.answer}
                    </p>
                </details>
            {/each}
        </div>
    </div>
</section>
