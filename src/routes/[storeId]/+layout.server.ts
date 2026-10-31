// src/routes/[storeId]/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { getStoreById } from '#lib/server/services/store.ts';
import { error } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ params }) => {
	const storeId = params.storeId;

	const storePromise = getStoreById(storeId).then((store) => {
		if (!store) {
			throw error(404, 'Toko tidak ditemukan');
		}
		return store;
	});

	return {
		store: storePromise
	};
};

