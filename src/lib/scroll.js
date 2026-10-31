/**
 * Gerak halus saat menggulir untuk landing page.
 *
 * 1. Reveal  — elemen [data-reveal] muncul sekali saat masuk layar.
 * 2. Parallax — elemen [data-parallax="0.08"] bergeser sedikit lebih lambat
 *    dari gulirannya, supaya halaman terasa punya kedalaman.
 *
 * Semua efek dimatikan bila pengguna memilih "kurangi gerak"
 * (prefers-reduced-motion: reduce) atau layar sempit yang mudah tersendat.
 */

/** @typedef {{ el: HTMLElement, speed: number, base: number }} Layer */

/**
 * Pasang reveal + parallax, lalu kembalikan fungsi pembersih.
 * @returns {() => void}
 */
export function initLandingMotion() {
	const reduceMotion =
		typeof window.matchMedia === 'function' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/** @type {Element[]} */
	const reveals = Array.from(document.querySelectorAll('[data-reveal]'));

	const canParallax = !reduceMotion && window.innerWidth >= 768;

	/** @type {Layer[]} */
	const layers = canParallax
		? Array.from(document.querySelectorAll('[data-parallax]')).map((node) => {
				const el = /** @type {HTMLElement} */ (node);
				return { el, speed: Number(el.dataset.parallax) || 0.08, base: 0 };
			})
		: [];

	/* ---- 1. Reveal --------------------------------------------------- */

	/** @param {Element} el */
	const show = (el) => el.classList.add('is-in');

	/** @type {IntersectionObserver | null} */
	let observer = null;

	if (!('IntersectionObserver' in window)) {
		reveals.forEach(show);
	} else {
		observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					show(entry.target);
					observer?.unobserve(entry.target);
				}
			},
			// Mulai sedikit sebelum elemen benar-benar menyentuh bawah layar,
			// lalu hentikan observasi: animasi hanya berjalan sekali.
			{ threshold: 0.01, rootMargin: '0px 0px -10% 0px' }
		);

		const fold = window.innerHeight * 0.92;
		for (const el of reveals) {
			if (el.getBoundingClientRect().top < fold) show(el);
			else observer.observe(el);
		}
	}

	/* ---- 2. Parallax ------------------------------------------------- */

	let frame = 0;
	let ticking = false;

	const measure = () => {
		const scrollY = window.scrollY;
		for (const layer of layers) {
			layer.el.style.removeProperty('--parallax-y');
			const rect = layer.el.getBoundingClientRect();
			layer.base = rect.top + scrollY + rect.height / 2;
		}
	};

	const paint = () => {
		ticking = false;
		const vh = window.innerHeight;
		const scrollY = window.scrollY;

		for (const layer of layers) {
			const center = layer.base - scrollY;
			// Lewati elemen yang jauh dari layar: tidak perlu dihitung.
			if (center < -vh * 0.5 || center > vh * 1.5) continue;
			const delta = Math.max(-1, Math.min(1, (center - vh / 2) / vh));
			const y = delta * layer.speed * 120;
			layer.el.style.setProperty('--parallax-y', `${y.toFixed(2)}px`);
		}
	};

	const requestPaint = () => {
		if (ticking) return;
		ticking = true;
		frame = requestAnimationFrame(paint);
	};

	const onResize = () => {
		measure();
		requestPaint();
	};

	if (layers.length) {
		measure();
		requestPaint();
		window.addEventListener('scroll', requestPaint, { passive: true });
		window.addEventListener('resize', onResize, { passive: true });
	}

	/* ---- 3. Bersih-bersih -------------------------------------------- */

	return () => {
		observer?.disconnect();
		if (frame) cancelAnimationFrame(frame);
		window.removeEventListener('scroll', requestPaint);
		window.removeEventListener('resize', onResize);
	};
}
