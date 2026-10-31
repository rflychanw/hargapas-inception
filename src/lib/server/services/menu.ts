import { sql, isPostgresAvailable } from '#lib/server/db.ts';
import type { MenuItem } from '#lib/types/database.ts';
import {
	localGetMenuItemById,
	localGetMenuItemsWithRecipes,
	localCreateMenuItem,
	localUpdateMenuItem,
	localDeleteMenuItem
} from '#lib/server/localStore.ts';

export interface RecipeIngredientDetail {
	id: string;
	menuId: string;
	ingredientId: string;
	ingredientName: string;
	purchaseUnit: string;
	costPerUnit: number;
	quantityUsed: number;
	subtotalCost: number;
}

export interface MenuItemWithRecipe extends MenuItem {
	ingredients: RecipeIngredientDetail[];
	totalHpp: number;
	hpp?: number;
	profit?: number;
	margin?: number;
	recipes?: RecipeIngredientDetail[];
}

/**
 * Retrieves a single menu item with its recipe ingredients breakdown by ID.
 */
export async function getMenuItemById(
	id: string,
	storeId: string
): Promise<MenuItemWithRecipe | null> {
	if (await isPostgresAvailable()) {
		try {
			const items = await sql<MenuItem[]>`
				SELECT id, store_id, name, selling_price, category, created_at
				FROM menu_items
				WHERE id = ${id} AND store_id = ${storeId}
				LIMIT 1
			`;

			if (items.length === 0) return null;

			const item = items[0];

			const recipeRows = await sql<RecipeIngredientDetail[]>`
				SELECT
					ri.id,
					ri.menu_id,
					ri.ingredient_id,
					i.name AS ingredient_name,
					i.purchase_unit,
					i.cost_per_unit,
					ri.quantity_used,
					(ri.quantity_used * i.cost_per_unit) AS subtotal_cost
				FROM recipe_ingredients ri
				JOIN ingredients i ON ri.ingredient_id = i.id
				WHERE ri.menu_id = ${id}
				ORDER BY i.name ASC
			`;

			const totalHpp = recipeRows.reduce(
				(acc: number, curr: RecipeIngredientDetail) => acc + Number(curr.subtotalCost || 0),
				0
			);

			return {
				...item,
				ingredients: recipeRows,
				totalHpp: totalHpp
			};
		} catch (err) {
			console.warn('Postgres fallback (getMenuItemById):', err);
		}
	}
	return localGetMenuItemById(id, storeId);
}

/**
 * Retrieves all menu items with their recipe ingredients breakdown.
 */
export async function getMenuItemsWithRecipes(storeId: string): Promise<MenuItemWithRecipe[]> {
	if (await isPostgresAvailable()) {
		try {
			const items = await sql<MenuItem[]>`
				SELECT id, store_id, name, selling_price, category, created_at
				FROM menu_items
				WHERE store_id = ${storeId}
				ORDER BY category ASC, name ASC
			`;

			if (items.length === 0) return [];

			const menuIds = items.map((i: MenuItem) => i.id);

			const recipeRows = await sql<any[]>`
				SELECT
					ri.id,
					ri.menu_id,
					ri.ingredient_id,
					ri.quantity_used,
					i.name AS ingredient_name,
					i.purchase_unit,
					COALESCE(i.purchase_price / NULLIF(i.unit_capacity, 0), 0) AS cost_per_unit,
					(ri.quantity_used * COALESCE(i.purchase_price / NULLIF(i.unit_capacity, 0), 0)) AS subtotal_cost
				FROM recipe_ingredients ri
				JOIN ingredients i ON ri.ingredient_id = i.id
				WHERE ri.menu_id = ANY(${menuIds})
				ORDER BY i.name ASC
			`;

			const recipeMap = new Map<string, RecipeIngredientDetail[]>();

			for (const row of recipeRows) {
				const menuId = row.menuId || row.menu_id;
				if (!recipeMap.has(menuId)) {
					recipeMap.set(menuId, []);
				}

				recipeMap.get(menuId)!.push({
					id: row.id,
					menuId: menuId,
					ingredientId: row.ingredientId || row.ingredient_id,
					ingredientName: row.ingredientName || row.ingredient_name,
					purchaseUnit: row.purchaseUnit || row.purchase_unit,
					quantityUsed: Number(row.quantityUsed || row.quantity_used || 0),
					costPerUnit: Number(row.costPerUnit || row.cost_per_unit || 0),
					subtotalCost: Number(row.subtotalCost || row.subtotal_cost || 0)
				});
			}

			return items.map((item: any) => {
				const itemId = item.id;
				const ingList = recipeMap.get(itemId) || [];

				const totalHpp = ingList.reduce(
					(acc: number, curr: RecipeIngredientDetail) => acc + Number(curr.subtotalCost || 0),
					0
				);

				const sellingPrice = Number(item.sellingPrice || item.selling_price || 0);
				const profit = sellingPrice - totalHpp;
				const margin = sellingPrice > 0 ? profit / sellingPrice : 0;

				return {
					id: item.id,
					storeId: item.storeId || item.store_id,
					name: item.name,
					sellingPrice: sellingPrice,
					category: item.category || 'General',
					createdAt: item.createdAt || item.created_at,
					hpp: totalHpp,
					totalHpp: totalHpp,
					profit: profit,
					margin: margin,
					ingredients: ingList,
					recipes: ingList
				};
			});
		} catch (err) {
			console.warn('Postgres fallback (getMenuItemsWithRecipes):', err);
		}
	}
	return localGetMenuItemsWithRecipes(storeId);
}

