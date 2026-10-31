// src/routes/[storeId]/dashboard/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { getMenuAnalysis } from '#lib/server/services/analysis.ts';
import { updateStore } from '#lib/server/services/store.ts';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const storeId = params.storeId;

	const analysisPromise = getMenuAnalysis(storeId).catch((err) => {
		console.error('Failed to load dashboard analysis:', err);
		return {
			items: [],
			totalMenuCount: 0,
			starCount: 0,
			plowhorseCount: 0,
			avgMargin: 0,
			totalPotentialRevenue: 0,
			totalEstimatedHpp: 0,
			error: err?.message || 'Gagal memuat data analisis dari database.'
		};
	});

	return {
		analysis: analysisPromise
	};
};

export const actions: Actions = {
	updateSettings: async ({ request, params }) => {
		const formData = await request.formData();
		const storeId = params.storeId;
		const storeName = (formData.get('storeName') as string)?.trim();
		const targetMarginInput = formData.get('targetMargin') as string;
		const targetMargin = targetMarginInput ? parseFloat(targetMarginInput) : NaN;

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
			await updateStore(storeId, {
				storeName,
				targetMargin
			});

			return { success: true };
		} catch (err: any) {
			console.error('Gagal memperbarui pengaturan toko:', err);
			return fail(500, { message: err?.message || 'Gagal memperbarui pengaturan toko' });
		}
	}
};

