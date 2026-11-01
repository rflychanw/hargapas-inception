// src/routes/[storeId]/ingredients/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { getIngredients, deleteIngredient } from '#lib/server/services/ingredients.ts';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const storeId = params.storeId;

	// Stream promise langsung tanpa await/parent()
	// Tampilan UI halaman bahan baku akan langsung terbuka instan (0 ms latency)
	const ingredientsPromise = getIngredients(storeId).catch((err) => {
		console.error('Gagal memuat data bahan baku:', err);
		return [];
	});

	return {
		ingredients: ingredientsPromise
	};
};

export const actions: Actions = {
	delete: async ({ request, params }) => {
		const storeId = params.storeId;
		const formData = await request.formData();
		const id = (formData.get('id') as string)?.trim();

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
	}
};
