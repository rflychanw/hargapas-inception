// src/routes/[storeId]/advisor/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { getStoreById } from '#lib/server/services/store.ts';
import {
	getAdvisorSessionsByStoreId,
	getLatestAdvisorSession,
	getDailyAdviceCount,
	deleteSessionById,
	deleteAllSessionsByStoreId,
	getSessionMessages
} from '#lib/server/services/businessAdvice.ts';
import { getMenuAnalysis } from '#lib/server/services/analysis.ts';
import {
	generateBusinessAdvice,
	saveNewAdvisorSession,
	appendMessageToSession
} from '#lib/server/services/aiAdvisor.ts';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const storeId = params.storeId;

	const advisorInfoPromise = Promise.all([
		getLatestAdvisorSession(storeId),
		getAdvisorSessionsByStoreId(storeId),
		getDailyAdviceCount(storeId)
	])
		.then(([latestSession, sessions, dailyCount]) => ({
			latestSession,
			sessions: sessions ?? [],
			dailyCount
		}))
		.catch((err) => {
			console.error('Gagal memuat data advisor:', err);
			return { latestSession: null, sessions: [], dailyCount: 0 };
		});

	return {
		advisorInfo: advisorInfoPromise
	};
};

export const actions: Actions = {
	askAdvisor: async ({ request, params }) => {
		const storeId = params.storeId?.trim();
		const formData = await request.formData();

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

	deleteSession: async ({ request, params }) => {
		const storeId = params.storeId?.trim();
		const formData = await request.formData();
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

	deleteAllSessions: async ({ params }) => {
		const storeId = params.storeId?.trim();

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

