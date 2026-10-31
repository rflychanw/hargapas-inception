// src/routes/[storeId]/ingredients/new/+page.server.ts
import { createIngredient } from '#lib/server/services/ingredients.ts';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	create: async ({ request, params }) => {
		const storeId = params.storeId?.trim();
		const formData = await request.formData();

		const name = (formData.get('name') as string)?.trim();
		const purchasePriceInput = formData.get('purchasePrice') as string;
		const purchasePrice = parseFloat(purchasePriceInput);
		const purchaseUnit = (formData.get('purchaseUnit') as string)?.trim() || 'kg';
		const unitCapacityInput = formData.get('unitCapacity') as string;
		const unitCapacity = parseFloat(unitCapacityInput) || 1;

		if (!storeId) {
			return fail(400, { message: 'ID toko tidak ditemukan.' });
		}

		if (!name || isNaN(purchasePrice) || purchasePrice < 0) {
			return fail(400, { message: 'Nama dan harga bahan baku tidak valid.' });
		}

		try {
			await createIngredient(storeId, {
				name,
				purchasePrice,
				purchaseUnit,
				unitCapacity
			});
		} catch (err: any) {
			console.error('Gagal membuat bahan baku baru:', err);
			return fail(500, { message: err?.message || 'Gagal menyimpan bahan baku ke database.' });
		}

		redirect(303, `/${storeId}/ingredients`);
	}
};

