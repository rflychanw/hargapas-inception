<script lang="ts">
    import { onMount } from "svelte";
    import { slide, fade } from "svelte/transition";
    import Logo from "#lib/components/Logo.svelte";

    type NavItem = { id: string; label: string; drawer: string };

    const sections: NavItem[] = [
        { id: "dashboard", label: "Produk", drawer: "Produk & Ringkasan" },
        {
            id: "cara-kerja",
            label: "Cara kerja",
            drawer: "Cara Kerja 4 Langkah",
        },
        { id: "hpp", label: "Rincian HPP", drawer: "5 Komponen HPP" },
        { id: "konsultan", label: "Konsultan", drawer: "Tanya Konsultan AI" },
        { id: "tanya", label: "Tanya", drawer: "Pertanyaan Umum" },
    ];

    const desktopItems = sections.filter((item) => item.id !== "konsultan");

    let isScrolled = $state(false);
    let isMobileMenuOpen = $state(false);
    let isOverDark = $state(false);
    let activeId = $state("");
    let progress = $state(0);

    onMount(() => {
        let frame = 0;
        let queued = false;

        const read = () => {
            queued = false;
            const y = window.scrollY;
            const vh = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;

            isScrolled = y > 12;
            progress =
                docHeight > vh
                    ? Math.min(1, Math.max(0, y / (docHeight - vh)))
                    : 0;

            const navProbe = y + 72;
            const readProbe = y + Math.min(vh * 0.4, 340);

            let dark = false;
            let current = "";

            for (const item of sections) {
                const el = document.getElementById(item.id);
                if (!el) continue;

                const rect = el.getBoundingClientRect();
                const top = rect.top + y;
                const bottom = top + rect.height;

                if (
                    navProbe >= top &&
                    navProbe < bottom &&
                    el.classList.contains("chapter--ink")
                ) {
                    dark = true;
                }

                if (!current && readProbe >= top && readProbe < bottom)
                    current = item.id;
            }

            if (!current && y + vh >= docHeight - 4) {
                current = sections[sections.length - 1].id;
            }

            isOverDark = dark;
            activeId = current;
        };

        const onScroll = () => {
            if (queued) return;
            queued = true;
            frame = requestAnimationFrame(read);
        };

        read();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });

        return () => {
            if (frame) cancelAnimationFrame(frame);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            document.body.style.overflow = "";
        };
    });

    $effect(() => {
        if (typeof document !== "undefined") {
            if (isMobileMenuOpen) {
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.overflow = "";
            }
        }
    });

    function handleLinkClick() {
        isMobileMenuOpen = false;
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape" && isMobileMenuOpen) {
            isMobileMenuOpen = false;
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

<header
    class="sticky top-0 left-0 right-0 z-100 border-b pt-[env(safe-area-inset-top,0px)] backdrop-blur-md transition-colors duration-250 ease-out select-none {isOverDark
        ? isMobileMenuOpen
            ? 'bg-[#111111] border-white/12 text-white'
            : isScrolled
              ? 'bg-[#111111]/96 border-white/16 shadow-2xl shadow-black/35 text-white'
              : 'bg-[#111111]/92 border-white/12 shadow-xl shadow-black/35 text-white'
        : isMobileMenuOpen
          ? 'bg-white border-black/8 text-slate-900'
          : isScrolled
            ? 'bg-white/98 border-black/10 shadow-md shadow-black/5 text-slate-900'
            : 'bg-white/94 border-black/8 text-slate-900'}"
    aria-label="Navigasi Utama"
