<script lang="ts">
    import { hpp, hppTotal, menu } from "#lib/data.js";
    import { percent, rupiah } from "#lib/format.js";

    let step = $state(1);

    const steps = [
        {
            id: 1,
            short: "Catat",
            clause: "Catat lima komponen HPP untuk satu menu: bahan baku, kemasan, gas dan listrik, tenaga kerja, susut dan sisa.",
        },
        {
            id: 2,
            short: "Hitung",
            clause: "Total HPP dan target margin dihitung ulang setiap angka berubah. Tidak ada spreadsheet yang harus dijaga.",
        },
        {
            id: 3,
            short: "Bandingkan",
            clause: "Semua menu duduk di satu tabel. Menu yang marginnya paling tipis langsung terlihat, tanpa dicari satu per satu.",
        },
        {
            id: 4,
            short: "Putuskan",
            clause: "Pilih satu menu, lihat dampak kenaikan harga ke pendapatan sebulan, baru umumkan ke pelanggan.",
        },
    ];

    const compare = menu.filter((row) =>
        [
            "Sate ayam 10 tusuk",
            "Ayam geprek",
            "Nasi goreng telur balado",
            "Kopi susu",
        ].includes(row.name),
    );
</script>

<section
    id="cara-kerja"
    class="relative border-b-2 border-slate-100 bg-white py-12 text-slate-900 md:py-24 lg:py-32"
    aria-labelledby="steps-title"
