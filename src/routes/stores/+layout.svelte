<!-- src/routes/stores/+layout.svelte -->
<script lang="ts">
    import { page } from "$app/state";
    import {
        CircleCheck,
        CircleAlert,
        Store,
        PanelLeftClose,
        PanelLeftOpen,
    } from "@lucide/svelte";
    import SEO from "#lib/components/SEO.svelte";
    import SidebarNav from "#lib/components/SidebarNav.svelte";
    import { onNavigate } from "$app/navigation";
    import favicon from "#lib/assets/favicon.svg";

    let { children } = $props();

    let isCollapsed = $state(true);
    let seedMessage = $state<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    let currentStoreId = $derived(page.params.storeId);
    let currentStoreName = $derived(
        page.data?.store?.storeName || "Toko Aktif",
    );

    // Picu View Transitions API setiap kali terjadi navigasi rute
    onNavigate((navigation) => {
        if (!document.startViewTransition) return;

        return new Promise((resolve) => {
            document.startViewTransition(async () => {
                resolve();
                await navigation.complete;
            });
        });
    });

    function toggleSidebar() {
        isCollapsed = !isCollapsed;
    }
</script>

<svelte:head>
    <link rel="icon" type="image/svg+xml" href={favicon} />
</svelte:head>

<SEO
    title="HargaPas"
    description="Selesaikan masalah penentuan harga jualan anda di HargaPas"
/>

<div
    class="flex min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-orange-100 selection:text-orange-900"
>
    <!-- Vertical Sidebar (Khusus Layar Desktop / md:flex) -->
    <aside
        class="fixed inset-y-0 left-0 z-1000 hidden h-screen shrink-0 flex-col justify-between overflow-hidden bg-white shadow-md transition-all duration-300 ease-in-out sm:p-4 md:sticky md:top-0 md:flex md:shadow-none {currentStoreId
            ? 'border-r border-slate-200 p-3 opacity-100 ' +
              (isCollapsed ? 'md:w-20' : 'md:w-64')
            : 'w-0 border-none p-0 opacity-0 md:w-0'}"
    >
        <div class="flex flex-col gap-5">
            <!-- Header Sidebar: Logo Web & Toggle Button -->
            <div class="relative flex flex-col items-center">
                <div class="flex w-full items-center justify-between gap-2">
                    <a
                        href="/"
                        class="group flex items-center gap-3 overflow-hidden p-1 md:{isCollapsed
                            ? 'hidden'
                            : 'flex'}"
                    >
                        <img
                            src={favicon}
                            alt="HargaPas Logo"
                            class="h-8 w-8 shrink-0 object-contain"
                        />
                        <div
                            class="overflow-hidden transition-opacity duration-200"
                        >
                            <div class="flex items-center gap-1.5">
                                <span
                                    class="text-base font-bold tracking-tight whitespace-nowrap text-slate-900"
                                >
                                    HargaPas
                                </span>
                            </div>
                            <p
                                class="truncate text-[11px] font-medium text-slate-400"
                            >
                                Solusi Harga Terbaik
                            </p>
                        </div>
                    </a>

                    {#if !isCollapsed}
                        <button
                            onclick={toggleSidebar}
                            class="hidden h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 md:flex"
                            title="Tutup Sidebar"
                        >
                            <PanelLeftClose class="h-4 w-4" />
                        </button>
                    {/if}
                </div>

                {#if isCollapsed}
                    <button
                        onclick={toggleSidebar}
                        class="hidden h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-800 md:flex"
                        title="Buka Sidebar"
                    >
                        <PanelLeftOpen class="h-5 w-5" />
                    </button>
                {/if}
            </div>

            <!-- Navigation Links & Store Info -->
            {#if currentStoreId}
                <div class="flex w-full flex-col">
                    <div
                        class="overflow-hidden transition-all duration-300 ease-in-out {isCollapsed
                            ? 'mb-0 max-h-0 opacity-0'
                            : 'mb-4 max-h-20 opacity-100'}"
                    >
                        <div
                            class="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 p-2.5"
                            title={currentStoreName}
                        >
                            <div
                                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-orange-600 shadow-xs"
                            >
                                <Store class="h-4 w-4" />
                            </div>
                            <div class="overflow-hidden whitespace-nowrap">
                                <h4
                                    class="truncate text-xs font-bold text-slate-900"
                                >
                                    {currentStoreName}
                                </h4>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-1">
                        <p
                            class="mb-2 px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase transition-opacity md:{isCollapsed
                                ? 'hidden'
                                : 'block'}"
                        >
                            Menu Utama
                        </p>

                        <SidebarNav
                            {currentStoreId}
                            {isCollapsed}
                            variant="vertical"
                        />
                    </div>
                </div>
            {/if}
        </div>

        <div class="flex border-t border-slate-100 pt-4">
            {#if currentStoreId}
                <a
                    href="/"
                    title="Ganti Toko"
                    class="flex w-full items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 md:{isCollapsed
                        ? 'justify-center px-0'
                        : ''}"
                >
                    <Store class="h-4 w-4 shrink-0 text-slate-500" />
                    <span
                        class="truncate md:{isCollapsed ? 'hidden' : 'inline'}"
                        >Ganti Toko</span
                    >
                </a>
            {/if}
        </div>
    </aside>

    <!-- Right Main Layout -->
    <div class="flex min-w-0 flex-1 flex-col">
        <!-- Header khusus Tampilan Mobile (Rapi & Menyatu) -->
        <header
            class="fixed top-0 z-40 flex h-14 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md md:hidden"
        >
            <!-- Brand Left -->
            <a href="/stores" class="flex items-center gap-2">
                <img
                    src={favicon}
                    alt="HargaPas Logo"
                    class="h-6 w-6 shrink-0 object-contain"
                />
                <span class="text-sm font-bold text-slate-900">HargaPas</span>
            </a>

            <!-- Store Action Right (Hanya Ikon Toko Tanpa Teks) -->
            {#if currentStoreId}
                <a
                    href="/stores"
                    title={`Toko: ${currentStoreName} (Klik untuk Ganti Toko)`}
                    class="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-orange-600 shadow-2xs transition-colors active:bg-slate-100"
                >
                    <Store class="h-4 w-4" />
                </a>
            {/if}
        </header>

        {#if seedMessage}
            <div
                class="w-full border-b px-4 py-2.5 text-xs font-medium transition-all sm:px-6 {seedMessage.type ===
                'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-rose-200 bg-rose-50 text-rose-900'}"
            >
                <div class="flex items-center gap-2">
                    {#if seedMessage.type === "success"}
                        <CircleCheck
                            class="h-4 w-4 shrink-0 text-emerald-600"
                        />
                    {:else}
                        <CircleAlert class="h-4 w-4 shrink-0 text-rose-600" />
                    {/if}
                    <span>{seedMessage.text}</span>
                </div>
            </div>
        {/if}

        <main
            class="mx-auto w-full max-w-7xl flex-1 p-4 pt-16 pb-28 sm:p-6 md:pt-10 md:pb-8 lg:p-8"
        >
            {@render children()}
        </main>

        <footer
            class="mt-auto hidden w-full border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 md:block"
        >
            <div
                class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 sm:flex-row"
            >
                <p>
                    <strong class="font-semibold text-slate-800"
                        >HargaPas</strong
                    > — Decision Engine & Financial Simulator UMKM.
                </p>
            </div>
        </footer>
    </div>

    <!-- Bottom Navigation Bar Khusus Mobile -->
    {#if currentStoreId}
        <div
            class="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-md md:hidden"
        >
            <SidebarNav {currentStoreId} variant="horizontal" />
        </div>
    {/if}
</div>
