<!-- src/routes/[storeId]/dashboard/+page.svelte -->
<!-- src/routes/[storeId]/dashboard/+page.svelte -->
<script lang="ts">
    import type { PageData } from "./$types";
    import { page } from "$app/state";
    import { formatRupiah, formatPercent } from "#lib/utils/format.ts";
    import {
        Store as StoreIcon,
        TrendingUp,
        ShoppingBag,
        Percent,
        SlidersHorizontal,
        Check,
        CircleAlert,
        Target,
        ChevronRight,
        LoaderCircle,
    } from "@lucide/svelte";
    import SEO from "#lib/components/SEO.svelte";
    import SelectInput from "#lib/components/SelectInput.svelte";
    import { slide } from "svelte/transition";
    import { enhance } from "$app/forms";

    let { data }: { data: PageData } = $props();

    let storeId = $derived(page.params.storeId || "");
    let storeName = $state("Memuat toko...");
    let targetMargin = $state(0.35);

    let isEditingSettings = $state(false);
    let isSavingSettings = $state(false);

    let editStoreName = $state("");
    let editTargetMargin = $state<number>(0.35);

    const marginOptions = [
        { value: 0.25, label: "25% (Volume Tinggi)" },
        { value: 0.3, label: "30% (Standar Makanan)" },
        { value: 0.35, label: "35% (Ideal Kuliner)" },
        { value: 0.4, label: "40% (Kedai Kopi / Minuman)" },
        { value: 0.5, label: "50% (Margin Premium)" },
    ];

    // Resolve data.store secara reaktif
    $effect(() => {
        if (data.store) {
            Promise.resolve(data.store).then((s) => {
                if (s) {
                    storeName = s.storeName || "Dashboard Toko";
                    // Kunci 1: Paksa konversi ke Number agar cocok dengan marginOptions
                    targetMargin = Number(s.targetMargin) || 0.35;

                    // Kunci 2: Update state form SELALU jika sedang TIDAK diedit pengguna
                    if (!isEditingSettings) {
                        editStoreName = storeName;
                        editTargetMargin = targetMargin;
                    }
                }
            });
        }
    });

    // Helper untuk membuka/menutup form edit
    function toggleEditSettings() {
        if (!isEditingSettings) {
            // Setiap kali tombol edit dibuka, paksa sinkronkan dari targetMargin terbaru
            editStoreName = storeName;
            editTargetMargin = targetMargin;
        }
        isEditingSettings = !isEditingSettings;
    }
</script>

<SEO title="Dashboard" />

