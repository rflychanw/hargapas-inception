/**
 * Gerak halus & elegan saat menggulir untuk landing page HargaPas (Desktop & Mobile).
 *
 * 1. Staggered Hero Reveal — Elemen hero muncul bertahap dan anggun saat halaman pertama kali dimuat.
 * 2. Intersection Reveal    — Elemen [data-reveal] masuk dengan kurva fisik lembut saat discroll.
 * 3. Continuous Lerped Parallax — Elemen [data-parallax] bergerak dengan interpolasi fisik (lerp)
 *    pada 60/120fps di desktop maupun layar sentuh mobile tanpa tersendat.
 *
 * Efek dinonaktifkan secara bersih jika pengguna menyetel "prefers-reduced-motion: reduce".
 */

/** @typedef {{ el: HTMLElement, speed: number, base: number }} Layer */

/**
 * Pasang reveal + smooth parallax motion, lalu kembalikan fungsi pembersih.
 * @returns {() => void}
 */
export function initLandingMotion() {
	if (typeof window === 'undefined') return () => {};

	const reduceMotion =
		typeof window.matchMedia === 'function' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/** @type {HTMLElement[]} */
	const reveals = Array.from(document.querySelectorAll('[data-reveal]'));

	if (reduceMotion) {
		reveals.forEach((el) => el.classList.add('is-in'));
		return () => {};
	}

	const isMobile = window.innerWidth < 768;

	/** @type {Layer[]} */
	const layers = Array.from(document.querySelectorAll('[data-parallax]')).map((node) => {
		const el = /** @type {HTMLElement} */ (node);
		return { el, speed: Number(el.dataset.parallax) || 0.05, base: 0 };
	});

	/* ---- 1. Reveal (Staggered Hero + Smooth Intersection Observer) ---- */

	/** @param {HTMLElement} el */
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
					show(/** @type {HTMLElement} */ (entry.target));
					observer?.unobserve(entry.target);
				}
			},
			{
				threshold: 0.04,
				rootMargin: isMobile ? '0px 0px -25px 0px' : '0px 0px -40px 0px'
			}
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

		// Munculkan elemen lipatan pertama (Hero) secara bertahap & elegan
		heroItems.forEach((el, index) => {
			setTimeout(() => {
				show(el);
			}, 60 + index * 80);
		});

		// Elemen di bawah lipatan dipantau saat digulir
		scrollItems.forEach((el) => observer?.observe(el));
	}

	/* ---- 2. Continuous Lerped Parallax (Desktop & Mobile) ------------- */

	let targetScrollY = window.scrollY;
	let currentScrollY = window.scrollY;
	let rafId = 0;
	let isRunning = false;

	const measureLayers = () => {
		const scrollY = window.scrollY;
		for (const layer of layers) {
			layer.el.style.removeProperty('--parallax-y');
			const rect = layer.el.getBoundingClientRect();
			layer.base = rect.top + scrollY + rect.height / 2;
		}
	};

	const updateParallax = () => {
		const diff = targetScrollY - currentScrollY;

		// Lerp damping 0.12 untuk pergerakan mulus seperti suspensi fisik
		if (Math.abs(diff) > 0.1) {
			currentScrollY += diff * 0.12;
		} else {
			currentScrollY = targetScrollY;
		}

		const vh = window.innerHeight;
		const amplitude = isMobile ? 44 : 96;

		for (const layer of layers) {
			const center = layer.base - currentScrollY;
			// Lewati elemen yang jauh di luar layar
			if (center < -vh || center > vh * 2) continue;

			const delta = Math.max(-1.2, Math.min(1.2, (center - vh / 2) / vh));
			const y = delta * layer.speed * amplitude;
			layer.el.style.setProperty('--parallax-y', `${y.toFixed(2)}px`);
		}

		if (Math.abs(diff) > 0.1) {
			rafId = requestAnimationFrame(updateParallax);
		} else {
			isRunning = false;
		}
	};

	const onScroll = () => {
		targetScrollY = window.scrollY;
		if (!isRunning) {
			isRunning = true;
			rafId = requestAnimationFrame(updateParallax);
		}
	};

	const onResize = () => {
		measureLayers();
		targetScrollY = window.scrollY;
		currentScrollY = window.scrollY;
		if (!isRunning) {
			isRunning = true;
			rafId = requestAnimationFrame(updateParallax);
		}
	};

	if (layers.length > 0) {
		measureLayers();
		// Initial layout calculation
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onResize, { passive: true });
	}

	/* ---- 3. Cleanup --------------------------------------------------- */

	return () => {
		observer?.disconnect();
		if (rafId) cancelAnimationFrame(rafId);
		window.removeEventListener('scroll', onScroll);
		window.removeEventListener('resize', onResize);
	};
}
