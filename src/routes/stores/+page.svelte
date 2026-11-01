<!-- src/routes/stores/+page.svelte -->
<script lang="ts">
    import type { PageData } from "./$types";
    import { formatPercent } from "#lib/utils/format.ts";
    import {
        Store,
        Plus,
        BuildingComplex,
        ChevronRight,
        Target,
        Trash,
        LoaderCircle,
    } from "@lucide/svelte";
    import SEO from "#lib/components/SEO.svelte";
    import { enhance } from "$app/forms";

    let { data }: { data: PageData } = $props();

    let isCreating = $state(false);
    let isSubmitting = $state(false);
    let newStoreName = $state("");
    let newTargetMargin = $state(0.35);
    let deletingStoreId = $state<string | null>(null);
</script>

<SEO title="Market" description="Pintu Masuk ke Dashboard Toko Anda" />

<div class="mx-auto max-w-6xl space-y-6 px-4 py-8 font-sans">
    <!-- Header Banner -->
    <div
        class="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs sm:flex-row sm:items-center"
    >
        <div class="space-y-1">
            <div class="flex items-center gap-2.5">
                <h1
                    class="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
                >
                    Pilih Warung / Toko
                </h1>
                {#await data.stores}
                    <span class="h-5 w-12 animate-pulse rounded-md bg-slate-200"
                    ></span>
                {:then stores}
                    <span
                        class="rounded-md bg-orange-100/80 px-2 py-0.5 text-xs font-semibold text-orange-800"
                    >
                        {stores.length} Unit
                    </span>
                {/await}
            </div>
            <p class="text-xs font-medium text-slate-500 sm:text-sm">
                Pilih unit usaha untuk mengelola analisis HPP, resep, dan
                simulasi margin keuntungan.
            </p>
        </div>

        <button
            onclick={() => (isCreating = !isCreating)}
            class="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-orange-700 active:scale-[0.98] sm:text-sm"
        >
            <Plus class="h-4 w-4" />
            <span>{isCreating ? "Batal" : "Tambah Toko Baru"}</span>
        </button>
    </div>

    {#if isCreating}
        <!-- FORM REGISTRASI TOKO BARU -->
        <form
            method="POST"
            action="?/createStore"
            use:enhance={() => {
                isSubmitting = true;
                return async ({ update }) => {
                    isSubmitting = false;
                    isCreating = false;
                    await update();
                };
            }}
            class="space-y-5 rounded-2xl border border-orange-200/80 bg-orange-50/50 p-6 transition-all"
        >
            <div
                class="flex items-center gap-2 border-b border-orange-200/60 pb-3"
            >
                <div
                    class="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-600 text-xs font-bold text-white shadow-2xs"
                >
                    +
                </div>
                <h2 class="text-sm font-bold text-slate-900">
                    Registrasi Toko Baru
                </h2>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label
                        for="storeName"
                        class="mb-1 block text-xs font-semibold text-slate-700"
                    >
                        Nama Toko / Warung
                    </label>
                    <input
                        type="text"
                        id="storeName"
                        name="storeName"
                        required
                        disabled={isSubmitting}
                        bind:value={newStoreName}
                        placeholder="Contoh: Kopi Kenangan Manis"
                        class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none disabled:opacity-60"
                    />
                </div>

                <div>
                    <label
                        for="targetMargin"
                        class="mb-1 block text-xs font-semibold text-slate-700"
                    >
                        Target Margin Keuntungan
                    </label>
                    <select
                        id="targetMargin"
                        name="targetMargin"
                        disabled={isSubmitting}
                        bind:value={newTargetMargin}
                        class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none disabled:opacity-60"
                    >
                        <option value={0.25}>25% (Volume Tinggi)</option>
                        <option value={0.3}>30% (Standar Makanan)</option>
                        <option value={0.35}>35% (Ideal Kuliner)</option>
                        <option value={0.4}>40% (Kedai Kopi / Minuman)</option>
                        <option value={0.5}>50% (Margin Premium)</option>
                    </select>
                </div>
            </div>

            <div class="flex justify-end gap-2.5 pt-1">
                <button
                    type="button"
                    disabled={isSubmitting}
                    onclick={() => (isCreating = false)}
                    class="rounded-xl border border-slate-200/80 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-50 active:scale-[0.98] disabled:opacity-50"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || !newStoreName.trim()}
                    class="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-orange-700 active:scale-[0.98] disabled:opacity-50"
                >
                    {#if isSubmitting}
                        <LoaderCircle class="h-3.5 w-3.5 animate-spin" />
                        <span>Membuat Toko...</span>
                    {:else}
                        <span>Simpan & Buka Dashboard</span>
                    {/if}
                </button>
            </div>
        </form>
    {/if}

    <!-- Daftar Toko Streamed -->
    {#await data.stores}
        <!-- SKELETON LOADER (Tampil instan selagi data di-stream dari server) -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {#each Array(3) as _}
                <div
                    class="flex h-44 flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs"
                >
                    <div class="space-y-3">
                        <div class="flex items-start justify-between gap-2">
                            <div
                                class="h-10 w-10 animate-pulse rounded-xl bg-slate-200/70"
                            ></div>
                            <div
                                class="h-6 w-16 animate-pulse rounded-md bg-slate-200/70"
                            ></div>
                        </div>
                        <div class="space-y-2 pt-1">
                            <div
                                class="h-5 w-3/4 animate-pulse rounded-lg bg-slate-200/80"
                            ></div>
                            <div
                                class="h-3 w-1/2 animate-pulse rounded-md bg-slate-200/60"
                            ></div>
                        </div>
                    </div>
                    <div
                        class="flex items-center justify-between border-t border-slate-100 pt-3"
                    >
                        <div
                            class="h-4 w-24 animate-pulse rounded-md bg-slate-200/60"
                        ></div>
                        <div
                            class="h-4 w-4 animate-pulse rounded-full bg-slate-200/60"
                        ></div>
                    </div>
                </div>
            {/each}
        </div>
    {:then stores}
        {#if stores.length === 0}
            <!-- STATE KOSONG -->
            <div
                class="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"
            >
                <div
                    class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500"
                >
                    <BuildingComplex class="h-6 w-6" />
                </div>
                <h3 class="text-sm font-bold text-slate-800">
                    Belum Ada Toko Terdaftar
                </h3>
                <p
                    class="mx-auto mt-1 max-w-sm text-xs font-medium text-slate-500"
                >
                    Klik tombol di atas untuk membuat toko pertama atau jalankan
                    perintah seeder database.
                </p>
            </div>
        {:else}
            <!-- DAFTAR TOKO -->
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {#each stores as store (store.id)}
                    <a
                        href="/stores/{store.id}/dashboard"
                        class="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 transition-all hover:border-orange-300 hover:bg-slate-50/50 active:scale-[0.99]"
                    >
                        <div class="space-y-3">
                            <div class="flex items-start justify-between gap-2">
                                <!-- Store Icon -->
                                <div
                                    class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-700 transition-colors group-hover:border-orange-200 group-hover:bg-orange-50 group-hover:text-orange-600"
                                >
                                    <Store class="h-5 w-5" />
                                </div>

                                <div class="flex items-center gap-2">
                                    <!-- Target Margin Badge -->
                                    <span
                                        class="inline-flex items-center gap-1 rounded-md border border-slate-200/80 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700"
                                    >
                                        <Target
                                            class="h-3.5 w-3.5 text-slate-400"
                                        />
                                        {formatPercent(
                                            store.targetMargin ??
                                                store.targetMargin,
                                        )}
                                    </span>

                                    <!-- DELETE STORE FORM BUTTON -->
                                    <form
                                        method="POST"
                                        action="?/deleteStore"
                                        class="inline"
                                        use:enhance={({ cancel }) => {
                                            if (
                                                !confirm(
                                                    `Hapus toko "${store.storeName}" dan seluruh data di dalamnya?`,
                                                )
                                            ) {
                                                cancel();
                                                return;
                                            }

                                            deletingStoreId = store.id;

                                            return async ({ update }) => {
                                                deletingStoreId = null;
                                                await update();
                                            };
                                        }}
                                    >
                                        <input
                                            type="hidden"
                                            name="storeId"
                                            value={store.id}
                                        />
                                        <button
                                            type="submit"
                                            disabled={deletingStoreId ===
                                                store.id}
                                            onclick={(e) => e.stopPropagation()}
                                            class="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
                                            title="Hapus Toko"
                                        >
                                            {#if deletingStoreId === store.id}
                                                <LoaderCircle
                                                    class="h-4 w-4 animate-spin text-rose-600"
                                                />
                                            {:else}
                                                <Trash class="h-4 w-4" />
                                            {/if}
                                        </button>
                                    </form>
                                </div>
                            </div>

                            <div>
                                <h3
                                    class="text-base font-bold text-slate-900 transition-colors group-hover:text-orange-600"
                                >
                                    {store.storeName || store.storeName}
                                </h3>
                                <p
                                    class="mt-0.5 text-xs font-medium text-slate-400"
                                >
                                    ID: <code class="font-mono text-[11px]"
                                        >{store.id.slice(0, 8)}...</code
                                    >
                                </p>
                            </div>
                        </div>

                        <div
                            class="mt-6 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-orange-600"
                        >
                            <span>Buka Dashboard</span>
                            <ChevronRight
                                class="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                            />
                        </div>
                    </a>
                {/each}
            </div>
        {/if}
    {:catch error}
        <!-- STATE ERROR -->
        <div
            class="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-center text-xs text-rose-600"
        >
            Gagal memuat data toko dari database: {error.message ||
                "Terjadi kesalahan sistem."}
        </div>
    {/await}
</div>
