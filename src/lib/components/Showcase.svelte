<script lang="ts">
    import { hpp, hppTotal, menu } from "#lib/data.js";
    import { number } from "#lib/format.js";
    import { formatPercent, formatRupiah } from "#lib/utils/format.ts";

    let active = $state("menu");

    const panels = [
        { id: "menu", label: "Daftar menu" },
        { id: "hpp", label: "Rincian HPP" },
        { id: "laporan", label: "Laporan bulanan" },
    ];

    const pick =
        menu.find((item) => item.name === "Nasi goreng telur balado") ??
        menu[0];
    const fattest = [...menu].sort((a, b) => b.margin - a.margin).slice(0, 3);
    const maxShare = Math.max(...hpp.map((row) => row.share));
</script>

<section
    id="dashboard"
    class="relative overflow-hidden bg-[#121110] py-12 text-white md:py-24 lg:py-32 bg-[radial-gradient(900px_420px_at_85%_-10%,rgba(255,107,26,0.14),transparent_60%)]"
    aria-labelledby="dashboard-title"
>
    <div
        class="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16 lg:[grid-template-areas:'side_stage'_'photo_stage']"
    >
        <!-- Sidebar / Controls -->
        <div class="flex flex-col gap-4 lg:[grid-area:side]">
            <h2
                id="dashboard-title"
                class="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-[1.08]"
                data-reveal
            >
                Satu layar untuk semua menu.
            </h2>

            <p
                class="max-w-[38ch] text-base leading-relaxed text-slate-300 sm:text-lg"
                data-reveal
                data-delay="1"
            >
                Daftar menu, rincian HPP, dan laporan bulanan ada di tempat yang
                sama. Tidak ada lagi berkas terpisah atau hitungan di kertas.
            </p>

            <!-- Tab Navigation -->
            <div
                class="flex w-full gap-1.5 overflow-x-auto rounded-xl border border-white/10 bg-white/10 p-1 lg:flex-col lg:items-start lg:border-none lg:bg-transparent lg:p-0 scrollbar-none"
                role="tablist"
                aria-label="Tampilan dashboard"
            >
                {#each panels as panel (panel.id)}
                    <button
                        class="flex min-h-[40px] flex-1 items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold tracking-tight transition-all duration-180 hover:text-white active:scale-97 lg:flex-none lg:min-h-[48px] lg:justify-start lg:rounded-none lg:bg-transparent lg:py-2 lg:text-left lg:text-xl lg:hover:before:opacity-75 lg:hover:before:scale-120 {active ===
                        panel.id
                            ? 'bg-white text-slate-900 shadow-md lg:bg-transparent lg:text-white lg:shadow-none'
                            : 'text-slate-300'}"
                        role="tab"
                        id="tab-{panel.id}"
                        aria-selected={active === panel.id}
                        aria-controls="panel-{panel.id}"
                        onclick={() => (active = panel.id)}
                    >
                        <span
                            class="hidden lg:mr-3 lg:inline-block lg:h-2 lg:w-2 lg:rounded-xs lg:transition-all lg:duration-180 {active ===
                            panel.id
                                ? 'bg-orange-500 opacity-100 scale-125'
                                : 'bg-current opacity-40'}"
                            aria-hidden="true"
                        ></span>
                        {panel.label}
                    </button>
                {/each}
            </div>
        </div>

        <!-- Stage Sheet Panel -->
        <div
            class="relative rounded-3xl border border-black/8 bg-gradient-to-br from-[#fbf8f4] to-[#f4eee7] p-2 sm:p-4 lg:[grid-area:stage] lg:h-fit lg:self-start"
            data-reveal
            data-delay="1"
            data-ui
            data-parallax="0.04"
        >
            <!-- Panel 1: Daftar Menu -->
            <div
                class="flex min-h-[400px] flex-col gap-4 rounded-2xl border border-black/8 bg-white p-4 text-slate-900 shadow-[0_1px_2px_rgba(17,17,17,0.04),0_8px_24px_-8px_rgba(17,17,17,0.1),0_24px_48px_-24px_rgba(17,17,17,0.12)] transition-all duration-260 hover:-translate-y-0.5 sm:min-h-[480px] sm:p-6"
                data-ui
                id="panel-menu"
                role="tabpanel"
                aria-labelledby="tab-menu"
                hidden={active !== "menu"}
            >
                <div
                    class="flex flex-wrap items-baseline justify-between gap-2 border-b border-black/8 pb-3 text-sm font-semibold"
                >
                    <p
                        class="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl"
                    >
                        Warung Bu Sirep
                    </p>
                    <p class="text-xs text-slate-500 font-medium sm:text-sm">
                        Daftar menu, 8 menu aktif
                    </p>
                </div>

                <div class="w-full overflow-x-auto">
                    <table
                        class="w-full min-w-[290px] border-collapse text-xs sm:text-sm"
                    >
                        <thead>
                            <tr
                                class="border-b-2 border-slate-900 text-slate-500"
                            >
                                <th scope="col" class="pb-2 text-left font-bold"
                                    >Menu</th
                                >
                                <th
                                    scope="col"
                                    class="pb-2 text-right font-bold">HPP</th
                                >
                                <th
                                    scope="col"
                                    class="pb-2 text-right font-bold">Harga</th
                                >
                                <th
                                    scope="col"
                                    class="pb-2 text-right font-bold">Margin</th
                                >
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            {#each menu as row (row.name)}
                                <tr
                                    class="transition-colors duration-150 hover:bg-slate-900/3"
                                >
                                    <td class="py-2.5 px-1 font-medium"
                                        >{row.name}</td
                                    >
                                    <td
                                        class="py-2.5 px-1 text-right font-bold tabular-nums"
                                        >{number(row.hpp)}</td
                                    >
                                    <td
                                        class="py-2.5 px-1 text-right font-bold tabular-nums"
                                        >{number(row.price)}</td
                                    >
                                    <td
                                        class="py-2.5 px-1 text-right font-bold tabular-nums {row.margin <
                                        40
                                            ? 'bg-orange-500 text-slate-900 font-extrabold px-2'
                                            : ''}"
                                    >
                                        {formatPercent(row.margin)}
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>

                <p
                    class="mt-auto flex flex-wrap items-baseline justify-between gap-2 border-t border-black/8 pt-3 text-xs text-slate-500 sm:text-sm"
                >
                    <span>Margin di bawah 40% ditandai oranye</span>
                    <span>Diperbarui hari ini</span>
                </p>
            </div>

            <!-- Panel 2: Rincian HPP -->
            <div
                class="flex min-h-[400px] flex-col gap-4 rounded-2xl border border-black/8 bg-white p-4 text-slate-900 shadow-[0_1px_2px_rgba(17,17,17,0.04),0_8px_24px_-8px_rgba(17,17,17,0.1),0_24px_48px_-24px_rgba(17,17,17,0.12)] transition-all duration-260 hover:-translate-y-0.5 sm:min-h-[480px] sm:p-6"
                data-ui
                id="panel-hpp"
                role="tabpanel"
                aria-labelledby="tab-hpp"
                hidden={active !== "hpp"}
            >
                <div
                    class="flex flex-wrap items-baseline justify-between gap-2 border-b border-black/8 pb-3 text-sm font-semibold"
                >
                    <p
                        class="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl"
                    >
                        Nasi goreng telur balado
                    </p>
                    <p class="text-xs text-slate-500 font-medium sm:text-sm">
                        Rincian HPP per piring
                    </p>
                </div>

                <ul class="mt-2 flex flex-1 flex-col justify-between gap-3">
                    {#each hpp as row (row.label)}
                        <li
                            class="grid grid-cols-[minmax(6em,8em)_minmax(0,1fr)_4.5em] items-center gap-2 text-xs sm:grid-cols-[minmax(7em,9.5em)_minmax(0,1fr)_4.5em] sm:text-sm"
                        >
                            <span class="text-slate-500">{row.label}</span>
                            <span
                                class="relative h-2 w-full overflow-hidden rounded-full bg-slate-900/7"
                            >
                                <span
                                    class="absolute inset-y-0 left-0 rounded-full transition-[width] duration-520 ease-out {row.share ===
                                    maxShare
                                        ? 'bg-orange-500'
                                        : 'bg-slate-900'}"
                                    style="width: {(row.share / maxShare) *
                                        100}%"
                                ></span>
                            </span>
                            <span class="text-right font-bold tabular-nums"
                                >{formatRupiah(row.value)}</span
                            >
                        </li>
                    {/each}
                </ul>

                <p
                    class="mt-auto flex flex-wrap items-baseline justify-between gap-2 border-t border-black/8 pt-3 text-xs text-slate-500 sm:text-sm"
                >
                    <span>Total HPP {formatRupiah(hppTotal)}</span>
                    <span>Harga jual {formatRupiah(pick.price)}</span>
                </p>
            </div>

            <!-- Panel 3: Laporan Bulanan -->
            <div
                class="flex min-h-[400px] flex-col gap-4 rounded-2xl border border-black/8 bg-white p-4 text-slate-900 shadow-[0_1px_2px_rgba(17,17,17,0.04),0_8px_24px_-8px_rgba(17,17,17,0.1),0_24px_48px_-24px_rgba(17,17,17,0.12)] transition-all duration-260 hover:-translate-y-0.5 sm:min-h-[480px] sm:p-6"
                data-ui
                id="panel-laporan"
                role="tabpanel"
                aria-labelledby="tab-laporan"
                hidden={active !== "laporan"}
            >
                <div
                    class="flex flex-wrap items-baseline justify-between gap-2 border-b border-black/8 pb-3 text-sm font-semibold"
                >
                    <p
                        class="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl"
                    >
                        Satu menu, satu bulan.
                    </p>
                    <p class="text-xs text-slate-500 font-medium sm:text-sm">
                        Laporan bulanan, contoh
                    </p>
                </div>

                <div class="mt-2 grid grid-cols-3 gap-3">
                    <div>
                        <p
                            class="text-lg font-extrabold tracking-tight text-slate-900 sm:text-2xl [font-variant-numeric:lining-nums_proportional-nums]"
                        >
                            30
                        </p>
                        <p class="text-xs text-slate-500">piring sehari</p>
                    </div>
                    <div>
                        <p
                            class="text-lg font-extrabold tracking-tight text-slate-900 sm:text-2xl [font-variant-numeric:lining-nums_proportional-nums]"
                        >
                            {formatPercent(45.9)}
                        </p>
                        <p class="text-xs text-slate-500">
                            margin setelah naik
                        </p>
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

                <ul class="mt-2 flex flex-1 flex-col justify-center gap-3">
                    {#each fattest as row (row.name)}
                        <li
                            class="grid flex-1 grid-cols-[minmax(6em,8em)_minmax(0,1fr)_4.5em] items-center gap-2 text-xs sm:grid-cols-[minmax(7em,9.5em)_minmax(0,1fr)_4.5em] sm:text-sm"
                        >
                            <span class="text-slate-500">{row.name}</span>
                            <span
                                class="relative h-2 w-full overflow-hidden rounded-full bg-slate-900/7"
                            >
                                <span
                                    class="absolute inset-y-0 left-0 rounded-full bg-slate-900 transition-[width] duration-520 ease-out"
                                    style="width: {row.margin}%"
                                ></span>
                            </span>
                            <span class="text-right font-bold tabular-nums"
                                >{formatPercent(row.margin)}</span
                            >
                        </li>
                    {/each}
                </ul>

                <p
                    class="mt-auto flex flex-wrap items-baseline justify-between gap-2 border-t border-black/8 pt-3 text-xs text-slate-500 sm:text-sm"
                >
                    <span>Tiga menu bermargin paling tebal</span>
                    <span>Diunduh sebagai PDF</span>
                </p>
            </div>
        </div>

        <!-- Showcase Photo Figure -->
        <figure
            class="mt-2 w-full max-w-[360px] lg:[grid-area:photo]"
            data-reveal
            data-delay="2"
            data-parallax="0.06"
        >
            <img
                src="/img/undraw_market.svg"
                alt="Ilustrasi belanja bahan baku segar di pasar"
                width="800"
                height="600"
                loading="lazy"
                decoding="async"
                class="aspect-[16/10] w-full max-h-[180px] rounded-2xl border border-slate-200 bg-white p-2.5 object-contain shadow-xs lg:aspect-[4/3] lg:max-h-none lg:p-3"
            />
            <figcaption
                class="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm"
            >
                Harga bahan berubah tiap pekan. Angka di dashboard ikut diubah,
                margin langsung terlihat.
            </figcaption>
        </figure>
    </div>
</section>
