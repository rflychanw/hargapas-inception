<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto, invalidateAll } from '$app/navigation';
	import { getCurrentUser, logout } from '#lib/auth.js';
	import {
		initialStores,
		initialMenuItems,
		initialIngredients
	} from '#lib/dashboard-data.js';
	import Sidebar from '#lib/components/dashboard/Sidebar.svelte';
	import OverviewView from '#lib/components/dashboard/OverviewView.svelte';
	import MenuDetailView from '#lib/components/dashboard/MenuDetailView.svelte';
	import AiConsultantView from '#lib/components/dashboard/AiConsultantView.svelte';
	import CalculatorView, { type IngredientItem } from '#lib/components/dashboard/CalculatorView.svelte';
	import HppModal, { type MenuItem } from '#lib/components/dashboard/HppModal.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	interface StoreProfile {
		id: string;
		shortId: string;
		name: string;
		targetMargin: number;
	}

	function mapDbStore(s: any): StoreProfile {
		const rawMargin = Number(s?.targetMargin) || 0.35;
		const targetMargin = rawMargin <= 1 ? Math.round(rawMargin * 100) : Math.round(rawMargin);
		const id = String(s?.id || 'default');
		return {
			id,
			shortId: `${id.slice(0, 8)}...`,
			name: String(s?.storeName || s?.name || 'Warkop Ceria Bingit'),
			targetMargin
		};
	}

	function mapDbIngredient(ing: any): IngredientItem {
		const buyPrice = Number(ing?.purchasePrice ?? ing?.buyPrice) || 0;
		const capacity = Number(ing?.unitCapacity ?? ing?.capacity) || 1;
		const buyUnit = String(ing?.purchaseUnit || ing?.buyUnit || 'kg');
		const baseUnit =
			buyUnit === 'kg'
				? 'gram'
				: buyUnit === 'liter'
					? 'ml'
					: buyUnit === 'gram' || buyUnit === 'ml'
						? buyUnit
						: 'pcs';
		return {
			id: String(ing?.id || ''),
			name: String(ing?.name || ''),
			buyPrice,
			capacity,
			baseUnit,
			buyUnit,
			unitCost: capacity > 0 ? Math.round((buyPrice / capacity) * 100) / 100 : 0
		};
	}

	function mapDbMenu(m: any): MenuItem {
		const price = Number(m?.sellingPrice ?? m?.price) || 0;
		const hppCost = Math.round(Number(m?.estimatedHpp ?? m?.hppCost) || 0);
		const recipes = Array.isArray(m?.recipes) ? m.recipes : Array.isArray(m?.recipe) ? m.recipe : [];
		const mappedRecipe = recipes.map((r: any) => {
			if (r.cost !== undefined && r.qty !== undefined) {
				return {
					ingredientId: r.ingredientId,
					name: r.name,
					qty: Number(r.qty) || 0,
					unit: r.unit || 'unit',
					cost: Number(r.cost) || 0
				};
			}
			const pPrice = Number(r.purchasePrice) || 0;
			const uCap = Number(r.unitCapacity) || 1;
			const qUsed = Number(r.quantityUsed) || 0;
			return {
				ingredientId: r.ingredientId,
				name: r.ingredientName || r.name || 'Bahan',
				qty: qUsed,
				unit: r.purchaseUnit || 'unit',
				cost: uCap > 0 ? Math.round((pPrice / uCap) * qUsed) : 0
			};
		});

		return {
			id: String(m?.id || ''),
			name: String(m?.name || ''),
			category: String(m?.category || 'MAKANAN').toUpperCase(),
			price,
			hppCost,
			recipeCount: mappedRecipe.length,
			recipe: mappedRecipe,
			hpp: {
				bahan: hppCost,
				kemasan: 0,
				energi: 0,
				tenaga: 0,
				susut: 0
			}
		};
	}

	const VALID_TABS = ['dashboard', 'menu', 'bahan', 'konsultan'];

	let isAuthChecked = $state(false);

	const currentUrl = $derived(page.url.href);
	const activeTab = $derived<string>(
		(() => {
			void currentUrl;
			const paramTab = page.url.searchParams.get('tab');
			if (paramTab && VALID_TABS.includes(paramTab)) {
				return paramTab;
			}
			if (data?.currentTab && VALID_TABS.includes(data.currentTab)) {
				return data.currentTab;
			}
			return 'dashboard';
		})()
	);

	let stores = $state<StoreProfile[]>(initialStores);
	let currentStoreId = $state<string>('e11c6a9e-9b0c-1d2e-3f4a-334455667788');

	let currentStore = $derived(
		stores.find((s) => s.id === currentStoreId) ||
			stores[0] || {
				id: 'default',
				shortId: 'e11c6a9e...',
				name: 'Warkop Ceria Bingit',
				targetMargin: 30
			}
	);

	let menuItems = $state<MenuItem[]>(initialMenuItems);
	let ingredients = $state<IngredientItem[]>(initialIngredients);

	// Sync server data into reactive state
	$effect(() => {
		if (data?.stores && data.stores.length > 0) {
			stores = data.stores.map(mapDbStore);
		}
		if (data?.activeStore?.id) {
			currentStoreId = data.activeStore.id;
		}
		if (data?.menuItems) {
			menuItems = data.menuItems.map(mapDbMenu);
		}
		if (data?.ingredients) {
			ingredients = data.ingredients.map(mapDbIngredient);
		}
	});

	async function handleTabSelect(tab: string) {
		if (!VALID_TABS.includes(tab)) return;
		try {
			localStorage.setItem('hargapas_active_tab', tab);
		} catch (e) {
			console.warn('Gagal menyimpan tab ke localStorage:', e);
		}
		await goto(`/dashboard?tab=${tab}`, {
			replaceState: true
		});
	}

	// Menu Modal state
	let activeModalItem = $state<MenuItem | null>(null);
	let isNewMenuModal = $state(false);

	// Store Edit Modal state
	let isStoreModalOpen = $state(false);
	let storeFormName = $state('');
	let storeFormMargin = $state(30);

	let aiQueryPrompt = $state('');

	onMount(async () => {
		const user = getCurrentUser();
		if (!user) {
			goto('/login');
			return;
		}

		// Sesuaikan data warung jika user mendaftar dengan warung & target margin sendiri
		if (user.storeName && !data?.activeStore) {
			const existingIndex = stores.findIndex(
				(s) => s.name.toLowerCase() === user.storeName.toLowerCase()
			);
			if (existingIndex !== -1) {
				currentStoreId = stores[existingIndex].id;
			} else {
				try {
					const fd = new FormData();
					fd.append('storeName', user.storeName);
					fd.append('targetMargin', String((Number(user.targetMargin) || 30) / 100));
					await fetch('/dashboard?/createStore', {
						method: 'POST',
						headers: { 'x-sveltekit-action': 'true' },
						body: fd
					});
					await invalidateAll();
				} catch (err) {
					console.error('Gagal membuat toko dari sesi user:', err);
				}
			}
		}

		isAuthChecked = true;

		if (!page.url.searchParams.get('tab')) {
			try {
				const saved = localStorage.getItem('hargapas_active_tab');
				if (saved && VALID_TABS.includes(saved) && saved !== 'dashboard') {
					await goto(`/dashboard?tab=${saved}`, { replaceState: true });
				}
			} catch {}
		}

		setupDashboardObserver();
	});

	function handleLogout() {
		logout();
		goto('/login');
	}

	function setupDashboardObserver() {
		if (typeof window === 'undefined') return;
		setTimeout(() => {
			const targets = [...document.querySelectorAll('.hp-main [data-reveal]')];
			const show = (el: Element) => el.classList.add('is-in');

			targets.forEach(show);

			// MutationObserver to immediately reveal any dynamic elements added later
			const mainEl = document.querySelector('.hp-main');
			if (mainEl && !(window as any).__hpMutationObs) {
				const mutationObs = new MutationObserver((mutations) => {
					for (const m of mutations) {
						for (const node of m.addedNodes) {
							if (node instanceof HTMLElement) {
								if (node.hasAttribute('data-reveal')) {
									show(node);
								}
								const subs = node.querySelectorAll?.('[data-reveal]');
								subs?.forEach(show);
							}
						}
					}
				});
				mutationObs.observe(mainEl, { childList: true, subtree: true });
				(window as any).__hpMutationObs = mutationObs;
			}
		}, 30);
	}

	$effect(() => {
		if (activeTab && isAuthChecked) {
			setupDashboardObserver();
		}
	});

	function handleOpenEditMenu(item: MenuItem) {
		isNewMenuModal = false;
		activeModalItem = item;
	}

	function handleOpenCreateMenu() {
		isNewMenuModal = true;
		activeModalItem = {
			id: `m-${Date.now()}`,
			name: '',
			category: 'MAKANAN',
			price: 15000,
			hppCost: 7500,
			recipeCount: 0,
			recipe: [],
			hpp: {
				bahan: 7500,
				kemasan: 0,
				energi: 0,
				tenaga: 0,
				susut: 0
			}
		};
	}

	function handleCloseMenuModal() {
		activeModalItem = null;
	}

	async function handleSaveMenuItem(updated: MenuItem) {
		const isCreating = isNewMenuModal;
		if (isCreating) {
			menuItems = [...menuItems, updated];
		} else {
			menuItems = menuItems.map((item) => (item.id === updated.id ? updated : item));
		}
		activeModalItem = null;

		try {
			const fd = new FormData();
			fd.append('storeId', currentStore.id);
			if (!isCreating) {
				fd.append('id', updated.id);
			}
			fd.append('name', updated.name);
			fd.append('sellingPrice', String(updated.price));
			fd.append(
				'category',
				updated.category === 'MINUMAN'
					? 'Minuman'
					: updated.category === 'CAMILAN' || updated.category === 'SNACK'
						? 'Snack'
						: 'Makanan'
			);
			const recipePayload = (updated.recipe || [])
				.filter((r) => r.ingredientId && r.qty > 0)
				.map((r) => ({
					ingredientId: r.ingredientId,
					quantityUsed: r.qty
				}));
			fd.append('ingredientsJson', JSON.stringify(recipePayload));

			await fetch(isCreating ? '/dashboard?/createMenu' : '/dashboard?/updateMenu', {
				method: 'POST',
				headers: { 'x-sveltekit-action': 'true' },
				body: fd
			});
			await invalidateAll();
		} catch (err) {
			console.error('Gagal menyimpan menu ke database:', err);
		}
	}

	async function handleDeleteMenuItem(id: string) {
		menuItems = menuItems.filter((item) => item.id !== id);
		try {
			const fd = new FormData();
			fd.append('id', id);
			fd.append('storeId', currentStore.id);
			await fetch('/dashboard?/deleteMenu', {
				method: 'POST',
				headers: { 'x-sveltekit-action': 'true' },
				body: fd
			});
			await invalidateAll();
		} catch (err) {
			console.error('Gagal menghapus menu dari database:', err);
		}
	}

	async function handleSaveIngredient(item: IngredientItem) {
		const exists = ingredients.some((i) => i.id === item.id);
		if (exists) {
			ingredients = ingredients.map((i) => (i.id === item.id ? item : i));
		} else {
			ingredients = [...ingredients, item];
		}

		try {
			const fd = new FormData();
			fd.append('storeId', currentStore.id);
			if (exists) {
				fd.append('id', item.id);
			}
			fd.append('name', item.name);
			fd.append('purchasePrice', String(item.buyPrice));
			fd.append('purchaseUnit', item.buyUnit);
			fd.append('unitCapacity', String(item.capacity));

			await fetch(exists ? '/dashboard?/updateIngredient' : '/dashboard?/createIngredient', {
				method: 'POST',
				headers: { 'x-sveltekit-action': 'true' },
				body: fd
			});
			await invalidateAll();
		} catch (err) {
			console.error('Gagal menyimpan bahan baku ke database:', err);
		}
	}

	async function handleDeleteIngredient(id: string) {
		ingredients = ingredients.filter((i) => i.id !== id);
		try {
			const fd = new FormData();
			fd.append('id', id);
			fd.append('storeId', currentStore.id);
			await fetch('/dashboard?/deleteIngredient', {
				method: 'POST',
				headers: { 'x-sveltekit-action': 'true' },
				body: fd
			});
			await invalidateAll();
		} catch (err) {
			console.error('Gagal menghapus bahan baku dari database:', err);
		}
	}

	function openEditStoreModal() {
		storeFormName = currentStore.name;
		storeFormMargin = currentStore.targetMargin;
		isStoreModalOpen = true;
	}

	async function handleSaveStore(e: SubmitEvent) {
		e.preventDefault();
		if (!storeFormName.trim()) return;

		const nameTrimmed = storeFormName.trim();
		const marginPct = Number(storeFormMargin) || 30;
		isStoreModalOpen = false;

		stores = stores.map((s) =>
			s.id === currentStore.id
				? {
						...s,
						name: nameTrimmed,
						targetMargin: marginPct
					}
				: s
		);

		try {
			const fd = new FormData();
			fd.append('storeId', currentStore.id);
			fd.append('storeName', nameTrimmed);
			fd.append('targetMargin', String(marginPct / 100));
			await fetch('/dashboard?/updateSettings', {
				method: 'POST',
				headers: { 'x-sveltekit-action': 'true' },
				body: fd
			});
			await invalidateAll();
		} catch (err) {
			console.error('Gagal memperbarui toko di database:', err);
		}
	}
