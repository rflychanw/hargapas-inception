<script lang="ts">
    import type { PageData } from "./$types";
    import { page } from "$app/state";
    import { formatRupiah, formatUnitLabel } from "#lib/utils/format.ts";
    import { Plus, Trash, Layers, Pen, LoaderCircle } from "@lucide/svelte";
    import SEO from "#lib/components/SEO.svelte";
    import Fab from "#lib/components/Fab.svelte";
    import { enhance } from "$app/forms";

    let { data }: { data: PageData } = $props();

    // State lokal untuk melacak ID bahan baku yang sedang dalam proses penghapusan
    let deletingIngredientId = $state<string | null>(null);

    let storeId = $derived(page.params.storeId || "");
</script>

<SEO title="Bahan Baku" />

<div class="relative space-y-6 font-sans sm:space-y-8">
    <!-- Page Header Banner (Instan Render) -->
    <div
        class="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:rounded-3xl sm:p-6 md:p-8"
    >
        <div class="flex items-center gap-3">
            <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-600 sm:h-12 sm:w-12 sm:rounded-2xl"
            >
                <Layers class="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div class="min-w-0 flex-1">
                <h1
                    class="truncate text-base font-extrabold text-slate-900 sm:text-2xl md:text-3xl"
                >
                    Inventaris Bahan Baku
                </h1>
                <p
                    class="hidden text-xs font-medium text-slate-500 sm:block sm:text-sm"
                >
                    Kelola harga grosir dan konversi satuan dasar untuk
                    kalkulasi HPP.
                </p>
            </div>
        </div>

        <!-- Tombol Tambah (Desktop) -->
        <a
            href="/stores/{storeId}/ingredients/new"
            class="hidden shrink-0 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95 sm:inline-flex"
        >
            <Plus class="h-4 w-4" />
            <span>Tambah Bahan Baku</span>
        </a>
    </div>

    <!-- STREAMING DATA INVENTARIS BAHAN BAKU -->
    {#await data.ingredients}
        <!-- Mobile View Skeleton Cards Grid -->
        <div class="grid grid-cols-1 gap-3 sm:hidden">
            {#each Array(4) as _}
                <div
                    class="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs"
                >
                    <div class="flex items-start justify-between gap-2">
                        <div class="space-y-1.5">
                            <div
                                class="h-5 w-32 animate-pulse rounded-lg bg-slate-200/80"
                            ></div>
                            <div
                                class="h-3 w-20 animate-pulse rounded-md bg-slate-200/60"
                            ></div>
                        </div>
                        <div class="flex items-center gap-1">
                            <div
                                class="h-7 w-7 animate-pulse rounded-xl bg-slate-200/60"
                            ></div>
                            <div
                                class="h-7 w-7 animate-pulse rounded-xl bg-slate-200/60"
                            ></div>
                        </div>
                    </div>
                    <div
                        class="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3"
                    >
                        <div class="space-y-1">
                            <div
                                class="h-3 w-16 animate-pulse rounded-md bg-slate-200/60"
                            ></div>
                            <div
                                class="h-4 w-20 animate-pulse rounded-md bg-slate-200/80"
                            ></div>
                        </div>
                        <div class="space-y-1">
                            <div
                                class="h-3 w-16 animate-pulse rounded-md bg-slate-200/60"
                            ></div>
                            <div
                                class="h-4 w-20 animate-pulse rounded-md bg-slate-200/80"
                            ></div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>

        <!-- Desktop View Skeleton Table -->
        <div
            class="hidden overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:block"
        >
            <div class="space-y-4">
                <div
                    class="h-4 w-full animate-pulse rounded-md bg-slate-200/70"
                ></div>
                <div
                    class="h-4 w-full animate-pulse rounded-md bg-slate-200/60"
                ></div>
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
    {:then ingredients}
        {#if ingredients.length === 0}
            <!-- Empty State -->
            <div
                class="space-y-4 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-xs sm:p-12"
            >
                <div
                    class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-500"
                >
                    <Layers class="h-7 w-7" />
                </div>
                <div>
                    <h3 class="text-base font-bold text-slate-900">
                        Belum Ada Bahan Baku
                    </h3>
                    <p
                        class="mx-auto mt-1 max-w-sm text-xs font-medium text-slate-400"
                    >
                        Tambahkan bahan baku pertama Anda (misal: Kopi, Susu,
                        Beras, Minyak) untuk mulai menyusun resep HPP.
                    </p>
                </div>
                <a
                    href="/stores/{storeId}/ingredients/new"
                    class="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95"
                >
                    <Plus class="h-4 w-4" />
                    <span>Tambah Bahan Sekarang</span>
                </a>
            </div>
        {:else}
            <!-- Mobile View: Cards Grid -->
            <div class="grid grid-cols-1 gap-3 sm:hidden">
                {#each ingredients as ing (ing.id)}
                    {@const purchasePrice = Number(ing.purchasePrice ?? 0)}
                    {@const unitCapacity = Number(ing.unitCapacity ?? 1)}
                    {@const costPerUnit = Number(ing.costPerUnit ?? 0)}
                    {@const purchaseUnit = ing.purchaseUnit || "kg"}
                    <div
                        class="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs"
                    >
                        <div class="flex items-start justify-between gap-2">
                            <div>
                                <h3 class="font-bold text-slate-900">
                                    {ing.name}
                                </h3>
                                <p class="text-xs text-slate-500">
                                    {formatUnitLabel(
                                        purchaseUnit,
                                        unitCapacity,
                                    )}
                                </p>
                            </div>
                            <div class="flex items-center gap-1">
                                <a
                                    href="/{storeId}/ingredients/{ing.id}/edit"
                                    class="rounded-xl p-1.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-800"
                                    title="Ubah bahan baku"
                                >
                                    <Pen class="h-4 w-4" />
                                </a>
                                <!-- FORM HAPUS BAHAN BAKU -->
                                <form
                                    method="POST"
                                    action="?/delete"
                                    class="inline"
                                    use:enhance={({ cancel }) => {
                                        // Konfirmasi konvensional sebelum mengirim request
                                        if (
                                            !confirm(
                                                `Hapus bahan baku "${ing.name}"? Resep yang memakai bahan ini akan terhapus otomatis.`,
                                            )
                                        ) {
                                            cancel(); // Batal kirim request jika pengguna menolak
                                            return;
                                        }

                                        // Tandai ID item yang sedang dihapus untuk menampilkan spinner
                                        deletingIngredientId = ing.id;

                                        return async ({ update }) => {
                                            deletingIngredientId = null;
                                            await update();
                                        };
                                    }}
                                >
                                    <input
                                        type="hidden"
                                        name="id"
                                        value={ing.id}
                                    />
                                    <input
                                        type="hidden"
                                        name="storeId"
                                        value={storeId}
                                    />

                                    <button
                                        type="submit"
                                        disabled={deletingIngredientId ===
                                            ing.id}
                                        class="rounded-xl p-1.5 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 disabled:hover:bg-transparent"
                                        title="Hapus bahan baku"
                                    >
                                        {#if deletingIngredientId === ing.id}
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
                        <div
                            class="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs"
                        >
                            <div>
                                <span
                                    class="text-[10px] font-bold text-slate-400 uppercase"
                                    >Harga Grosir</span
                                >
                                <div class="font-extrabold text-slate-800">
                                    {formatRupiah(purchasePrice)}
                                </div>
                            </div>
                            <div>
                                <span
                                    class="text-[10px] font-bold text-slate-400 uppercase"
                                    >Modal / Satuan</span
                                >
                                <div class="font-extrabold text-orange-600">
                                    {formatRupiah(costPerUnit)} / {purchaseUnit ===
                                    "kg"
                                        ? "gram"
                                        : purchaseUnit === "liter"
                                          ? "ml"
                                          : "pcs"}
                                </div>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>

            <!-- Desktop View: Table -->
            <div
                class="hidden overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs sm:block"
            >
                <div class="overflow-x-auto">
                    <table
                        class="w-full border-collapse text-left text-sm text-slate-600"
                    >
                        <thead>
                            <tr
                                class="border-b border-slate-100 bg-slate-50/80 text-[11px] font-extrabold tracking-wider text-slate-400 uppercase"
                            >
                                <th class="px-6 py-4">Nama Bahan</th>
                                <th class="px-6 py-4">Harga Beli Grosir</th>
                                <th class="px-6 py-4">Satuan & Kapasitas</th>
                                <th class="px-6 py-4">Biaya / Satuan Dasar</th>
                                <th class="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 font-medium">
                            {#each ingredients as ing (ing.id)}
                                {@const purchasePrice = Number(
                                    ing.purchasePrice ?? 0,
                                )}
                                {@const unitCapacity = Number(
                                    ing.unitCapacity ?? 1,
                                )}
                                {@const costPerUnit = Number(
                                    ing.costPerUnit ?? 0,
                                )}
                                {@const purchaseUnit = ing.purchaseUnit || "kg"}
                                <tr
                                    class="transition-colors hover:bg-slate-50/80"
                                >
                                    <td
                                        class="px-6 py-4 font-bold text-slate-900"
                                    >
                                        {ing.name}
                                    </td>
                                    <td class="px-6 py-4 text-slate-700">
                                        {formatRupiah(purchasePrice)}
                                    </td>
                                    <td class="px-6 py-4 text-slate-500">
                                        {formatUnitLabel(
                                            purchaseUnit,
                                            unitCapacity,
                                        )}
                                    </td>
                                    <td
                                        class="px-6 py-4 font-extrabold text-orange-600"
                                    >
                                        {formatRupiah(costPerUnit)} / {purchaseUnit ===
                                        "kg"
                                            ? "gram"
                                            : purchaseUnit === "liter"
                                              ? "ml"
                                              : "pcs"}
                                    </td>
                                    <td class="px-6 py-4">
                                        <div
                                            class="flex items-center justify-end gap-1"
                                        >
                                            <a
                                                href="/{storeId}/ingredients/{ing.id}/edit"
                                                class="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-800"
                                                title="Ubah bahan baku"
                                            >
                                                <Pen class="h-4 w-4" />
                                            </a>
                                            <form
                                                method="POST"
                                                action="?/delete"
                                                class="inline-flex"
                                                onsubmit={(e) => {
                                                    if (
                                                        !confirm(
                                                            `Hapus bahan baku "${ing.name}"? Resep yang memakai bahan ini akan terhapus otomatis.`,
                                                        )
                                                    ) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            >
                                                <input
                                                    type="hidden"
                                                    name="id"
                                                    value={ing.id}
                                                />
                                                <input
                                                    type="hidden"
                                                    name="storeId"
                                                    value={storeId}
                                                />
                                                <button
                                                    type="submit"
                                                    class="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600"
                                                    title="Hapus bahan baku"
                                                >
                                                    <Trash class="h-4 w-4" />
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        {/if}
    {:catch error}
        <div
            class="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-center text-xs text-rose-600"
        >
            Gagal memuat data bahan baku: {error.message ||
                "Terjadi kesalahan sistem."}
        </div>
    {/await}

    <!-- Floating Action Button (FAB) Mobile -->
    <Fab
        href="/stores/{storeId}/ingredients/new"
        label="Tambah Bahan Baku Baru"
    />
</div>