>
    <div class="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div
            class="flex h-[60px] items-center justify-between gap-4 md:h-[68px]"
        >
            <!-- Logo / Wordmark -->
            <a
                class="inline-flex min-h-[44px] items-center gap-2.5 text-decoration-none"
                href="#atas"
                aria-label="HargaPas, ke awal halaman"
                onclick={handleLinkClick}
            >
                <Logo
                    size={28}
                    variant="horizontal"
                    theme={isOverDark ? "dark" : "light"}
                />
            </a>

            <!-- Desktop Nav (>= 768px) -->
            <nav
                class="hidden items-center gap-7 md:flex"
                aria-label="Menu navigasi desktop"
            >
                {#each desktopItems as item (item.id)}
                    <a
                        href="#{item.id}"
                        class="relative min-h-[48px] px-1 inline-flex items-center text-sm font-medium transition-colors duration-180 after:absolute after:bottom-[9px] after:left-2 after:right-2 after:h-[2px] after:rounded-full after:origin-left after:scale-x-0 after:transition-transform after:duration-260 after:ease-[cubic-bezier(0.23,1,0.32,1)] hover:after:scale-x-100 hover:after:opacity-40 {activeId ===
                        item.id
                            ? isOverDark
                                ? 'text-orange-400 after:bg-orange-400 after:scale-x-100 after:opacity-100'
                                : 'text-orange-600 after:bg-orange-600 after:scale-x-100 after:opacity-100'
                            : isOverDark
                              ? 'text-white/76 hover:text-white after:bg-orange-400'
                              : 'text-slate-600 hover:text-orange-600 after:bg-orange-600'}"
                        aria-current={activeId === item.id ? "true" : undefined}
                        onclick={() => (activeId = item.id)}
                    >
                        {item.label}
                    </a>
                {/each}
            </nav>

            <!-- Desktop CTA Button (>= 768px) -->
            <div class="hidden md:block">
                <a
                    href="/stores"
                    class="group inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-orange-600 px-4.5 text-sm font-bold text-white shadow-md shadow-orange-600/25 transition-all duration-150 hover:bg-slate-900 active:scale-97"
                >
                    <span>Buka Dashboard</span>
                    <span
                        class="inline-block transition-transform duration-180 group-hover:translate-x-1"
                        aria-hidden="true">→</span
                    >
                </a>
            </div>

            <!-- Mobile Nav Toggle (< 768px) -->
            <div class="flex items-center md:hidden">
                <button
                    type="button"
                    class="flex h-10 w-10 items-center justify-center rounded-xl border border-black/8 transition-all duration-150 active:scale-95 touch-manipulation {isOverDark
                        ? 'bg-white/10 text-white border-white/18 active:bg-white/18'
                        : 'bg-slate-100 text-slate-900 border-black/8 active:bg-slate-200'}"
                    aria-label={isMobileMenuOpen
                        ? "Tutup menu"
                        : "Buka menu navigasi"}
                    aria-expanded={isMobileMenuOpen}
                    onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
                >
                    {#if isMobileMenuOpen}
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    {:else}
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <line x1="4" y1="7" x2="20" y2="7"></line>
                            <line x1="4" y1="12" x2="20" y2="12"></line>
                            <line x1="4" y1="17" x2="20" y2="17"></line>
                        </svg>
                    {/if}
                </button>
            </div>
        </div>
    </div>

    <!-- Progress Bar Pengguliran -->
    <div
        class="pointer-events-none absolute inset-x-0 -bottom-px h-[2px] origin-left bg-gradient-to-r from-orange-400 to-orange-600 transition-transform duration-90 ease-linear"
        aria-hidden="true"
        style="transform: scaleX({progress})"
    ></div>

    <!-- Mobile Menu Drawer (< 768px) -->
    {#if isMobileMenuOpen}
        <div
            class="relative z-101 border-b shadow-xl md:hidden {isOverDark
                ? 'bg-[#111111] border-white/12'
                : 'bg-white border-black/8'}"
            transition:slide={{ duration: 220 }}
        >
            <div class="mx-auto w-full max-w-[1440px] px-4 pt-2 pb-5 sm:px-6">
                <nav
                    class="flex flex-col gap-0.5"
                    aria-label="Menu navigasi mobile"
                >
                    {#each sections as item (item.id)}
                        <a
                            href="#{item.id}"
                            class="group flex min-h-[48px] items-center justify-between rounded-xl px-3.5 py-3 text-base font-semibold tracking-tight transition-colors duration-120 {activeId ===
                            item.id
                                ? isOverDark
                                    ? 'bg-orange-500/14 text-orange-400'
                                    : 'bg-orange-500/8 text-orange-600'
                                : isOverDark
                                  ? 'text-white active:bg-orange-500/14 active:text-orange-400'
                                  : 'text-slate-900 active:bg-orange-500/8 active:text-orange-600'}"
                            aria-current={activeId === item.id
                                ? "true"
                                : undefined}
                            onclick={() => {
                                activeId = item.id;
                                handleLinkClick();
                            }}
                        >
                            <span>{item.drawer}</span>
                            <span
                                class="text-sm transition-all duration-150 group-active:translate-x-1 {activeId ===
                                item.id
                                    ? isOverDark
                                        ? 'text-orange-400'
                                        : 'text-orange-600'
                                    : 'text-slate-400'}"
                            >
                                →
                            </span>
                        </a>
                    {/each}
                </nav>

                <div
                    class="mt-3.5 border-t pt-3.5 {isOverDark
                        ? 'border-white/10'
                        : 'border-black/6'}"
                >
                    <a
                        href="/stores"
                        class="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 text-base font-bold text-white shadow-lg shadow-orange-600/35 transition-all duration-150 active:scale-98"
                        onclick={handleLinkClick}
                    >
                        <span>Buka Dashboard</span>
                        <span aria-hidden="true">→</span>
                    </a>
                </div>
            </div>
        </div>

        <!-- Backdrop Modal Blur -->
        <div
            class="fixed inset-x-0 bottom-0 top-[60px] z-99 bg-black/35 backdrop-blur-xs md:hidden"
            transition:fade={{ duration: 180 }}
            onclick={() => (isMobileMenuOpen = false)}
            aria-hidden="true"
        ></div>
    {/if}
</header>
