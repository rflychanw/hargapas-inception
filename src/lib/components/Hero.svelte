<script lang="ts">
    import { formatRupiah } from "#lib/utils/format.ts";
</script>

<section
    class="relative overflow-hidden bg-white py-12 text-slate-900 md:py-24 lg:py-32"
    id="atas"
>
    <div class="mx-auto w-full max-w-360 px-4 sm:px-6 lg:px-10">
        <!-- Head Title -->
        <div class="mb-8 lg:mb-12">
            <h1
                class="max-w-[14ch] text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl leading-[1.02]"
                data-reveal
            >
                Harga Pas, Untung Pas.
            </h1>
        </div>

        <!-- Body Grid -->
        <div
            class="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-16"
        >
            <!-- Column Left: Copywriting & CTA -->
            <div class="flex flex-col items-start gap-6">
                <p
                    class="max-w-[38ch] text-base leading-relaxed text-slate-600 sm:text-lg"
                    data-reveal
                    data-delay="1"
                >
                    HargaPas adalah satu dashboard untuk harga warung: daftar
                    menu, lima komponen HPP, dan margin tiap piring. Semua
                    hitungan pindah ke dalam produk.
                </p>

                <div data-reveal data-delay="2">
                    <a
                        href="/stores"
                        class="group inline-flex h-12 items-center justify-center gap-3 rounded-xl bg-orange-600 px-6 text-base font-bold text-white shadow-lg shadow-orange-600/30 transition-all duration-150 hover:bg-slate-900 hover:shadow-slate-900/20 active:scale-97 md:h-14 md:rounded-2xl md:px-8"
                    >
                        <span>Buka Dashboard</span>
                        <span
                            class="inline-block transition-transform duration-180 group-hover:translate-x-1"
                            aria-hidden="true">→</span
                        >
                    </a>
                </div>

                <p
                    class="max-w-[36ch] text-xs leading-relaxed text-slate-500 sm:text-sm"
                    data-reveal
                    data-delay="3"
                >
                    Contoh di halaman ini memakai nasi goreng telur balado: HPP {formatRupiah(
                        10000,
                    )}, harga jual {formatRupiah(18500)}.
                </p>
            </div>

            <!-- Column Right: Hero Product Showcase (Stage, Laptop, & Phone) -->
            <div
                class="relative rounded-2xl border border-slate-900/10 bg-[radial-gradient(120%_120%_at_12%_0%,#fffdfa_0%,transparent_58%),linear-gradient(165deg,#f8f3ec_0%,#eee7dc_100%)] p-4 sm:p-6 pb-10 sm:pb-16 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_40px_-22px_rgba(17,17,17,0.35)] md:rounded-3xl"
                data-reveal
                data-delay="2"
                data-ui
            >
                <div
                    class="relative w-full drop-shadow-[0_24px_30px_rgba(17,17,17,0.18)]"
                >
                    <!-- Laptop Container -->
                    <div class="relative w-full" data-parallax="0.03">
                        <!-- Screen -->
                        <div
                            class="relative overflow-hidden rounded-[12px_12px_5px_5px] border-[5px] border-b-[4px] border-[#1b1a19] bg-[#1b1a19] shadow-[0_22px_44px_-20px_rgba(17,17,17,0.5)] sm:border-[7px] sm:border-b-[5px]"
                        >
                            <img
                                src="/img/dashboard-laptop.png"
                                alt="Dashboard HargaPas di laptop: ringkasan Warung Bu Sirep, rata-rata margin, dan tabel HPP tiap menu"
                                width="1440"
                                height="900"
                                fetchpriority="high"
                                decoding="async"
                                class="block aspect-[16/10] w-full object-cover object-top-left"
                            />
                        </div>

                        <!-- Base / Keyboard Hinge -->
                        <div
                            aria-hidden="true"
                            class="relative -mx-[4%] -mb-[51px] h-[94px] w-[108%] origin-top rotate-x-[64deg] rounded-b-2xl bg-gradient-to-b from-[#6f6a63] via-[#d8d1c6] to-[#7d766e] shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_-2px_0_rgba(17,17,17,0.18)_inset,0_12px_18px_-10px_rgba(17,17,17,0.45)] perspective-[1100px] before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-b before:from-black/30 before:to-transparent after:absolute after:top-[14px] after:left-1/2 after:h-[9px] after:w-[12%] after:-translate-x-1/2 after:rounded-b-lg after:bg-gradient-to-b after:from-[#7f786f] after:to-[#a49c92] after:shadow-[0_1px_0_rgba(255,255,255,0.4)_inset]"
                        ></div>
                    </div>

                    <!-- Mobile Phone Mockup Overlay -->
                    <div
                        class="absolute -right-[2%] bottom-0 w-[26%] min-w-[88px] max-w-[178px] drop-shadow-[0_26px_34px_rgba(17,17,17,0.32)] after:absolute after:top-[11px] after:left-1/2 after:h-[5px] after:w-[30%] after:-translate-x-1/2 after:rounded-full after:bg-[#1b1a19]"
                        aria-hidden="true"
                        data-parallax="-0.06"
                    >
                        <div
                            class="aspect-[390/844] overflow-hidden rounded-[18px] border-[4px] border-[#1b1a19] bg-[#1b1a19] sm:border-[5px]"
                        >
                            <img
                                src="/img/dashboard-phone.png"
                                alt=""
                                width="390"
                                height="844"
                                loading="lazy"
                                decoding="async"
                                class="block h-full w-full rounded-[13px] object-cover object-top"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
