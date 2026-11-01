// src/routes/[storeId]/menu/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { getMenuItemsWithRecipes, deleteMenuItem } from '#lib/server/services/menu.ts';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const storeId = params.storeId;

	// Mengembalikan Promise langsung tanpa await/parent()
	// Tampilan UI daftar menu akan langsung terbuka instan (0 ms latency)
	const menuItemsPromise = getMenuItemsWithRecipes(storeId).catch((err) => {
		console.error('Gagal memuat data menu:', err);
		return [];
	});

	return {
		menuItems: menuItemsPromise
	};
};

export const actions: Actions = {
	delete: async ({ request, params }) => {
		const storeId = params.storeId?.trim();
		const formData = await request.formData();
		const id = (formData.get('id') as string)?.trim();

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
	}
};
