<script lang="ts">
    import { hpp, hppTotal } from "#lib/data.js";
    import { formatRupiah } from "#lib/utils/format.ts";
</script>

<section
    id="hpp"
    class="relative overflow-hidden bg-[#f5f5f5] py-12 text-slate-900 md:py-24 lg:py-32"
    aria-labelledby="hpp-title"
>
    <div class="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <!-- Section Title -->
        <h2
            id="hpp-title"
            class="mb-8 max-w-[16ch] text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl leading-[1.02]"
            data-reveal
        >
            Ke mana {formatRupiah(hppTotal)} pergi.
        </h2>

        <!-- Poster Breakdown List -->
        <ul class="flex flex-col border-t border-slate-900/10">
            {#each hpp as row, i (row.label)}
                <li
                    class="flex items-center justify-between gap-3 border-b border-slate-900/8 py-3.5 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-baseline md:gap-6 md:border-b-2 md:border-white md:py-3"
                    data-reveal
                    data-delay={String(i + 1)}
                >
                    <span
                        class="text-base font-bold tracking-tight leading-tight text-slate-900 sm:text-3xl md:text-4xl md:font-extrabold md:leading-[1.08]"
                    >
                        {row.label}
                    </span>
                    <span
                        class="whitespace-nowrap text-base font-bold tracking-tight text-slate-900 tabular-nums sm:text-xl md:text-2xl [font-variant-numeric:lining-nums_proportional-nums]"
                    >
                        {formatRupiah(row.value)}
                    </span>
                </li>
            {/each}

            <!-- Total Row -->
            <li
                class="mt-1 flex items-center justify-between gap-3 border-t-2 border-slate-900 pt-3.5 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-baseline md:gap-6"
                data-reveal
                data-delay="5"
            >
                <span
                    class="text-lg font-extrabold tracking-tight text-slate-900 sm:text-2xl md:text-3xl"
                >
                    Total HPP
                </span>
                <span
                    class="whitespace-nowrap rounded-lg bg-orange-500 px-2.5 py-1 text-lg font-extrabold tracking-tight text-slate-900 tabular-nums sm:text-2xl md:text-3xl [font-variant-numeric:lining-nums_proportional-nums]"
                >
                    {formatRupiah(hppTotal)}
                </span>
            </li>
        </ul>

        <!-- Section Footer / Notes & Illustration -->
        <div
            class="mt-6 grid grid-cols-1 items-end gap-4 sm:mt-8 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16"
            data-reveal
            data-delay="2"
        >
            <div class="flex flex-col gap-2">
                <p
                    class="max-w-[42ch] text-sm leading-relaxed text-slate-800 sm:text-base"
                >
                    Lima komponen ini yang dipakai HargaPas untuk menghitung
                    harga jual. Angkanya bisa diganti per menu, dan harga ikut
                    menyesuaikan.
                </p>
                <p class="max-w-[42ch] text-sm leading-relaxed text-slate-500">
                    Contoh: nasi goreng telur balado, satu piring.
                </p>
            </div>

            <figure class="w-full" data-parallax="0.06">
                <img
                    src="/img/undraw_ingredients.svg"
                    alt="Ilustrasi penimbangan bahan baku dan kalkulasi 5 komponen HPP"
                    width="800"
                    height="600"
                    loading="lazy"
                    decoding="async"
                    class="aspect-[16/10] w-full rounded-2xl border border-slate-200 bg-white p-4 object-contain shadow-xs"
                />
            </figure>
        </div>
    </div>
</section>
