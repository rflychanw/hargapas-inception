import { sql, isPostgresAvailable } from '#lib/server/db.ts';
import type { Store } from '#lib/types/database.ts';
import {
	localGetAllStores,
	localGetStoreById,
	localCreateStore,
	localUpdateStore,
	localDeleteStore
} from '#lib/server/localStore.ts';

/**
 * Retrieves all registered stores ordered by creation date (newest first).
 */
export async function getAllStores(): Promise<Store[]> {
	if (await isPostgresAvailable()) {
		try {
			return await sql<Store[]>`
				SELECT id, store_name, target_margin, created_at
				FROM stores
				ORDER BY created_at DESC
			`;
		} catch (err) {
			console.warn('Postgres fallback (getAllStores):', err);
		}
	}
	return localGetAllStores();
}

/**
 * Retrieves a store profile by its ID.
 */
export async function getStoreById(id: string): Promise<Store | null> {
	if (await isPostgresAvailable()) {
		try {
			const stores = await sql<Store[]>`
				SELECT id, store_name, target_margin, created_at
				FROM stores
				WHERE id = ${id}
				LIMIT 1
			`;
			return stores[0] || null;
		} catch (err) {
			console.warn('Postgres fallback (getStoreById):', err);
		}
	}
	return localGetStoreById(id);
}

/**
 * Creates a new store profile.
 */
export async function createStore(data: {
	storeName: string;
	targetMargin?: number;
}): Promise<Store> {
	if (await isPostgresAvailable()) {
		try {
			const [newStore] = await sql<Store[]>`
				INSERT INTO stores (store_name, target_margin)
				VALUES (${data.storeName}, ${data.targetMargin ?? 0.35})
				RETURNING id, store_name, target_margin, created_at
			`;
			return newStore;
		} catch (err) {
			console.warn('Postgres fallback (createStore):', err);
		}
	}
	return localCreateStore(data);
}

/**
 * Updates the store name and target margin.
 */
export async function updateStore(
	id: string,
	data: { storeName?: string; targetMargin?: number }
): Promise<Store> {
	if (await isPostgresAvailable()) {
		try {
			const [updated] = await sql<Store[]>`
				UPDATE stores
				SET
					store_name = COALESCE(${data.storeName ?? null}, store_name),
					target_margin = COALESCE(${data.targetMargin ?? null}, target_margin)
				WHERE id = ${id}
				RETURNING id, store_name, target_margin, created_at
			`;
			return updated;
		} catch (err) {
			console.warn('Postgres fallback (updateStore):', err);
		}
	}
	return localUpdateStore(id, data);
}

/**
 * Deletes a store profile by its ID.
 */
export async function deleteStore(id: string): Promise<boolean> {
	if (await isPostgresAvailable()) {
		try {
			const result = await sql`
				DELETE FROM stores
				WHERE id = ${id}
				RETURNING id
			`;
			return result.length > 0;
		} catch (err) {
			console.warn('Postgres fallback (deleteStore):', err);
		}
	}
	return localDeleteStore(id);
}

