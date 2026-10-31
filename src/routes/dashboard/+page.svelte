<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
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

	interface StoreProfile {
		id: string;
		shortId: string;
		name: string;
		targetMargin: number;
	}

	let isAuthChecked = $state(false);
	let activeTab = $state('dashboard');
	let isStoreSelectMode = $state(false);

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

	// Menu Modal state
	let activeModalItem = $state<MenuItem | null>(null);
	let isNewMenuModal = $state(false);

	// Store Add/Edit Modal state
	let isStoreModalOpen = $state(false);
	let storeModalMode = $state<'add' | 'edit'>('add');
	let storeFormName = $state('');
	let storeFormMargin = $state(30);

	let aiQueryPrompt = $state('');

	onMount(() => {
		const user = getCurrentUser();
		if (!user) {
			goto('/login');
			return;
		}

		// Sesuaikan data warung jika user mendaftar dengan warung & target margin sendiri
		if (user.storeName) {
			const existingIndex = stores.findIndex(
				(s) => s.name.toLowerCase() === user.storeName.toLowerCase()
			);
			if (existingIndex !== -1) {
				currentStoreId = stores[existingIndex].id;
				if (user.targetMargin) {
					stores[existingIndex].targetMargin = Number(user.targetMargin) || 30;
				}
			} else {
				const rawHex = Math.random().toString(16).slice(2, 10);
				const userStore: StoreProfile = {
					id: `u-${Date.now()}`,
					shortId: `${rawHex}...`,
					name: user.storeName,
					targetMargin: Number(user.targetMargin) || 30
				};
				stores = [userStore, ...stores];
				currentStoreId = userStore.id;
			}
		}

		isAuthChecked = true;
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

			if (!('IntersectionObserver' in window)) {
				targets.forEach(show);
				return;
			}

			const observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (!entry.isIntersecting) continue;
						show(entry.target);
						observer.unobserve(entry.target);
					}
				},
				{ threshold: 0.04, rootMargin: '0px 0px -10px 0px' }
			);

			const tall = window.innerHeight;
			for (const t of targets) {
				if (t.getBoundingClientRect().top < tall * 0.98) {
					show(t);
				} else {
					observer.observe(t);
				}
			}
		}, 40);
	}

	$effect(() => {
		if ((activeTab || isStoreSelectMode) && isAuthChecked) {
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
			recipeCount: 2,
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

	function handleSaveMenuItem(updated: MenuItem) {
		if (isNewMenuModal) {
			menuItems = [...menuItems, updated];
		} else {
			menuItems = menuItems.map((item) => (item.id === updated.id ? updated : item));
		}
		activeModalItem = null;
	}

	function handleDeleteMenuItem(id: string) {
		menuItems = menuItems.filter((item) => item.id !== id);
	}

	function handleSaveIngredient(item: IngredientItem) {
		const exists = ingredients.some((i) => i.id === item.id);
		if (exists) {
			ingredients = ingredients.map((i) => (i.id === item.id ? item : i));
		} else {
			ingredients = [...ingredients, item];
		}
	}

	function handleDeleteIngredient(id: string) {
		ingredients = ingredients.filter((i) => i.id !== id);
	}

	function openAddStoreModal() {
		storeModalMode = 'add';
		storeFormName = '';
		storeFormMargin = 30;
		isStoreModalOpen = true;
	}

	function openEditStoreModal() {
		storeModalMode = 'edit';
		storeFormName = currentStore.name;
		storeFormMargin = currentStore.targetMargin;
		isStoreModalOpen = true;
	}

	function handleSaveStore(e: SubmitEvent) {
		e.preventDefault();
		if (!storeFormName.trim()) return;

		if (storeModalMode === 'add') {
			const rawHex = Math.random().toString(16).slice(2, 10);
			const newStore: StoreProfile = {
				id: `${rawHex}-${Date.now()}`,
				shortId: `${rawHex}...`,
				name: storeFormName.trim(),
				targetMargin: Number(storeFormMargin) || 30
			};
			stores = [...stores, newStore];
			currentStoreId = newStore.id;
		} else {
			stores = stores.map((s) =>
				s.id === currentStore.id
					? {
							...s,
							name: storeFormName.trim(),
							targetMargin: Number(storeFormMargin) || 30
						}
					: s
			);
		}
		isStoreModalOpen = false;
	}

	function handleSelectStore(storeId: string) {
		currentStoreId = storeId;
		isStoreSelectMode = false;
		activeTab = 'dashboard';
	}

	function handleDeleteStore(storeId: string, e: MouseEvent) {
		e.stopPropagation();
		stores = stores.filter((s) => s.id !== storeId);
		if (currentStoreId === storeId && stores.length > 0) {
			currentStoreId = stores[0].id;
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
	<div class="hp-app-shell" class:hp-app-shell--store-select={isStoreSelectMode}>
		<Sidebar
			{activeTab}
			storeName={currentStore.name}
			{isStoreSelectMode}
			onselect={(tab: string) => {
				activeTab = tab;
				isStoreSelectMode = false;
			}}
			onlogout={handleLogout}
		/>

		<div class="hp-body-column">
			<main class="hp-main" id="main-content">
				<div class="hp-container">
					{#if isStoreSelectMode}
						<!-- PILIH WARUNG / TOKO VIEW (Welcome With Stores & Welcome Empty) -->
						<div class="hp-page-stack">
							<section class="hp-card hp-store-banner" data-reveal>
								<div class="hp-store-banner__main">
									<div class="hp-icon-box hp-icon-box--orange-lg" aria-hidden="true">
										<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E64A0A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
											<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
											<path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
											<path d="M2 7h20" />
											<path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7" />
										</svg>
									</div>
									<div class="hp-store-banner__info">
										<h1 class="hp-store-banner__title">Pilih Warung / Toko</h1>
										<p class="hp-store-banner__sub-desktop">
											Kelola beberapa cabang atau konsep bisnis kuliner dalam satu platform terpadu.
										</p>
									</div>
								</div>

								<button
									type="button"
									class="hp-btn-primary hp-desktop-only-btn"
									onclick={openAddStoreModal}
								>
									<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
										<line x1="12" x2="12" y1="5" y2="19" />
										<line x1="5" x2="19" y1="12" y2="12" />
									</svg>
									<span>Tambah Toko Baru</span>
								</button>
							</section>

							{#if stores.length > 0}
								<div class="hp-stores-subhead" data-reveal data-delay="1">
									<span class="hp-stores-subhead__label">DAFTAR TOKO TERDAFTAR</span>
									<span class="hp-stores-subhead__pill">{stores.length} Unit</span>
								</div>

								<div class="hp-stores-grid">
									{#each stores as store, idx (store.id)}
										<article
											class="hp-card hp-store-card"
											data-reveal
											data-delay={String((idx % 3) + 1)}
										>
											<div class="hp-store-card__top">
												<div class="hp-store-card__icon" aria-hidden="true">
													<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
														<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
														<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
														<path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
														<path d="M2 7h20" />
													</svg>
												</div>
												<button
													type="button"
													class="hp-icon-btn hp-icon-btn--danger"
													onclick={(e) => handleDeleteStore(store.id, e)}
													aria-label="Hapus {store.name}"
													title="Hapus Toko"
												>
													<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
														<path d="M3 6h18" />
														<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
														<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
														<line x1="10" x2="10" y1="11" y2="17" />
														<line x1="14" x2="14" y1="11" y2="17" />
													</svg>
												</button>
											</div>

											<h2 class="hp-store-card__name">{store.name}</h2>
											<p class="hp-store-card__id">ID: {store.shortId}</p>

											<div class="hp-store-card__target">
												<span class="hp-store-card__target-label">
													<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2">
														<circle cx="12" cy="12" r="9" />
														<circle cx="12" cy="12" r="4" />
													</svg>
													<span>Target Margin</span>
												</span>
												<strong class="hp-store-card__target-val">{store.targetMargin}%</strong>
											</div>

											<button
												type="button"
												class="hp-store-card__open"
												onclick={() => handleSelectStore(store.id)}
											>
												<span>Buka Dashboard</span>
												<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
													<line x1="5" x2="19" y1="12" y2="12" />
													<polyline points="12 5 19 12 12 19" />
												</svg>
											</button>
										</article>
									{/each}
								</div>
							{:else}
								<!-- Empty Stores State (Welcome-1.png & Welcome.png) -->
								<section class="hp-empty-stores" data-reveal data-delay="1">
									<div class="hp-empty-stores__icon" aria-hidden="true">
										<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
											<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
											<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
											<path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
											<path d="M2 7h20" />
										</svg>
									</div>
									<h2 class="hp-empty-stores__title">Belum Ada Data Toko</h2>
									<p class="hp-empty-stores__desc">
										Mulai langkah pertama dengan mendaftarkan profil usaha kuliner Anda untuk mengaktifkan analisis HPP dan AI.
									</p>
									<button
										type="button"
										class="hp-btn-dark-desktop"
										onclick={openAddStoreModal}
									>
										Buat Toko Pertama Sekarang
									</button>
									<button
										type="button"
										class="hp-btn-orange-mobile"
										onclick={openAddStoreModal}
									>
										<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
											<line x1="12" x2="12" y1="5" y2="19" />
											<line x1="5" x2="19" y1="12" y2="12" />
										</svg>
										<span>Buat Toko Pertama</span>
									</button>
								</section>
							{/if}

							<!-- Mobile FAB (+) -->
							<button
								type="button"
								class="hp-fab hp-fab--store-select"
								onclick={openAddStoreModal}
								aria-label="Tambah Toko Baru"
								title="Tambah Toko Baru"
							>
								<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round">
									<line x1="12" x2="12" y1="5" y2="19" />
									<line x1="5" x2="19" y1="12" y2="12" />
								</svg>
							</button>
						</div>
					{:else if activeTab === 'dashboard'}
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
				onclose={handleCloseMenuModal}
				onsave={handleSaveMenuItem}
			/>
		{/if}

		<!-- Store Add / Edit Modal -->
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
								{storeModalMode === 'add' ? 'Tambah Toko Baru' : 'Edit Pengaturan Toko'}
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
								Simpan Toko
							</button>
						</div>
					</form>
				</div>
			</div>
		{/if}
	</div>
{/if}
