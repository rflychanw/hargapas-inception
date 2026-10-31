// src/lib/server/services/aiAdvisor.ts
import { sql, isPostgresAvailable } from '#lib/server/db.ts';
import type { MenuAnalysis } from '#lib/types/database.ts';
import { OLLAMA_API_KEY } from '$app/env/private';
import {
	localGetAdvisorSessions,
	localGetSessionMessages,
	localGetDailyAdviceCount,
	localSaveNewAdvisorSession,
	localAppendMessageToSession,
	localDeleteAdvisorSession
} from '#lib/server/localStore.ts';

export interface BundlingRecommendation {
	comboName: string;
	itemsIncluded?: string[];
	suggestedPrice?: number;
	marketingHeadline: string;
	reasoning?: string;
}

export interface AdvisorMessageRow {
	id?: string;
	sessionId?: string;
	role: 'user' | 'assistant';
	content?: string | null;
	friendlyAdvice?: string | null;
	actionStep?: string | null;
	bundlingRecommendations?: BundlingRecommendation[];
	createdAt?: Date;
}

export interface AdvisorSessionWithMessages {
	id: string;
	storeId: string;
	title: string;
	createdAt: Date;
	updatedAt: Date;
	messages?: AdvisorMessageRow[];
}

export interface AdvisorResponse {
	sessionId?: string;
	userQuery?: string;
	friendlyAdvice: string;
	actionStep: string;
	bundlingRecommendations: BundlingRecommendation[];
	createdAt?: Date;
	isLimitReached?: boolean;
}

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

// ==========================================
// 1. DATABASE OPERATIONS (PostgreSQL / sql)
// ==========================================

/**
 * Mengambil daftar riwayat sesi diskusi untuk toko tertentu.
 */
export async function getAdvisorSessions(storeId: string): Promise<AdvisorSessionWithMessages[]> {
	if (await isPostgresAvailable()) {
		try {
			return await sql<AdvisorSessionWithMessages[]>`
				SELECT id, store_id, title, created_at, updated_at
				FROM advisor_sessions
				WHERE store_id = ${storeId}
				ORDER BY updated_at DESC
			`;
		} catch (err) {
			console.warn('Postgres fallback (getAdvisorSessions):', err);
		}
	}
	return localGetAdvisorSessions(storeId);
}

/**
 * Mengambil seluruh pesan percakapan di dalam satu sesi.
 */
