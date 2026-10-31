// src/routes/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { getAllStores, createStore, deleteStore } from '#lib/server/services/store.ts';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	// KEMBALIKAN PROMISE LANGSUNG (Tanpa await)
	// UI halaman akan terbuka instan tanpa tertahan latency serverless
	return {
		stores: getAllStores().catch((err) => {
			console.error('Gagal mengambil daftar toko:', err);
			return [];
		})
	};
};

export const actions: Actions = {
	createStore: async ({ request }) => {
		const formData = await request.formData();
		const storeName = (formData.get('storeName') as string)?.trim();
		const targetMarginInput = formData.get('targetMargin') as string;
		const targetMargin = targetMarginInput ? parseFloat(targetMarginInput) : 0.35;

		if (!storeName) {
			return fail(400, { message: 'Nama toko wajib diisi' });
		}

		let newStore;
		try {
			newStore = await createStore({ storeName, targetMargin });
		} catch (err: any) {
			console.error('Gagal membuat toko baru:', err);
			return fail(500, { message: err?.message || 'Gagal membuat toko baru' });
		}

		// Throw redirect 303 langsung membawa pengguna ke dashboard toko baru
		redirect(303, `/${newStore.id}/dashboard`);
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
	}
};