/**
 * Creates a menu item along with its recipe ingredients.
 */
export async function createMenuItem(
	storeId: string,
	data: {
		name: string;
		sellingPrice: number;
		category: string;
		ingredients: Array<{ ingredientId: string; quantityUsed: number }>;
	}
): Promise<string> {
	if (await isPostgresAvailable()) {
		try {
			return await sql.begin(async (tx: any) => {
				const [created] = await tx<MenuItem[]>`
					INSERT INTO menu_items (store_id, name, selling_price, category)
					VALUES (${storeId}, ${data.name}, ${data.sellingPrice}, ${data.category || 'General'})
					RETURNING id
				`;

				if (data.ingredients && data.ingredients.length > 0) {
					const validIngs = data.ingredients.filter(
						(i) => i.ingredientId && Number(i.quantityUsed) > 0
					);
					for (const ing of validIngs) {
						await tx`
							INSERT INTO recipe_ingredients (menu_id, ingredient_id, quantity_used)
							VALUES (${created.id}, ${ing.ingredientId}, ${ing.quantityUsed})
						`;
					}
				}

				return created.id;
			});
		} catch (err) {
			console.warn('Postgres fallback (createMenuItem):', err);
		}
	}
	return localCreateMenuItem(storeId, data);
}

/**
 * Updates a menu item and replaces its recipe ingredients.
 */
export async function updateMenuItem(
	id: string,
	storeId: string,
	data: {
		name: string;
		sellingPrice: number;
		category: string;
		ingredients: Array<{ ingredientId: string; quantityUsed: number }>;
	}
): Promise<void> {
	if (await isPostgresAvailable()) {
		try {
			await sql.begin(async (tx: any) => {
				await tx`
					UPDATE menu_items
					SET
						name = ${data.name},
						selling_price = ${data.sellingPrice},
						category = ${data.category || 'General'}
					WHERE id = ${id} AND store_id = ${storeId}
				`;

				await tx`
					DELETE FROM recipe_ingredients
					WHERE menu_id = ${id}
				`;

				if (data.ingredients && data.ingredients.length > 0) {
					const validIngs = data.ingredients.filter(
						(i) => i.ingredientId && Number(i.quantityUsed) > 0
					);
					for (const ing of validIngs) {
						await tx`
							INSERT INTO recipe_ingredients (menu_id, ingredient_id, quantity_used)
							VALUES (${id}, ${ing.ingredientId}, ${ing.quantityUsed})
						`;
					}
				}
			});
			return;
		} catch (err) {
			console.warn('Postgres fallback (updateMenuItem):', err);
		}
	}
	localUpdateMenuItem(id, storeId, data);
}

/**
 * Deletes a menu item.
 */
export async function deleteMenuItem(id: string, storeId: string): Promise<boolean> {
	if (await isPostgresAvailable()) {
		try {
			const result = await sql`
				DELETE FROM menu_items
				WHERE id = ${id} AND store_id = ${storeId}
			`;
			return result.count > 0;
		} catch (err) {
			console.warn('Postgres fallback (deleteMenuItem):', err);
		}
	}
	return localDeleteMenuItem(id, storeId);
}

