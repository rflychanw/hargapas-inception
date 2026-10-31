// src/routes/dashboard/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import {
	getAllStores,
	getStoreById,
	createStore,
	updateStore,
	deleteStore
} from '#lib/server/services/store.ts';
import {
	getIngredients,
	createIngredient,
	updateIngredient,
	deleteIngredient
} from '#lib/server/services/ingredients.ts';
import {
	getMenuItemsWithRecipes,
	createMenuItem,
	updateMenuItem,
	deleteMenuItem
} from '#lib/server/services/menu.ts';
import { getMenuAnalysis } from '#lib/server/services/analysis.ts';
import {
	getLatestAdvisorSession,
	getAdvisorSessionsByStoreId,
	getDailyAdviceCount,
	deleteSessionById,
	deleteAllSessionsByStoreId,
	getSessionMessages
} from '#lib/server/services/businessAdvice.ts';
import {
	generateBusinessAdvice,
	saveNewAdvisorSession,
	appendMessageToSession
} from '#lib/server/services/aiAdvisor.ts';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	const requestedStoreId = url.searchParams.get('storeId')?.trim() || '';
	const tab = url.searchParams.get('tab')?.trim() || '';
	const validTabs = ['dashboard', 'menu', 'bahan', 'konsultan'];
	const currentTab = validTabs.includes(tab) ? tab : 'dashboard';

	const stores = await getAllStores().catch((err) => {
		console.error('Gagal mengambil daftar toko:', err);
		return [];
	});

	let activeStore =
		(requestedStoreId ? stores.find((s) => s.id === requestedStoreId) : null) || stores[0] || null;

	if (!activeStore) {
		const created = await createStore({
			storeName: 'Warkop Ceria Bingit',
			targetMargin: 0.3
		}).catch(() => null);
		if (created) {
			activeStore = created;
		}
	}

	if (!activeStore) {
		return {
			stores,
			activeStore: null,
			analysis: {
				items: [],
				totalMenuCount: 0,
				starCount: 0,
				plowhorseCount: 0,
				avgMargin: 0,
				totalPotentialRevenue: 0,
				totalEstimatedHpp: 0
			},
			menuItems: [],
			ingredients: [],
			advisorInfo: {
				latestSession: null,
				sessions: [],
				dailyCount: 0
			},
			currentTab
		};
	}

	const [analysis, menuItems, ingredients, latestSession, sessions, dailyCount] = await Promise.all([
		getMenuAnalysis(activeStore.id).catch(() => ({
			items: [],
			totalMenuCount: 0,
			starCount: 0,
			plowhorseCount: 0,
			avgMargin: 0,
			totalPotentialRevenue: 0,
			totalEstimatedHpp: 0
		})),
		getMenuItemsWithRecipes(activeStore.id).catch(() => []),
		getIngredients(activeStore.id).catch(() => []),
		getLatestAdvisorSession(activeStore.id).catch(() => null),
		getAdvisorSessionsByStoreId(activeStore.id).catch(() => []),
		getDailyAdviceCount(activeStore.id).catch(() => 0)
	]);

	return {
		stores,
		activeStore,
		analysis,
		menuItems,
		ingredients,
		advisorInfo: {
			latestSession,
			sessions: sessions ?? [],
			dailyCount
		},
		currentTab
	};
};