</script>

<svelte:head>
	<title>{currentStore.name} — HargaPas</title>
	<meta
		name="description"
		content="HargaPas — Decision Engine & Financial Simulator UMKM. Kelola HPP, bahan baku, dan konsultasi AI."
	/>
</svelte:head>

{#if !isAuthChecked}
	<div class="hp-loading-screen">
		<div class="hp-loading-card">
			<span class="hp-logo-badge">HP</span>
			<div>
				<p class="hp-loading-title">HargaPas</p>
				<p class="hp-loading-sub">Memuat dashboard toko...</p>
			</div>
		</div>
	</div>
{:else}
	<div class="hp-app-shell">
		<Sidebar
			{activeTab}
			storeName={currentStore.name}
			onselect={handleTabSelect}
			onlogout={handleLogout}
		/>

		<div class="hp-body-column">
			<main class="hp-main" id="main-content">
				<div class="hp-container">
					{#if activeTab === 'dashboard'}
						<OverviewView
							items={menuItems}
							storeName={currentStore.name}
							targetMargin={currentStore.targetMargin}
							oneditstore={openEditStoreModal}
						/>
					{:else if activeTab === 'menu'}
						<MenuDetailView
							items={menuItems}
							onopenmodal={handleOpenEditMenu}
							oncreatemenu={handleOpenCreateMenu}
							ondeletemenu={handleDeleteMenuItem}
						/>
					{:else if activeTab === 'bahan'}
						<CalculatorView
							{ingredients}
							onsaveingredient={handleSaveIngredient}
							ondeleteingredient={handleDeleteIngredient}
						/>
					{:else if activeTab === 'konsultan'}
						<AiConsultantView
							items={menuItems}
							initialPrompt={aiQueryPrompt}
							storeId={currentStore.id}
							initialSessions={data?.advisorInfo?.sessions || []}
							dailyCount={data?.advisorInfo?.dailyCount || 0}
						/>
					{/if}
				</div>
			</main>

			<!-- Desktop Footer -->
			<footer class="hp-footer">
				<p>
					<strong>HargaPas</strong> — Decision Engine &amp; Financial Simulator UMKM.
				</p>
			</footer>
		</div>

		<!-- Menu Create / Edit Modal -->
		{#if activeModalItem}
			<HppModal
				item={activeModalItem}
				isNew={isNewMenuModal}
				availableIngredients={ingredients}
				onclose={handleCloseMenuModal}
				onsave={handleSaveMenuItem}
			/>
		{/if}

		<!-- Store Edit Modal -->
		{#if isStoreModalOpen}
			<div class="hp-modal-backdrop">
				<button
					type="button"
					class="hp-modal-scrim"
					onclick={() => (isStoreModalOpen = false)}
					aria-label="Tutup modal"
				></button>
				<div class="hp-modal" role="dialog" aria-modal="true" aria-labelledby="store-modal-title">
					<header class="hp-modal__head">
						<div>
							<p class="hp-modal__tag">PENGATURAN WARUNG / TOKO</p>
							<h3 id="store-modal-title" class="hp-modal__title">
								Edit Pengaturan Toko
							</h3>
						</div>
						<button
							type="button"
							class="hp-modal__close"
							onclick={() => (isStoreModalOpen = false)}
							aria-label="Tutup"
						>
							&times;
						</button>
					</header>

					<form class="hp-modal__body" onsubmit={handleSaveStore}>
						<label class="hp-field">
							<span class="hp-field__label">Nama Warung / Toko</span>
							<input
								type="text"
								class="hp-field__input"
								placeholder="Contoh: Warkop Ceria Bingit"
								bind:value={storeFormName}
								required
							/>
						</label>

						<label class="hp-field">
							<span class="hp-field__label">Target Margin Keuntungan (%)</span>
							<input
								type="number"
								class="hp-field__input"
								min="5"
								max="95"
								bind:value={storeFormMargin}
								required
							/>
						</label>

						<div class="hp-modal__foot">
							<button
								type="button"
								class="hp-btn-outline"
								onclick={() => (isStoreModalOpen = false)}
							>
								Batal
							</button>
							<button type="submit" class="hp-btn-primary">
								Simpan Perubahan
							</button>
						</div>
					</form>
				</div>
			</div>
		{/if}
	</div>
{/if}