<div class="space-y-5 pb-12 font-sans sm:space-y-6 sm:pb-0">
    <!-- HEADER BANNER & PENGATURAN TOKO (Render Instan 0ms) -->
    <div class="flex flex-col gap-3 sm:gap-4">
        <div
            class="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs sm:flex-row sm:items-center sm:p-6"
        >
            <div class="flex items-center gap-3">
                <div
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-600 shadow-2xs sm:h-12 sm:w-12"
                >
                    <StoreIcon class="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div class="min-w-0 flex-1">
                    <h1
                        class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-2xl"
                    >
                        {storeName}
                    </h1>
                    <div
                        class="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-slate-500"
                    >
                        <span>Target Margin:</span>
                        <span
                            class="inline-flex items-center gap-1 rounded-md border border-orange-200/80 bg-orange-50/80 px-2 py-0.5 text-xs font-semibold text-orange-800"
                        >
                            <Target class="h-3 w-3 text-orange-600" />
                            {formatPercent(targetMargin)}
                        </span>
                    </div>
                </div>
            </div>

            <button
                type="button"
                onclick={toggleEditSettings}
                class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
                <SlidersHorizontal class="h-3.5 w-3.5 text-slate-500" />
                <span
                    >{isEditingSettings
                        ? "Tutup Pengaturan"
                        : "Ubah Pengaturan"}</span
                >
            </button>
        </div>

        <!-- Form Edit Pengaturan Toko -->
        {#if isEditingSettings}
            <div transition:slide={{ duration: 250 }}>
                <!-- FORM EDIT PENGATURAN TOKO -->
                <form
                    method="POST"
                    action="?/updateSettings"
                    use:enhance={() => {
                        isSavingSettings = true;
                        return async ({ update }) => {
                            isSavingSettings = false;
                            isEditingSettings = false;
                            await update();
                        };
                    }}
                    class="space-y-4 rounded-2xl border border-orange-200/80 bg-orange-50/50 p-4 shadow-2xs sm:p-6"
                >
                    <div
                        class="flex items-center gap-2 border-b border-orange-200/60 pb-3"
                    >
                        <SlidersHorizontal class="h-4 w-4 text-orange-600" />
                        <h3 class="text-xs font-bold text-slate-900 sm:text-sm">
                            Ubah Pengaturan Toko
                        </h3>
                    </div>

                    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label
                                for="storeName"
                                class="mb-1 block text-xs font-semibold text-slate-700"
                            >
                                Nama Toko
                            </label>
                            <input
                                type="text"
                                id="storeName"
                                name="storeName"
                                required
                                disabled={isSavingSettings}
                                bind:value={editStoreName}
                                placeholder="Masukkan nama toko..."
                                class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none disabled:opacity-60"
                            />
                        </div>

                        <SelectInput
                            id="targetMargin"
                            name="targetMargin"
                            label="Target Margin Keuntungan"
                            disabled={isSavingSettings}
                            bind:value={editTargetMargin}
                            options={marginOptions}
                        />
                    </div>

                    <div class="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            disabled={isSavingSettings}
                            onclick={() => (isEditingSettings = false)}
                            class="rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-50 active:scale-[0.98] disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSavingSettings || !editStoreName.trim()}
                            class="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-orange-700 active:scale-[0.98] disabled:opacity-50"
                        >
                            {#if isSavingSettings}
                                <LoaderCircle class="h-4 w-4 animate-spin" />
                                <span>Menyimpan...</span>
                            {:else}
                                <Check class="h-4 w-4" />
                                <span>Simpan Perubahan</span>
                            {/if}
                        </button>
                    </div>
                </form>
            </div>
        {/if}
    </div>

    <!-- STREAMING DATA DASHBOARD ANALISIS (METRICS & ANALYSIS TABLE) -->
    {#await data.analysis}
        <!-- SKELETON LOADER METRIC CARDS -->
        <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {#each Array(4) as _}
                <div
                    class="flex h-28 flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs sm:p-5"
                >
                    <div class="flex items-center justify-between">
                        <div
                            class="h-3 w-20 animate-pulse rounded-md bg-slate-200/70"
                        ></div>
                        <div
                            class="h-8 w-8 animate-pulse rounded-xl bg-slate-200/60"
                        ></div>
                    </div>
                    <div class="space-y-1.5">
                        <div
                            class="h-7 w-16 animate-pulse rounded-lg bg-slate-200/80"
                        ></div>
                        <div
                            class="h-3 w-24 animate-pulse rounded-md bg-slate-200/60"
                        ></div>
                    </div>
                </div>
            {/each}
        </div>

        <!-- SKELETON LOADER TABLE/LIST -->
        <div class="space-y-3">
            <div class="flex items-center justify-between px-1">
                <div
                    class="h-4 w-44 animate-pulse rounded-md bg-slate-200/70"
                ></div>
                <div
                    class="h-4 w-20 animate-pulse rounded-md bg-slate-200/70"
                ></div>
            </div>
            <!-- Mobile Skeleton List -->
            <div class="space-y-2.5 sm:hidden">
                {#each Array(3) as _}
                    <div
                        class="h-28 animate-pulse rounded-2xl border border-slate-200/80 bg-white p-4"
                    ></div>
                {/each}
            </div>
            <!-- Desktop Skeleton Table -->
            <div
                class="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 sm:block"
            >
                <div class="space-y-3">
                    <div
                        class="h-4 w-full animate-pulse rounded-md bg-slate-200/60"
                    ></div>
                    <div
                        class="h-4 w-full animate-pulse rounded-md bg-slate-200/60"
                    ></div>
                    <div
                        class="h-4 w-full animate-pulse rounded-md bg-slate-200/60"
                    ></div>
                </div>
            </div>
        </div>
    {:then analysis}
        {@const avgMargin = analysis?.avgMargin || 0}
        {@const currentTargetMargin = targetMargin}
        {@const marginDiff = avgMargin - currentTargetMargin}
        {@const totalMenuCount = analysis?.totalMenuCount || 0}
        {@const starCount = analysis?.starCount || 0}
        {@const plowhorseCount = analysis?.plowhorseCount || 0}
        {@const starRatio =
            totalMenuCount > 0 ? (starCount / totalMenuCount) * 100 : 0}
        {@const evalRatio =
            totalMenuCount > 0 ? (plowhorseCount / totalMenuCount) * 100 : 0}

        <!-- Metric Cards Grid -->
        <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <!-- Card 1: Total Varian -->
            <div
                class="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs sm:p-5"
            >
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-500"
                        >Total Varian</span
                    >
                    <div
                        class="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 sm:h-9 sm:w-9"
                    >
                        <ShoppingBag class="h-4 w-4" />
                    </div>
                </div>
                <div class="mt-3">
                    <span
                        class="text-2xl font-black text-slate-900 sm:text-4xl"
                    >
                        {totalMenuCount}
                    </span>
                    <p class="mt-1 text-[10px] text-slate-400 sm:text-xs">
                        {totalMenuCount > 0
                            ? `${totalMenuCount} resep aktif`
                            : "Belum ada resep"}
                    </p>
                </div>
            </div>

            <!-- Card 2: Rata-Rata Margin -->
            <div
                class="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs sm:p-5"
            >
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-500"
                        >Avg Margin</span
                    >
                    <div
                        class="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600 sm:h-9 sm:w-9"
                    >
                        <Percent class="h-4 w-4" />
                    </div>
                </div>
                <div class="mt-3">
                    <span
                        class="text-2xl font-black text-orange-600 sm:text-4xl"
                    >
                        {formatPercent(avgMargin)}
                    </span>
                    <p
                        class="mt-1 text-[10px] font-semibold sm:text-xs {marginDiff >=
                        0
                            ? 'text-emerald-600'
                            : 'text-rose-600'}"
                    >
                        {marginDiff >= 0 ? "+" : ""}{formatPercent(marginDiff)} dari
                        target
                    </p>
                </div>
            </div>

            <!-- Card 3: Menu Bintang -->
            <div
                class="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs sm:p-5"
            >
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-500"
                        >Menu Bintang</span
                    >
                    <div
                        class="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 sm:h-9 sm:w-9"
                    >
                        <TrendingUp class="h-4 w-4" />
                    </div>
                </div>
                <div class="mt-3">
                    <span
                        class="text-2xl font-black text-emerald-600 sm:text-4xl"
                    >
                        {starCount}
                    </span>
                    <p class="mt-1 text-[10px] text-slate-400 sm:text-xs">
                        {starRatio > 0
                            ? `${formatPercent(starRatio / 100)} dari katalog`
                            : "Belum ada"}
                    </p>
                </div>
            </div>

            <!-- Card 4: Perlu Evaluasi -->
            <div
                class="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs sm:p-5"
            >
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-500"
                        >Evaluasi</span
                    >
                    <div
                        class="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 sm:h-9 sm:w-9"
                    >
                        <CircleAlert class="h-4 w-4" />
                    </div>
                </div>
                <div class="mt-3">
                    <span class="text-2xl font-black text-rose-600 sm:text-4xl">
                        {plowhorseCount}
                    </span>
                    <p class="mt-1 text-[10px] text-slate-400 sm:text-xs">
                        {plowhorseCount > 0
                            ? `Margin < target (${formatPercent(evalRatio / 100)})`
                            : "Semua sehat"}
                    </p>
                </div>
            </div>
        </div>

        <!-- Analisis Performa HPP Menu -->
        <div class="space-y-3">
            <div class="flex items-center justify-between px-1">
                <h2 class="text-sm font-bold text-slate-900 sm:text-base">
                    Analisis Performa HPP Menu
                </h2>
                <a
                    href="/{storeId}/menu"
                    class="inline-flex items-center gap-1 text-xs font-bold text-orange-600 transition-colors hover:text-orange-700"
                >
                    <span>Kelola Menu</span>
                    <ChevronRight class="h-3.5 w-3.5" />
                </a>
            </div>

            <!-- Mobile Card List View -->
            <div class="space-y-2.5 sm:hidden">
                {#each analysis?.items || [] as item}
                    {@const margin = item.currentMargin ?? 0}
                    {@const hppVal = item.totalHpp ?? 0}
                    {@const isHealthy = margin >= currentTargetMargin}
                    <div
                        class="space-y-2.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs"
                    >
                        <div class="flex items-start justify-between gap-2">
                            <h3 class="text-sm font-bold text-slate-900">
                                {item.menuName}
                            </h3>
                            <span
                                class="inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold {isHealthy
                                    ? 'border-emerald-200/80 bg-emerald-50 text-emerald-800'
                                    : 'border-rose-200/80 bg-rose-50 text-rose-800'}"
                            >
                                {isHealthy
                                    ? "Sesuai Target"
                                    : "Di Bawah Target"}
                            </span>
                        </div>
                        <div
                            class="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2.5 text-center text-xs"
                        >
                            <div>
                                <span
                                    class="text-[9px] font-bold text-slate-400 uppercase"
                                    >Harga</span
                                >
                                <div
                                    class="mt-0.5 font-extrabold text-slate-800"
                                >
                                    {formatRupiah(item.sellingPrice ?? 0)}
                                </div>
                            </div>
                            <div>
                                <span
                                    class="text-[9px] font-bold text-slate-400 uppercase"
                                    >HPP</span
                                >
                                <div
                                    class="mt-0.5 font-extrabold text-slate-800"
                                >
                                    {formatRupiah(hppVal)}
                                </div>
                            </div>
                            <div>
                                <span
                                    class="text-[9px] font-bold text-slate-400 uppercase"
                                    >Margin</span
                                >
                                <div
                                    class="mt-0.5 font-extrabold {isHealthy
                                        ? 'text-emerald-600'
                                        : 'text-rose-600'}"
                                >
                                    {formatPercent(margin)}
                                </div>
                            </div>
                        </div>
                    </div>
                {:else}
                    <div
                        class="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-slate-400"
                    >
                        Belum ada data menu terdaftar.
                    </div>
                {/each}
            </div>

            <!-- Desktop Table View -->
            <div
                class="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white sm:block"
            >
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs text-slate-600">
                        <thead
                            class="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500"
                        >
                            <tr>
                                <th class="px-5 py-3">Nama Menu</th>
                                <th class="px-5 py-3">Harga Jual</th>
                                <th class="px-5 py-3">HPP (Modal)</th>
                                <th class="px-5 py-3">Margin Keuntungan</th>
                                <th class="px-5 py-3">Status Target</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 font-medium">
                            {#each analysis?.items || [] as item}
                                {@const margin = item.currentMargin ?? 0}
                                {@const hppVal = item.totalHpp ?? 0}
                                {@const isHealthy =
                                    margin >= currentTargetMargin}
                                <tr
                                    class="transition-colors hover:bg-slate-50/60"
                                >
                                    <td
                                        class="px-5 py-3.5 font-bold text-slate-900"
                                        >{item.menuName}</td
                                    >
                                    <td class="px-5 py-3.5"
                                        >{formatRupiah(
                                            item.sellingPrice ?? 0,
                                        )}</td
                                    >
                                    <td class="px-5 py-3.5"
                                        >{formatRupiah(hppVal)}</td
                                    >
                                    <td
                                        class="px-5 py-3.5 font-bold {isHealthy
                                            ? 'text-emerald-600'
                                            : 'text-rose-600'}"
                                    >
                                        {formatPercent(margin)}
                                    </td>
                                    <td class="px-5 py-3.5">
                                        {#if isHealthy}
                                            <span
                                                class="inline-flex items-center rounded-md border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800"
                                            >
                                                Sesuai Target
                                            </span>
                                        {:else}
                                            <span
                                                class="inline-flex items-center rounded-md border border-rose-200/80 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-800"
                                            >
                                                Di Bawah Target
                                            </span>
                                        {/if}
                                    </td>
                                </tr>
                            {:else}
                                <tr>
                                    <td
                                        colspan="5"
                                        class="px-5 py-8 text-center text-xs font-medium text-slate-400"
                                    >
                                        Belum ada data menu untuk toko ini.
                                        Silakan tambahkan menu di tab "Menu &
                                        Resep".
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    {:catch error}
        <div
            class="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-center text-xs text-rose-600"
        >
            Gagal memuat data analisis dashboard: {error.message ||
                "Terjadi kesalahan sistem."}
        </div>
    {/await}
</div>
