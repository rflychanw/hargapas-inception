import { sql, isPostgresAvailable } from '#lib/server/db.ts';
import type { Ingredient } from '#lib/types/database.ts';
import {
	localGetIngredients,
	localGetIngredientById,
	localCreateIngredient,
	localUpdateIngredient,
	localDeleteIngredient
} from '#lib/server/localStore.ts';

/**
 * Retrieves all ingredients for a given store.
 */
export async function getIngredients(storeId: string): Promise<Ingredient[]> {
	if (await isPostgresAvailable()) {
		try {
			return await sql<Ingredient[]>`
				SELECT
					id,
					store_id,
					name,
					purchase_price,
					purchase_unit,
					unit_capacity,
					cost_per_unit
				FROM ingredients
				WHERE store_id = ${storeId}
				ORDER BY name ASC
			`;
		} catch (err) {
			console.warn('Postgres fallback (getIngredients):', err);
		}
	}
	return localGetIngredients(storeId);
}

/**
 * Retrieves a single ingredient by ID for a specific store.
 */
export async function getIngredientById(id: string, storeId: string): Promise<Ingredient | null> {
	if (await isPostgresAvailable()) {
		try {
			const ingredients = await sql<Ingredient[]>`
				SELECT
					id,
					store_id,
					name,
					purchase_price,
					purchase_unit,
					unit_capacity,
					cost_per_unit
				FROM ingredients
				WHERE id = ${id} AND store_id = ${storeId}
				LIMIT 1
			`;

			return ingredients[0] || null;
		} catch (err) {
			console.warn('Postgres fallback (getIngredientById):', err);
		}
	}
	return localGetIngredientById(id, storeId);
}

/**
 * Creates a new ingredient.
 */
export async function createIngredient(
	storeId: string,
	data: {
		name: string;
		purchasePrice: number;
		purchaseUnit: string;
		unitCapacity: number;
	}
): Promise<Ingredient> {
	if (await isPostgresAvailable()) {
		try {
			const [created] = await sql<Ingredient[]>`
				INSERT INTO ingredients (
					store_id,
					name,
					purchase_price,
					purchase_unit,
					unit_capacity
				)
				VALUES (
					${storeId},
					${data.name},
					${data.purchasePrice},
					${data.purchaseUnit},
					${data.unitCapacity}
				)
				RETURNING
					id,
					store_id,
					name,
					purchase_price,
					purchase_unit,
					unit_capacity,
					cost_per_unit
			`;

			return created;
		} catch (err) {
			console.warn('Postgres fallback (createIngredient):', err);
		}
	}
	return localCreateIngredient(storeId, data);
}

/**
 * Updates an existing ingredient.
 */
export async function updateIngredient(
	id: string,
	storeId: string,
	data: {
		name: string;
		purchasePrice: number;
		purchaseUnit: string;
		unitCapacity: number;
	}
): Promise<Ingredient> {
	if (await isPostgresAvailable()) {
		try {
			const [updated] = await sql<Ingredient[]>`
				UPDATE ingredients
				SET
					name = ${data.name},
					purchase_price = ${data.purchasePrice},
					purchase_unit = ${data.purchaseUnit},
					unit_capacity = ${data.unitCapacity}
				WHERE id = ${id} AND store_id = ${storeId}
				RETURNING
					id,
					store_id,
					name,
					purchase_price,
					purchase_unit,
					unit_capacity,
					cost_per_unit
			`;

			return updated;
		} catch (err) {
			console.warn('Postgres fallback (updateIngredient):', err);
		}
	}
	return localUpdateIngredient(id, storeId, data);
}

/**
 * Deletes an ingredient by ID.
 */
export async function deleteIngredient(id: string, storeId: string): Promise<boolean> {
	if (await isPostgresAvailable()) {
		try {
			const result = await sql`
				DELETE FROM ingredients
				WHERE id = ${id} AND store_id = ${storeId}
			`;
			return result.count > 0;
		} catch (err) {
			console.warn('Postgres fallback (deleteIngredient):', err);
		}
	}
	return localDeleteIngredient(id, storeId);
}