export async function getSessionMessages(sessionId: string): Promise<AdvisorMessageRow[]> {
	if (await isPostgresAvailable()) {
		try {
			const rows = await sql<RawMessageRow[]>`
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
 * Menghitung penggunaan pesan user hari ini untuk kuota harian.
 */
export async function getDailyUsageCount(storeId: string): Promise<number> {
	if (await isPostgresAvailable()) {
		try {
			const [res] = await sql<Array<{ count: string }>>`
				SELECT COUNT(m.id) as count
				FROM advisor_messages m
				JOIN advisor_sessions s ON m.session_id = s.id
				WHERE s.store_id = ${storeId}
				  AND m.role = 'user'
				  AND m.created_at >= CURRENT_DATE
			`;
			return parseInt(res?.count || '0', 10);
		} catch (err) {
			console.warn('Postgres fallback (getDailyUsageCount):', err);
		}
	}
	return localGetDailyAdviceCount(storeId);
}

/**
 * Simpan sesi baru beserta pesan awal user & balasan AI.
 */
export async function saveNewAdvisorSession(
	storeId: string,
	userQuery: string,
	aiResult: AdvisorResponse
): Promise<string> {
	if (await isPostgresAvailable()) {
		try {
			return await sql.begin(async (tx: any) => {
				const sessionTitle = userQuery.length > 50 ? userQuery.slice(0, 47) + '...' : userQuery;

				const [session] = await tx<AdvisorSessionWithMessages[]>`
					INSERT INTO advisor_sessions (store_id, title)
					VALUES (${storeId}, ${sessionTitle})
					RETURNING id
				`;

				await tx`
					INSERT INTO advisor_messages (session_id, role, content)
					VALUES (${session.id}, 'user', ${userQuery})
				`;

				await tx`
					INSERT INTO advisor_messages (
						session_id, role, friendly_advice, action_step, bundling_recommendations
					)
					VALUES (
						${session.id},
						'assistant',
						${aiResult.friendlyAdvice},
						${aiResult.actionStep},
						${JSON.stringify(aiResult.bundlingRecommendations || [])}
					)
				`;

				return session.id;
			});
		} catch (err) {
			console.warn('Postgres fallback (saveNewAdvisorSession):', err);
		}
	}
	return localSaveNewAdvisorSession(storeId, userQuery, aiResult);
}

/**
 * Lanjutkan percakapan (Multi-turn) di dalam sesi yang sudah ada.
 */
export async function appendMessageToSession(
	sessionId: string,
	userQuery: string,
	aiResult: AdvisorResponse
): Promise<void> {
	if (await isPostgresAvailable()) {
		try {
			await sql.begin(async (tx: any) => {
				await tx`
					INSERT INTO advisor_messages (session_id, role, content)
					VALUES (${sessionId}, 'user', ${userQuery})
				`;

				await tx`
					INSERT INTO advisor_messages (
						session_id, role, friendly_advice, action_step, bundling_recommendations
					)
					VALUES (
						${sessionId},
						'assistant',
						${aiResult.friendlyAdvice},
						${aiResult.actionStep},
						${JSON.stringify(aiResult.bundlingRecommendations || [])}
					)
				`;

				await tx`
					UPDATE advisor_sessions
					SET updated_at = CURRENT_TIMESTAMP
					WHERE id = ${sessionId}
				`;
			});
			return;
		} catch (err) {
			console.warn('Postgres fallback (appendMessageToSession):', err);
		}
	}
	localAppendMessageToSession(sessionId, userQuery, aiResult);
}

/**
 * Hapus 1 sesi percakapan penuh.
 */
export async function deleteAdvisorSession(sessionId: string, storeId: string): Promise<boolean> {
	if (await isPostgresAvailable()) {
		try {
			const result = await sql`
				DELETE FROM advisor_sessions
				WHERE id = ${sessionId} AND store_id = ${storeId}
			`;
			return result.count > 0;
		} catch (err) {
			console.warn('Postgres fallback (deleteAdvisorSession):', err);
		}
	}
	return localDeleteAdvisorSession(sessionId, storeId);
}

// ==========================================
// 2. AI GENERATION & HEURISTIC FALLBACK
// ==========================================

export async function generateBusinessAdvice(
	storeName: string,
	targetMargin: number,
	analysisItems: MenuAnalysis[],
	userQuery?: string,
	dailyCount: number = 0,
	conversationHistory: AdvisorMessageRow[] = []
): Promise<AdvisorResponse> {
	// 🛑 CEK KUOTA HARIAN (Max 5x per hari jika userQuery diisi)
	if (userQuery && dailyCount >= 5) {
		return {
			userQuery,
			friendlyAdvice: `Maaf, batas penggunaan Konsultan AI untuk toko ${storeName} telah mencapai kuota harian (5/5 saran per hari).`,
			actionStep:
				'Silakan gunakan saran yang sudah dibuat hari ini atau kembalilah besok untuk diskusi strategi baru.',
			bundlingRecommendations: [],
			createdAt: new Date(),
			isLimitReached: true
		};
	}

	// 1. Handling kondisi data menu kosong
	if (!analysisItems || analysisItems.length === 0) {
		return {
			userQuery,
			friendlyAdvice: `Halo pemilik ${storeName}, silakan tambahkan data resep dan bahan baku terlebih dahulu agar aku bisa menganalisis situasi tokomu.`,
			actionStep: 'Daftarkan minimal 1-5 menu jagoan untuk memulai simulasi profitabilitas.',
			bundlingRecommendations: [
				{
					comboName: 'Paket Hemat Perdana',
					marketingHeadline: 'Bikin menu paket hemat pertama warungmu sekarang!'
				}
			],
			createdAt: new Date()
		};
	}

	const stars = analysisItems.filter((i) => i.matrixStatus === 'Star');
	const plowhorses = analysisItems.filter((i) => i.matrixStatus === 'Plowhorse');
	const ollamaKey = OLLAMA_API_KEY;

	const promptData = {
		store_name: storeName,
		target_margin_percent: `${Math.round(targetMargin * 100)}%`,
		user_current_condition:
			userQuery || 'Tidak ada kondisi khusus. Berikan analisis performa umum.',
		available_menus: analysisItems.map((item) => ({
			name: item.menuName,
			selling_price: item.sellingPrice,
			hpp: item.totalHpp,
			ideal_price: item.idealSellingPrice,
			status: item.matrixStatus
		}))
	};

	if (ollamaKey) {
		try {
			// Format riwayat chat terdahulu untuk dijadikan konteks Ollama
			const formattedContext = conversationHistory.map((m) => {
				if (m.role === 'user') {
					return { role: 'user', content: m.content || '' };
				}
				return {
					role: 'assistant',
					content: JSON.stringify({
						friendlyAdvice: m.friendlyAdvice,
						actionStep: m.actionStep,
						bundlingRecommendations: m.bundlingRecommendations
					})
				};
			});

			const payload = {
				model: 'gemma4:31b',
				messages: [
					{
						role: 'system',
						content: `Kamu adalah konsultan bisnis UMKM kuliner yang komunikatif dan cerdas. Tugasmu: Analisis kondisi penjualan dari user, lalu berikan saran strategi berdasarkan data HPP/menu yang tersedia. BERIKAN JUMLAH SARAN DINAMIS (1 hingga 3 paket promo):
- Jika keluhan user sederhana/spesifik: berikan 1-2 paket paling relevan.
- Jika keluhan kompleks/stok melimpah: berikan 2-3 pilihan paket bervariasi.

Kembalikan HANYA JSON murni dengan 3 kunci wajib:
1. "friendlyAdvice": Tanggapan ramah atas situasi user (maks 2-3 kalimat).
2. "actionStep": 1 langkah taktis prioritas hari ini.
3. "bundlingRecommendations": Array objek { "comboName", "itemsIncluded", "suggestedPrice", "marketingHeadline", "reasoning" }.
Dilarang menambahkan teks pembuka, salam, atau markdown codeblock.`
					},
					...formattedContext,
					{
						role: 'user',
						content: `Konteks warung dan keluhan user terbaru:\n${JSON.stringify(promptData)}`
					}
				],
				stream: false,
				format: {
					type: 'object',
					properties: {
						friendlyAdvice: { type: 'string' },
						actionStep: { type: 'string' },
						bundlingRecommendations: {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									comboName: { type: 'string' },
									itemsIncluded: { type: 'array', items: { type: 'string' } },
									suggestedPrice: { type: 'number' },
									marketingHeadline: { type: 'string' },
									reasoning: { type: 'string' }
								},
								required: ['comboName', 'marketingHeadline']
							}
						}
					},
					required: ['friendlyAdvice', 'actionStep', 'bundlingRecommendations']
				}
			};

			const res = await fetch('https://ollama.com/api/chat', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${ollamaKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			if (res.ok) {
				const data = await res.json();
				const rawContent = data?.message?.content || '';

				if (rawContent) {
					const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
					if (jsonMatch) {
						const parsed = JSON.parse(jsonMatch[0]);
						let recommendations: BundlingRecommendation[] = [];

						if (
							Array.isArray(parsed.bundlingRecommendations) &&
							parsed.bundlingRecommendations.length > 0
						) {
							recommendations = parsed.bundlingRecommendations.map((b: any) => ({
								comboName: b.comboName || 'Paket Hemat Promo',
								itemsIncluded: b.itemsIncluded || [],
								suggestedPrice: b.suggestedPrice || 0,
								marketingHeadline: b.marketingHeadline || 'Solusi hemat rasa mantap!',
								reasoning: b.reasoning || ''
							}));
						}

						return {
							userQuery,
							friendlyAdvice:
								parsed.friendlyAdvice || `Siap, mari kita optimalkan penjualan ${storeName}.`,
							actionStep:
								parsed.actionStep || 'Fokus dorong penjualan menu dengan margin tertinggi.',
							bundlingRecommendations: recommendations,
							createdAt: new Date()
						};
					}
				}
			}
		} catch (err) {
			console.warn('Ollama API call failed, falling back to local heuristic advisor:', err);
		}
	}

	// Fallback Heuristic Offline
	const starItem = stars[0] || analysisItems[0];
	const plowhorseItem = plowhorses[0];

	const fallbackAdvice = userQuery
		? `Berdasarkan kendala "${userQuery}", kita bisa dorong kombinasi menu favorit untuk mendongkrak penjualan.`
		: `Performa ${storeName} memiliki ${stars.length} menu Star dengan margin sehat.`;

	const fallbackBundles: BundlingRecommendation[] = [];

	if (starItem && plowhorseItem) {
		fallbackBundles.push({
			comboName: `Paket Kombo: ${starItem.menuName} + ${plowhorseItem.menuName}`,
			itemsIncluded: [starItem.menuName, plowhorseItem.menuName],
			suggestedPrice: Math.ceil((starItem.sellingPrice + plowhorseItem.sellingPrice) * 0.9),
			marketingHeadline: `Beli ${starItem.menuName}, diskon khusus untuk ${plowhorseItem.menuName}!`,
			reasoning: 'Menggabungkan menu laris dengan menu margin tipis untuk menaikkan volume.'
		});
	}

	if (starItem) {
		fallbackBundles.push({
			comboName: `Paket Hemat ${starItem.menuName}`,
			itemsIncluded: [starItem.menuName],
			suggestedPrice: Math.ceil(starItem.sellingPrice * 0.95),
			marketingHeadline: 'Nikmati penawaran hemat menu favorit hari ini!',
			reasoning: 'Paket promosi khusus untuk menu utama.'
		});
	}

	return {
		userQuery,
		friendlyAdvice: fallbackAdvice,
		actionStep: plowhorseItem
			? `Atur ulang harga ${plowhorseItem.menuName} mendekati Rp ${plowhorseItem.idealSellingPrice.toLocaleString('id-ID')}.`
			: `Pertahankan promo menu ${starItem?.menuName || 'utama'}.`,
		bundlingRecommendations: fallbackBundles,
		createdAt: new Date()
	};
}