export const actions: Actions = {
	createStore: async ({ request }) => {
		const formData = await request.formData();
		const storeName = (formData.get('storeName') as string)?.trim();
		const targetMarginInput = formData.get('targetMargin') as string;
		const rawMargin = targetMarginInput ? parseFloat(targetMarginInput) : 0.35;
		const targetMargin = rawMargin > 1 ? rawMargin / 100 : rawMargin;

		if (!storeName) {
			return fail(400, { message: 'Nama toko wajib diisi' });
		}

		try {
			const newStore = await createStore({ storeName, targetMargin });
			return { success: true, store: newStore };
		} catch (err: any) {
			console.error('Gagal membuat toko baru:', err);
			return fail(500, { message: err?.message || 'Gagal membuat toko baru' });
		}
	},

	updateSettings: async ({ request }) => {
		const formData = await request.formData();
		const storeId = (formData.get('storeId') as string)?.trim();
		const storeName = (formData.get('storeName') as string)?.trim();
		const targetMarginInput = formData.get('targetMargin') as string;
		const rawMargin = targetMarginInput ? parseFloat(targetMarginInput) : NaN;
		const targetMargin = rawMargin > 1 ? rawMargin / 100 : rawMargin;

		if (!storeId) {
			return fail(400, { message: 'ID Toko tidak valid' });
		}

		if (!storeName) {
			return fail(400, { message: 'Nama toko tidak boleh kosong' });
		}

		if (isNaN(targetMargin) || targetMargin < 0 || targetMargin > 1) {
			return fail(400, { message: 'Target margin harus antara 0% dan 100%' });
		}

		try {
			const updated = await updateStore(storeId, {
				storeName,
				targetMargin
			});
			return { success: true, store: updated };
		} catch (err: any) {
			console.error('Gagal memperbarui pengaturan toko:', err);
			return fail(500, { message: err?.message || 'Gagal memperbarui pengaturan toko' });
		}
	},

	deleteStore: async ({ request }) => {
		const formData = await request.formData();
		const storeId = (formData.get('storeId') as string)?.trim();

		if (!storeId) {
			return fail(400, { message: 'ID Toko tidak valid' });
		}

		try {
			const deleted = await deleteStore(storeId);
			if (!deleted) {
				return fail(400, { message: 'Toko tidak ditemukan atau sudah dihapus' });
			}
			return { success: true };
		} catch (err: any) {
			console.error('Gagal menghapus toko:', err);
			return fail(500, { message: err?.message || 'Gagal menghapus toko dari database.' });
		}
	},

	createIngredient: async ({ request }) => {
		const formData = await request.formData();
		const storeId = (formData.get('storeId') as string)?.trim();
		const name = (formData.get('name') as string)?.trim();
		const purchasePrice = parseFloat((formData.get('purchasePrice') as string) || '0');
		const purchaseUnit = (formData.get('purchaseUnit') as string)?.trim() || 'kg';
		const unitCapacity = parseFloat((formData.get('unitCapacity') as string) || '1') || 1;

		if (!storeId) {
			return fail(400, { message: 'ID toko tidak ditemukan.' });
		}

		if (!name || isNaN(purchasePrice) || purchasePrice < 0) {
			return fail(400, { message: 'Nama dan harga bahan baku tidak valid.' });
		}

		try {
			const ingredient = await createIngredient(storeId, {
				name,
				purchasePrice,
				purchaseUnit,
				unitCapacity
			});
			return { success: true, ingredient };
		} catch (err: any) {
			console.error('Gagal membuat bahan baku baru:', err);
			return fail(500, { message: err?.message || 'Gagal menyimpan bahan baku ke database.' });
		}
	},

	updateIngredient: async ({ request }) => {
		const formData = await request.formData();
		const id = (formData.get('id') as string)?.trim();
		const storeId = (formData.get('storeId') as string)?.trim();
		const name = (formData.get('name') as string)?.trim();
		const purchasePrice = parseFloat((formData.get('purchasePrice') as string) || '0');
		const purchaseUnit = (formData.get('purchaseUnit') as string)?.trim() || 'kg';
		const unitCapacity = parseFloat((formData.get('unitCapacity') as string) || '1') || 1;

		if (!storeId || !id) {
			return fail(400, { message: 'ID Toko atau ID Bahan Baku tidak valid' });
		}

		if (!name || isNaN(purchasePrice) || purchasePrice < 0) {
			return fail(400, { message: 'Nama dan harga bahan baku tidak valid' });
		}

		try {
			const ingredient = await updateIngredient(id, storeId, {
				name,
				purchasePrice,
				purchaseUnit,
				unitCapacity
			});
			return { success: true, ingredient };
		} catch (err: any) {
			console.error('Gagal memperbarui bahan baku:', err);
			return fail(500, { message: err?.message || 'Gagal memperbarui bahan baku di database.' });
		}
	},

	deleteIngredient: async ({ request }) => {
		const formData = await request.formData();
		const id = (formData.get('id') as string)?.trim();
		const storeId = (formData.get('storeId') as string)?.trim();

		if (!id || !storeId) {
			return fail(400, { message: 'ID bahan baku atau ID toko tidak valid' });
		}

		try {
			await deleteIngredient(id, storeId);
			return { success: true };
		} catch (err: any) {
			console.error('Gagal menghapus bahan baku:', err);
			return fail(500, { message: err?.message || 'Gagal menghapus bahan baku dari database.' });
		}
	},

	createMenu: async ({ request }) => {
		const formData = await request.formData();
		const storeId = (formData.get('storeId') as string)?.trim();
		const name = (formData.get('name') as string)?.trim();
		const sellingPrice = parseFloat((formData.get('sellingPrice') as string) || '0');
		const category = (formData.get('category') as string)?.trim() || 'Makanan';
		const ingredientsJson = formData.get('ingredientsJson') as string;

		if (!storeId) {
			return fail(400, { message: 'ID Toko tidak valid' });
		}

		if (!name || isNaN(sellingPrice) || sellingPrice < 0) {
			return fail(400, { message: 'Nama menu dan harga jual harus valid' });
		}

		let ingredients: Array<{ ingredientId: string; quantityUsed: number }> = [];
		try {
			if (ingredientsJson) {
				const parsed = JSON.parse(ingredientsJson);
				if (Array.isArray(parsed)) {
					ingredients = parsed
						.map((item) => ({
							ingredientId: String(item.ingredientId || '').trim(),
							quantityUsed: parseFloat(String(item.quantityUsed)) || 0
						}))
						.filter((item) => item.ingredientId && item.quantityUsed > 0);
				}
			}
		} catch {
			return fail(400, { message: 'Format komposisi resep tidak valid' });
		}

		try {
			const menuId = await createMenuItem(storeId, {
				name,
				sellingPrice,
				category,
				ingredients
			});
			return { success: true, menuId };
		} catch (err: any) {
			console.error('Gagal membuat menu baru:', err);
			return fail(500, { message: err?.message || 'Gagal membuat menu baru di database.' });
		}
	},

	updateMenu: async ({ request }) => {
		const formData = await request.formData();
		const id = (formData.get('id') as string)?.trim();
		const storeId = (formData.get('storeId') as string)?.trim();
		const name = (formData.get('name') as string)?.trim();
		const sellingPrice = parseFloat((formData.get('sellingPrice') as string) || '0');
		const category = (formData.get('category') as string)?.trim() || 'Makanan';
		const ingredientsJson = formData.get('ingredientsJson') as string;

		if (!storeId || !id) {
			return fail(400, { message: 'ID Toko atau ID Menu tidak valid' });
		}

		if (!name || isNaN(sellingPrice) || sellingPrice < 0) {
			return fail(400, { message: 'Nama menu dan harga jual harus valid' });
		}

		let ingredients: Array<{ ingredientId: string; quantityUsed: number }> = [];
		try {
			if (ingredientsJson) {
				const parsed = JSON.parse(ingredientsJson);
				if (Array.isArray(parsed)) {
					ingredients = parsed
						.map((item) => ({
							ingredientId: String(item.ingredientId || '').trim(),
							quantityUsed: parseFloat(String(item.quantityUsed)) || 0
						}))
						.filter((item) => item.ingredientId && item.quantityUsed > 0);
				}
			}
		} catch {
			return fail(400, { message: 'Format komposisi resep tidak valid' });
		}

		try {
			await updateMenuItem(id, storeId, {
				name,
				sellingPrice,
				category,
				ingredients
			});
			return { success: true };
		} catch (err: any) {
			console.error('Gagal memperbarui menu:', err);
			return fail(500, { message: err?.message || 'Gagal memperbarui menu di database.' });
		}
	},

	deleteMenu: async ({ request }) => {
		const formData = await request.formData();
		const id = (formData.get('id') as string)?.trim();
		const storeId = (formData.get('storeId') as string)?.trim();

		if (!id || !storeId) {
			return fail(400, { message: 'ID menu atau ID toko tidak valid' });
		}

		try {
			await deleteMenuItem(id, storeId);
			return { success: true };
		} catch (err: any) {
			console.error('Gagal menghapus menu:', err);
			return fail(500, { message: err?.message || 'Gagal menghapus menu dari database.' });
		}
	},

	askAdvisor: async ({ request }) => {
		const formData = await request.formData();
		const storeId = (formData.get('storeId') as string)?.trim();
		const sessionId = (formData.get('sessionId') as string)?.trim() || undefined;
		const userQuery = (formData.get('userQuery') as string)?.trim() || '';

		if (!storeId) {
			return fail(400, { message: 'ID Toko tidak valid' });
		}

		if (!userQuery) {
			return fail(400, { message: 'Pesan tidak boleh kosong' });
		}

		const store = await getStoreById(storeId);
		if (!store) {
			return fail(404, { message: 'Toko tidak ditemukan' });
		}

		try {
			const dailyCount = await getDailyAdviceCount(store.id);
			const analysis = await getMenuAnalysis(store.id);
			const targetMarginNum =
				typeof store.targetMargin === 'string'
					? parseFloat(store.targetMargin)
					: (store.targetMargin ?? 0.35);

			const history = sessionId ? await getSessionMessages(sessionId) : [];

			const advice = await generateBusinessAdvice(
				store.storeName,
				targetMarginNum,
				analysis.items,
				userQuery,
				dailyCount,
				history
			);

			let activeSessionId = sessionId;

			if (advice && !advice.isLimitReached) {
				if (activeSessionId) {
					await appendMessageToSession(activeSessionId, userQuery, advice);
				} else {
					activeSessionId = await saveNewAdvisorSession(store.id, userQuery, advice);
				}
			}

			return {
				success: true,
				sessionId: activeSessionId,
				advice,
				dailyCount: advice?.isLimitReached ? 5 : dailyCount + 1
			};
		} catch (err: any) {
			console.error('Error in askAdvisor Action:', err);
			return fail(500, { message: err?.message || 'Gagal berkonsultasi dengan AI Advisor.' });
		}
	},

	deleteSession: async ({ request }) => {
		const formData = await request.formData();
		const storeId = (formData.get('storeId') as string)?.trim();
		const sessionId = (formData.get('sessionId') as string)?.trim();

		if (!storeId || !sessionId) {
			return fail(400, { message: 'Parameter ID toko atau sesi tidak valid' });
		}

		try {
			await deleteSessionById(sessionId, storeId);
			return { success: true };
		} catch (err: any) {
			console.error('Gagal menghapus sesi advisor:', err);
			return fail(500, { message: err?.message || 'Gagal menghapus sesi' });
		}
	},

	deleteAllSessions: async ({ request }) => {
		const formData = await request.formData();
		const storeId = (formData.get('storeId') as string)?.trim();

		if (!storeId) {
			return fail(400, { message: 'ID Toko tidak valid' });
		}

		try {
			await deleteAllSessionsByStoreId(storeId);
			return { success: true };
		} catch (err: any) {
			console.error('Gagal membersihkan seluruh riwayat sesi:', err);
			return fail(500, { message: err?.message || 'Gagal membersihkan riwayat' });
		}
	}
};

