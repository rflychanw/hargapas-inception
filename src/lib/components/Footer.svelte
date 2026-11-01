<script lang="ts">
    import Logo from "#lib/components/Logo.svelte";
</script>

<footer class="bg-[#111111] py-10 text-white md:py-16">
    <div class="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <!-- Top Section: Logo & Quick Links -->
        <div
            class="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5"
        >
            <a
                class="inline-flex min-h-[48px] items-center text-xl font-extrabold tracking-tight transition-all duration-180 hover:opacity-85 active:scale-98"
                href="#atas"
                aria-label="HargaPas, kembali ke atas"
            >
                <Logo size={28} variant="horizontal" theme="dark" />
            </a>

            <nav
                class="flex flex-wrap gap-4 text-sm text-white/74"
                aria-label="Tautan kaki"
            >
                <a
                    href="#dashboard"
                    class="inline-flex min-h-[44px] items-center transition-all duration-180 hover:text-orange-500 active:scale-96"
                >
                    Produk
                </a>
                <a
                    href="#cara-kerja"
                    class="inline-flex min-h-[44px] items-center transition-all duration-180 hover:text-orange-500 active:scale-96"
                >
                    Cara kerja
                </a>
                <a
                    href="#tanya"
                    class="inline-flex min-h-[44px] items-center transition-all duration-180 hover:text-orange-500 active:scale-96"
                >
                    Pertanyaan
                </a>
            </nav>
        </div>

        <!-- Main Tagline Display -->
        <p
            class="my-6 max-w-[24ch] break-words text-4xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl"
            data-reveal
        >
            Harga Pas, Untung Pas
        </p>

        <!-- Meta Information Grid -->
        <div
            class="mt-6 grid grid-cols-1 gap-4 border-t-2 border-white/16 pt-4 text-xs leading-relaxed text-white/74 md:grid-cols-3 md:gap-6 sm:text-sm"
        >
            <div>
                <p class="max-w-[44ch]">
                    <b class="font-bold text-white">HargaPas.</b> Jakarta, Indonesia.
                    Senin sampai Jumat.
                </p>
            </div>

            <div>
                <p class="max-w-[44ch]">
                    <b class="font-bold text-white">Produk.</b> Daftar menu, rincian
                    HPP, laporan bulanan, dan konsultan AI dalam satu dashboard.
                </p>
            </div>

            <div>
                <p class="max-w-[44ch]">
                    <b class="font-bold text-white">Gambar.</b> Semua tangkapan layar
                    memakai dashboard HargaPas. Ilustrasi bergaya unDraw berlisensi
                    terbuka.
                </p>
            </div>

            <!-- Legal / Disclaimer -->
            <p
                class="col-span-1 mt-2 max-w-[72ch] text-xs leading-relaxed text-white/74 md:col-span-full"
            >
                © 2026 HargaPas. Contoh menu, HPP, dan harga di halaman ini
                adalah ilustrasi, bukan penawaran atau jaminan pendapatan. Data
                usaha Anda tetap milik Anda.
            </p>
        </div>
    </div>
</footer>
