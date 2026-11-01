import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * Gerak halus & elegan saat menggulir untuk landing page HargaPas (Desktop & Mobile).
 *
 * 1. Lenis Smooth Momentum Scroll — Gulir halaman terasa sangat halus (silky smooth)
 *    dengan kurva inersia fisika responsif dan dukungan navigasi anchor mulus.
 * 2. Staggered Hero Reveal — Elemen hero muncul bertahap dan anggun saat halaman pertama kali dimuat.
 * 3. Intersection Reveal — Elemen [data-reveal] masuk dengan kurva fisik lembut saat discroll.
 * 4. Continuous Parallax — Elemen [data-parallax] bergerak sinkron dengan frame scroll pada 60/120fps.
 *
 * Efek dinonaktifkan secara bersih jika pengguna menyetel "prefers-reduced-motion: reduce".
 */

/** @typedef {{ el: HTMLElement, speed: number, base: number }} Layer */

/**
 * Pasang smooth scrolling + reveal + parallax motion, lalu kembalikan fungsi pembersih.
 * @returns {() => void}
 */
export function initLandingMotion() {
    if (typeof window === "undefined") return () => {};

    const reduceMotion =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /** @type {HTMLElement[]} */
    const reveals = Array.from(document.querySelectorAll("[data-reveal]"));

    if (reduceMotion) {
        reveals.forEach((el) => el.classList.add("is-in"));
        return () => {};
    }

    const isMobile = window.innerWidth < 768;

    /* ---- 1. Lenis Smooth Momentum Scrolling ------------------------- */
    const lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.4,
        infinite: false,
    });

    let rafId = 0;
    /** @param {number} time */
    function raf(time) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Muluskan navigasi lompatan anchor link (contoh: #dashboard, #cara-kerja, #tanya, #atas)
    /** @param {MouseEvent} e */
    const handleAnchorClick = (e) => {
        const target = /** @type {HTMLElement | null} */ (e.target);
        const anchor = target?.closest('a[href^="#"]');
        if (!anchor) return;
        const href = anchor.getAttribute("href");
        if (!href || href === "#") return;

        const scrollTarget =
            href === "#atas" ? document.body : document.querySelector(href);
        if (scrollTarget) {
            e.preventDefault();
            lenis.scrollTo(/** @type {HTMLElement} */ (scrollTarget), {
                offset: -72,
                duration: 1.15,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            });
        }
    };
    document.addEventListener("click", handleAnchorClick);

    /* ---- 2. Continuous Parallax Layers ------------------------------ */
    /** @type {Layer[]} */
    const layers = Array.from(
        document.querySelectorAll("[data-parallax]"),
    ).map((node) => {
        const el = /** @type {HTMLElement} */ (node);
        return { el, speed: Number(el.dataset.parallax) || 0.05, base: 0 };
    });

    const measureLayers = () => {
        const scrollY = window.scrollY;
        for (const layer of layers) {
            layer.el.style.removeProperty("--parallax-y");
            const rect = layer.el.getBoundingClientRect();
            layer.base = rect.top + scrollY + rect.height / 2;
        }
    };

    /** @param {number} currentScroll */
    const updateParallax = (currentScroll) => {
        const vh = window.innerHeight;
        const amplitude = isMobile ? 40 : 80;

        for (const layer of layers) {
            const center = layer.base - currentScroll;
            // Lewati elemen yang berada jauh di luar layar
            if (center < -vh || center > vh * 2) continue;

            const delta = Math.max(-1.2, Math.min(1.2, (center - vh / 2) / vh));
            const y = delta * layer.speed * amplitude;
            layer.el.style.setProperty("--parallax-y", `${y.toFixed(2)}px`);
        }
    };

    const onResize = () => {
        measureLayers();
        updateParallax(window.scrollY);
    };

    if (layers.length > 0) {
        measureLayers();
        updateParallax(window.scrollY);

        // Update parallax sinkron dengan frame gulir Lenis
        lenis.on("scroll", (e) => {
            updateParallax(e.scroll);
        });

        window.addEventListener("resize", onResize, { passive: true });
    }

    /* ---- 3. Staggered Hero + Intersection Observer Reveals ---------- */
    /** @param {HTMLElement} el */
    const show = (el) => el.classList.add("is-in");

    /** @type {IntersectionObserver | null} */
    let observer = null;

    if (!("IntersectionObserver" in window)) {
        reveals.forEach(show);
    } else {
        observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    show(/** @type {HTMLElement} */ (entry.target));
                    observer?.unobserve(entry.target);
                }
            },
            {
                threshold: 0.06,
                rootMargin: isMobile
                    ? "0px 0px -25px 0px"
                    : "0px 0px -40px 0px",
            },
        );

        const fold = window.innerHeight * 0.88;
        /** @type {HTMLElement[]} */
        const heroItems = [];
        /** @type {HTMLElement[]} */
        const scrollItems = [];

        for (const el of reveals) {
            const rect = el.getBoundingClientRect();
            if (rect.top < fold) {
                heroItems.push(el);
            } else {
                scrollItems.push(el);
            }
        }

        // Munculkan elemen Hero lipatan pertama bertahap & elegan
        heroItems.forEach((el, index) => {
            setTimeout(
                () => {
                    show(el);
                },
                60 + index * 75,
            );
        });

        // Elemen di bawah lipatan dipantau saat pengguna menggulir
        scrollItems.forEach((el) => observer?.observe(el));
    }

    /* ---- 4. Cleanup Function ---------------------------------------- */
    return () => {
        observer?.disconnect();
        if (rafId) cancelAnimationFrame(rafId);
        document.removeEventListener("click", handleAnchorClick);
        if (layers.length > 0) {
            window.removeEventListener("resize", onResize);
        }
        lenis.destroy();
    };
}
