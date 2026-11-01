// src/routes/[storeId]/ingredients/[id]/edit/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { getIngredientById, updateIngredient } from '#lib/server/services/ingredients.ts';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const storeId = params.storeId;
	const ingredientId = params.id;

	// Eksekusi pengambilan data bahan baku tanpa await/parent()
	// UI halaman edit akan langsung terbuka instan di client (0 ms latency)
	const ingredientPromise = getIngredientById(ingredientId, storeId).then((ingredient) => {
		if (!ingredient) {
			error(404, 'Bahan baku tidak ditemukan');
		}
		return ingredient;
	});

	return {
		ingredient: ingredientPromise
	};
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const storeId = params.storeId?.trim();
		const formData = await request.formData();

		const id = (formData.get('id') as string)?.trim();
		const name = (formData.get('name') as string)?.trim();
		const purchasePriceInput = formData.get('purchasePrice') as string;
		const purchasePrice = parseFloat(purchasePriceInput);
		const purchaseUnit = (formData.get('purchaseUnit') as string)?.trim() || 'kg';
		const unitCapacityInput = formData.get('unitCapacity') as string;
		const unitCapacity = parseFloat(unitCapacityInput) || 1;

		if (!storeId || !id) {
			return fail(400, { message: 'ID Toko atau ID Bahan Baku tidak valid' });
		}

		if (!name || isNaN(purchasePrice) || purchasePrice < 0) {
			return fail(400, { message: 'Nama dan harga bahan baku tidak valid' });
		}

		try {
			await updateIngredient(id, storeId, {
				name,
				purchasePrice,
				purchaseUnit,
				unitCapacity
			});
		} catch (err: any) {
			console.error('Gagal memperbarui bahan baku:', err);
			return fail(500, { message: err?.message || 'Gagal memperbarui bahan baku di database.' });
		}

		// Redirect 303 ditempatkan di luar try-catch agar tidak tertangkap sebagai error 500
		redirect(303, `/${storeId}/ingredients`);
	}
};