>
    <div
        class="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-16"
    >
        <!-- Left Column: Copywriting & Interactive Step Controls -->
        <div class="flex flex-col items-start gap-6">
            <h2
                id="steps-title"
                class="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl leading-[1.08]"
                data-reveal
            >
                Dari HPP ke harga, empat langkah.
            </h2>

            <p
                class="min-h-[4.6em] max-w-[36ch] text-base leading-relaxed text-slate-600 sm:text-lg"
                data-reveal
                data-delay="1"
                aria-live="polite"
            >
                {steps[step - 1].clause}
            </p>

            <!-- Step Buttons (Pills) -->
            <ol
                class="flex w-full max-w-[520px] flex-wrap gap-2"
                data-reveal
                data-delay="2"
            >
                {#each steps as item (item.id)}
                    <li>
                        <button
                            type="button"
                            class="inline-flex min-h-[40px] items-center justify-center whitespace-nowrap rounded-full border px-4 text-xs font-bold transition-all duration-180 active:scale-97 select-none {step ===
                            item.id
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-900/14 bg-transparent text-slate-600 hover:border-slate-900/28 hover:text-slate-900'}"
                            aria-current={step === item.id ? "step" : undefined}
                            onclick={() => (step = item.id)}
                        >
                            {item.id}. {item.short}
                        </button>
                    </li>
                {/each}
            </ol>
        </div>

        <!-- Right Column: Interactive Stage Sheets -->
        <div
            class="relative rounded-3xl border border-black/8 bg-gradient-to-br from-[#fbf8f4] to-[#f4eee7] p-3 sm:p-6"
            data-reveal
            data-delay="1"
            data-ui
            data-parallax="0.04"
        >
            <!-- Step 1 Sheet: Catat Komposisi HPP -->
            <div
                class="flex min-h-[360px] flex-col gap-4 rounded-2xl border border-black/8 bg-white p-4 text-slate-900 shadow-[0_1px_2px_rgba(17,17,17,0.04),0_8px_24px_-8px_rgba(17,17,17,0.1),0_24px_48px_-24px_rgba(17,17,17,0.12)] transition-all duration-260 hover:-translate-y-0.5 sm:p-6"
                data-ui
                hidden={step !== 1}
            >
                <p
                    class="flex items-baseline justify-between gap-2 border-b border-black/8 pb-3 text-xs font-semibold text-slate-500 sm:text-sm"
                >
                    <span class="font-bold text-slate-900">Langkah 1</span>
                    <span>Nasi goreng telur balado</span>
                </p>

                <ul class="flex flex-col">
                    {#each hpp as row (row.label)}
                        <li
                            class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b-2 border-white py-2 text-xs text-slate-600 sm:text-sm"
                        >
                            <span>{row.label}</span>
                            <span
                                class="font-bold tracking-tight text-slate-900 tabular-nums"
                                >{rupiah(row.value)}</span
                            >
                        </li>
                    {/each}
                </ul>

                <p
                    class="mt-auto flex items-baseline justify-between gap-2 border-t border-black/8 pt-3 text-xs text-slate-500 sm:text-sm"
                >
                    <span>Lima komponen</span>
                    <span>Sisa bisa ditambah sendiri</span>
                </p>
            </div>

            <!-- Step 2 Sheet: Hitung Otomatis -->
            <div
                class="flex min-h-[360px] flex-col gap-4 rounded-2xl border border-black/8 bg-white p-4 text-slate-900 shadow-[0_1px_2px_rgba(17,17,17,0.04),0_8px_24px_-8px_rgba(17,17,17,0.1),0_24px_48px_-24px_rgba(17,17,17,0.12)] transition-all duration-260 hover:-translate-y-0.5 sm:p-6"
                data-ui
                hidden={step !== 2}
            >
                <p
                    class="flex items-baseline justify-between gap-2 border-b border-black/8 pb-3 text-xs font-semibold text-slate-500 sm:text-sm"
                >
                    <span class="font-bold text-slate-900">Langkah 2</span>
                    <span>Otomatis</span>
                </p>

                <p
                    class="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl"
                >
                    HPP {rupiah(hppTotal)} per piring.
                </p>

                <div class="mt-2 grid grid-cols-3 gap-3">
                    <div>
                        <p
                            class="text-lg font-extrabold tracking-tight text-slate-900 sm:text-2xl [font-variant-numeric:lining-nums_proportional-nums]"
                        >
                            {rupiah(hppTotal)}
                        </p>
                        <p class="text-xs text-slate-500">total HPP</p>
                    </div>
                    <div>
                        <p
                            class="text-lg font-extrabold tracking-tight text-slate-900 sm:text-2xl [font-variant-numeric:lining-nums_proportional-nums]"
                        >
                            {percent(45)}
                        </p>
                        <p class="text-xs text-slate-500">target margin</p>
                    </div>
                    <div>
                        <p
                            class="text-lg font-extrabold tracking-tight text-slate-900 sm:text-2xl [font-variant-numeric:lining-nums_proportional-nums]"
                        >
                            {rupiah(18500)}
                        </p>
                        <p class="text-xs text-slate-500">harga jual</p>
                    </div>
                </div>

                <p
                    class="mt-auto flex flex-wrap items-baseline justify-between gap-2 border-t border-black/8 pt-3 text-xs text-slate-500 sm:text-sm"
                >
                    <span>Harga dihitung dari HPP dan target margin</span>
                    <span>Dibulatkan ke Rp 500</span>
                </p>
            </div>

            <!-- Step 3 Sheet: Bandingkan Menu -->
            <div
                class="flex min-h-[360px] flex-col gap-4 rounded-2xl border border-black/8 bg-white p-4 text-slate-900 shadow-[0_1px_2px_rgba(17,17,17,0.04),0_8px_24px_-8px_rgba(17,17,17,0.1),0_24px_48px_-24px_rgba(17,17,17,0.12)] transition-all duration-260 hover:-translate-y-0.5 sm:p-6"
                data-ui
                hidden={step !== 3}
            >
                <p
                    class="flex items-baseline justify-between gap-2 border-b border-black/8 pb-3 text-xs font-semibold text-slate-500 sm:text-sm"
                >
                    <span class="font-bold text-slate-900">Langkah 3</span>
                    <span>Empat menu</span>
                </p>

                <ul class="mt-2 flex flex-col gap-3">
                    {#each compare as row (row.name)}
                        <li
                            class="grid grid-cols-[minmax(6em,8em)_minmax(0,1fr)_4.5em] items-center gap-2 text-xs sm:grid-cols-[minmax(7em,9.5em)_minmax(0,1fr)_4.5em] sm:text-sm"
                        >
                            <span class="text-slate-500">{row.name}</span>
                            <span
                                class="relative h-2 w-full overflow-hidden rounded-full bg-slate-900/7"
                            >
                                <span
                                    class="absolute inset-y-0 left-0 rounded-full transition-[width] duration-520 ease-out {row.margin <
                                    40
                                        ? 'bg-orange-500'
                                        : 'bg-slate-900'}"
                                    style="width: {row.margin}%"
                                ></span>
                            </span>
                            <span class="text-right font-bold tabular-nums"
                                >{percent(row.margin)}</span
                            >
                        </li>
                    {/each}
                </ul>

                <p
                    class="mt-auto flex flex-wrap items-baseline justify-between gap-2 border-t border-black/8 pt-3 text-xs text-slate-500 sm:text-sm"
                >
                    <span>Margin di bawah 40% diberi warna</span>
                    <span>Urut dari yang paling tipis</span>
                </p>
            </div>

            <!-- Step 4 Sheet: Ambil Keputusan -->
            <div
                class="flex min-h-[360px] flex-col gap-4 rounded-2xl border border-black/8 bg-white p-4 text-slate-900 shadow-[0_1px_2px_rgba(17,17,17,0.04),0_8px_24px_-8px_rgba(17,17,17,0.1),0_24px_48px_-24px_rgba(17,17,17,0.12)] transition-all duration-260 hover:-translate-y-0.5 sm:p-6"
                data-ui
                hidden={step !== 4}
            >
                <p
                    class="flex items-baseline justify-between gap-2 border-b border-black/8 pb-3 text-xs font-semibold text-slate-500 sm:text-sm"
                >
                    <span class="font-bold text-slate-900">Langkah 4</span>
                    <span>Keputusan</span>
                </p>

                <p
                    class="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl"
                >
                    Naik Rp 1.500, margin jadi {percent(45.9)}.
                </p>

                <div class="mt-2 grid grid-cols-2 gap-3">
                    <div>
                        <p
                            class="text-lg font-extrabold tracking-tight text-slate-900 sm:text-2xl [font-variant-numeric:lining-nums_proportional-nums]"
                        >
                            {rupiah(18500)}
                        </p>
                        <p class="text-xs text-slate-500">harga baru</p>
                    </div>
                    <div>
                        <p
                            class="text-lg font-extrabold tracking-tight text-slate-900 sm:text-2xl [font-variant-numeric:lining-nums_proportional-nums]"
                        >
                            Rp 1,35 jt
                        </p>
                        <p class="text-xs text-slate-500">tambahan sebulan</p>
                    </div>
                </div>

                <p
                    class="mt-auto flex flex-wrap items-baseline justify-between gap-2 border-t border-black/8 pt-3 text-xs text-slate-500 sm:text-sm"
                >
                    <span>Masih di bawah Rp 20.000</span>
                    <span>30 piring sehari</span>
                </p>
            </div>
        </div>
    </div>
</section>
