<!-- src/lib/components/dashboard/StickyFormBar.svelte -->
<script lang="ts">
    import type { Snippet } from "svelte";
    import { ArrowLeft, Save, LoaderCircle } from "@lucide/svelte";
    import { formatRupiah, formatPercent } from "#lib/utils/format.ts";

    interface Props {
        backUrl: string;
        saveLabel?: string;
        disabled?: boolean;
        // Opsional: Untuk form resep menu
        calculatedHpp?: number;
        calculatedProfit?: number;
        calculatedMargin?: number;
        targetMargin?: number;
        // Custom slot preview jika tidak menggunakan ringkasan HPP/Profit/Margin
        children?: Snippet;
    }

    let {
        backUrl,
        saveLabel = "Simpan Perubahan",
        disabled = false,
        calculatedHpp,
        calculatedProfit,
        calculatedMargin,
        targetMargin = 0,
        children,
    }: Props = $props();
</script>

<div
    class="fixed inset-x-0 bottom-16 z-30 border-t border-slate-800 bg-slate-900/95 p-3 text-white shadow-2xl backdrop-blur-md sm:relative sm:bottom-0 sm:mt-6 sm:rounded-2xl sm:border-none sm:p-4"
>
    <div class="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <!-- Tombol Batal & Kembali (Ikon Panah) -->
        <a
            href={disabled ? "#" : backUrl}
            aria-label="Kembali"
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 transition-all hover:bg-slate-700 hover:text-white active:scale-95 {disabled
                ? 'pointer-events-none opacity-50'
                : ''}"
            title="Batal & Kembali"
        >
            <ArrowLeft class="h-5 w-5" />
        </a>

        <!-- Area Tengah: Custom Slot Preview ATAU Ringkasan HPP/Profit/Margin -->
        {#if children}
            <div class="flex flex-1 items-center justify-center text-center">
                {@render children()}
            </div>
        {:else if calculatedHpp !== undefined}
            <div class="grid flex-1 grid-cols-3 gap-1 text-center text-xs">
                <div>
                    <div
                        class="text-[9px] font-bold tracking-wider text-slate-400 uppercase sm:text-[10px]"
                    >
                        Total HPP
                    </div>
                    <div
                        class="mt-0.5 text-xs font-extrabold text-white sm:text-base"
                    >
                        {formatRupiah(calculatedHpp)}
                    </div>
                </div>
                <div>
                    <div
                        class="text-[9px] font-bold tracking-wider text-slate-400 uppercase sm:text-[10px]"
                    >
                        Profit
                    </div>
                    <div
                        class="mt-0.5 text-xs font-extrabold sm:text-base {(calculatedProfit ??
                            0) >= 0
                            ? 'text-emerald-400'
                            : 'text-rose-400'}"
                    >
                        {formatRupiah(calculatedProfit ?? 0)}
                    </div>
                </div>
                <div>
                    <div
                        class="text-[9px] font-bold tracking-wider text-slate-400 uppercase sm:text-[10px]"
                    >
                        Margin
                    </div>
                    <div
                        class="mt-0.5 text-xs font-extrabold sm:text-base {(calculatedMargin ??
                            0) >= targetMargin
                            ? 'text-orange-400'
                            : 'text-rose-400'}"
                    >
                        {formatPercent(calculatedMargin ?? 0)}
                    </div>
                </div>
            </div>
        {/if}

        <!-- Tombol Simpan Ikon Logo -->
        <button
            type="submit"
            {disabled}
            aria-label={saveLabel}
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md shadow-orange-500/30 transition-all hover:bg-orange-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-orange-500/50 disabled:opacity-60 disabled:shadow-none disabled:active:scale-100"
            title={saveLabel}
        >
            {#if disabled}
                <LoaderCircle class="h-5 w-5 animate-spin text-white" />
            {:else}
                <Save class="h-5 w-5" />
            {/if}
        </button>
    </div>
</div>
