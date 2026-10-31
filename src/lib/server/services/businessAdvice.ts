import { sql, isPostgresAvailable } from '#lib/server/db.ts';
import type {
	AdvisorSessionWithMessages,
	AdvisorMessageRow
} from '#lib/server/services/aiAdvisor.ts';
import {
	localGetAdvisorSessions,
	localGetSessionMessages,
	localDeleteAdvisorSession,
	localDeleteAllSessionsByStoreId,
	localGetDailyAdviceCount
} from '#lib/server/localStore.ts';

interface RawMessageRow {
	id: string;
	session_id?: string;
	sessionId?: string;
	role: string;
	content?: string;
	friendly_advice?: string;
	friendlyAdvice?: string;
	action_step?: string;
	actionStep?: string;
	bundling_recommendations?: unknown;
	bundlingRecommendations?: unknown;
	created_at?: Date;
	createdAt?: Date;
}

/**
 * Mengambil sesi diskusi terbaru untuk sebuah toko beserta pesan pertamanya.
 */
export async function getLatestAdvisorSession(
	storeId: string
): Promise<AdvisorSessionWithMessages | null> {
	if (await isPostgresAvailable()) {
		try {
			const sessions = await sql<AdvisorSessionWithMessages[]>`
				SELECT id, store_id, title, created_at, updated_at
				FROM advisor_sessions
				WHERE store_id = ${storeId}
				ORDER BY updated_at DESC
				LIMIT 1
			`;

			if (!sessions || sessions.length === 0) return null;

			const session = sessions[0];
			const messages = await getSessionMessages(session.id);

			return {
				...session,
				messages
			};
		} catch (err) {
			console.warn('Postgres fallback (getLatestAdvisorSession):', err);
		}
	}
	const sessions = localGetAdvisorSessions(storeId);
	return sessions[0] || null;
}

/**
 * Mengambil SELURUH riwayat sesi percakapan toko beserta isi pesan-pesannya.
 */
export async function getAdvisorSessionsByStoreId(
	storeId: string,
	limit = 20
): Promise<AdvisorSessionWithMessages[]> {
	if (await isPostgresAvailable()) {
		try {
			const sessions = await sql<AdvisorSessionWithMessages[]>`
				SELECT id, store_id, title, created_at, updated_at
				FROM advisor_sessions
				WHERE store_id = ${storeId}
				ORDER BY updated_at DESC
				LIMIT ${limit}
			`;

			if (!sessions || sessions.length === 0) return [];

			const sessionsWithMessages = await Promise.all(
				sessions.map(async (sess: AdvisorSessionWithMessages) => {
					const messages = await getSessionMessages(sess.id);
					return {
						...sess,
						messages
					};
				})
			);

			return sessionsWithMessages;
		} catch (err) {
			console.warn('Postgres fallback (getAdvisorSessionsByStoreId):', err);
		}
	}
	return localGetAdvisorSessions(storeId).slice(0, limit);
}

/**
 * Mengambil seluruh balon pesan (user & assistant) dari satu sesi tertentu.
 */
export async function getSessionMessages(sessionId: string): Promise<AdvisorMessageRow[]> {
	if (await isPostgresAvailable()) {
		try {
			const rows = await sql<any[]>`
				SELECT id, session_id, role, content, friendly_advice, action_step, bundling_recommendations, created_at
				FROM advisor_messages
				WHERE session_id = ${sessionId}
				ORDER BY created_at ASC
			`;

			return rows.map((r: RawMessageRow): AdvisorMessageRow => ({
				id: r.id,
				sessionId: r.sessionId || r.session_id || '',
				role: r.role as 'user' | 'assistant',
				content: r.content,
				friendlyAdvice: r.friendlyAdvice || r.friendly_advice,
				actionStep: r.actionStep || r.action_step,
				bundlingRecommendations: (r.bundlingRecommendations ||
					r.bundling_recommendations) as AdvisorMessageRow['bundlingRecommendations'],
				createdAt: r.createdAt || r.created_at || new Date()
			}));
		} catch (err) {
			console.warn('Postgres fallback (getSessionMessages):', err);
		}
	}
	return localGetSessionMessages(sessionId);
}

/**
 * Menghapus 1 sesi percakapan penuh berdasarkan ID Sesi (Otomatis menghapus pesan di dalamnya via CASCADE).
 */
export async function deleteSessionById(sessionId: string, storeId: string): Promise<boolean> {
	if (await isPostgresAvailable()) {
		try {
			const result = await sql`
				DELETE FROM advisor_sessions
				WHERE id = ${sessionId} AND store_id = ${storeId}
			`;
			return result.count > 0;
		} catch (err) {
			console.warn('Postgres fallback (deleteSessionById):', err);
		}
	}
	return localDeleteAdvisorSession(sessionId, storeId);
}

/**
 * Menghapus SELURUH riwayat sesi milik toko.
 */
export async function deleteAllSessionsByStoreId(storeId: string): Promise<boolean> {
	if (await isPostgresAvailable()) {
		try {
			await sql`
				DELETE FROM advisor_sessions
				WHERE store_id = ${storeId}
			`;
			return true;
		} catch (err) {
			console.warn('Postgres fallback (deleteAllSessionsByStoreId):', err);
		}
	}
	return localDeleteAllSessionsByStoreId(storeId);
}

/**
 * Menghitung penggunaan pesan user hari ini untuk batas kuota harian (5x per hari).
 */
export async function getDailyAdviceCount(storeId: string): Promise<number> {
	if (await isPostgresAvailable()) {
		try {
			const rows = await sql<{ count: string }[]>`
				SELECT COUNT(m.id)::text as count
				FROM advisor_messages m
				JOIN advisor_sessions s ON m.session_id = s.id
				WHERE s.store_id = ${storeId}
				  AND m.role = 'user'
				  AND m.created_at >= CURRENT_DATE
			`;
			return rows[0] ? parseInt(rows[0].count, 10) : 0;
		} catch (err) {
			console.warn('Postgres fallback (getDailyAdviceCount):', err);
		}
	}
	return localGetDailyAdviceCount(storeId);
}

