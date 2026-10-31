// src/lib/server/localStore.ts
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { Store, Ingredient, MenuItem, MenuAnalysis } from '#lib/types/database.ts';
import type {
	AdvisorSessionWithMessages,
	AdvisorMessageRow,
	AdvisorResponse,
	BundlingRecommendation
} from '#lib/server/services/aiAdvisor.ts';
import type { MenuItemWithRecipe, RecipeIngredientDetail } from '#lib/server/services/menu.ts';

interface RecipeRow {
	id: string;
	menuId: string;
	ingredientId: string;
	quantityUsed: number;
}

interface SessionRow {
	id: string;
	storeId: string;
	title: string;
	createdAt: string;
	updatedAt: string;
}

interface MessageRow {
	id: string;
	sessionId: string;
	role: 'user' | 'assistant';
	content?: string | null;
	friendlyAdvice?: string | null;
	actionStep?: string | null;
	bundlingRecommendations?: BundlingRecommendation[];
	createdAt: string;
}

interface LocalDbSchema {
	stores: Store[];
	ingredients: Ingredient[];
	menuItems: MenuItem[];
	recipeIngredients: RecipeRow[];
	advisorSessions: SessionRow[];
	advisorMessages: MessageRow[];
}

const DB_FILE_PATH = path.resolve(process.cwd(), '.svelte-kit/hargapas-db.json');

const STORE_WARKOP = 'e11c6a9e-9b0c-1d2e-3f4a-334455667788';
const STORE_KOPI = 'c8d0975d-1a2b-4c3d-9e8f-112233445566';
const STORE_WARMINDO = '4dad1268-5e6f-7a8b-9c0d-223344556677';

function createInitialDb(): LocalDbSchema {
	const nowIso = new Date().toISOString();

	const stores: Store[] = [
		{
			id: STORE_WARKOP,
			storeName: 'Warkop Ceria Bingit',
			targetMargin: 0.3,
			createdAt: nowIso
		},
		{
			id: STORE_KOPI,
			storeName: 'Kopi Kenangan Pahit',
			targetMargin: 0.4,
			createdAt: nowIso
		},
		{
			id: STORE_WARMINDO,
			storeName: 'Warmindo Tunjungan',
			targetMargin: 0.25,
			createdAt: nowIso
		}
	];

	const ingredients: Ingredient[] = [
		// Warkop Ceria Bingit Ingredients
		{
			id: 'ing-w-1',
			storeId: STORE_WARKOP,
			name: 'Ayam Mentah',
			purchasePrice: 38000,
			purchaseUnit: 'kg',
			unitCapacity: 1000,
			costPerUnit: 38
		},
		{
			id: 'ing-w-2',
			storeId: STORE_WARKOP,
			name: 'Cabe Merah Besar',
			purchasePrice: 60000,
			purchaseUnit: 'kg',
			unitCapacity: 1000,
			costPerUnit: 60
		},
		{
			id: 'ing-w-3',
			storeId: STORE_WARKOP,
			name: 'Daging Sapi',
			purchasePrice: 150000,
			purchaseUnit: 'kg',
			unitCapacity: 1000,
			costPerUnit: 150
		},
		{
			id: 'ing-w-4',
			storeId: STORE_WARKOP,
			name: 'Es',
			purchasePrice: 20000,
			purchaseUnit: 'pack',
			unitCapacity: 50,
			costPerUnit: 400
		},
		{
			id: 'ing-w-5',
			storeId: STORE_WARKOP,
			name: 'Kecap Bango',
			purchasePrice: 10000,
			purchaseUnit: 'pack',
			unitCapacity: 1,
			costPerUnit: 10000
		},
		{
			id: 'ing-w-6',
			storeId: STORE_WARKOP,
			name: 'Teh Tubruk',
			purchasePrice: 20000,
			purchaseUnit: 'pack',
			unitCapacity: 50,
			costPerUnit: 400
		},
		// Kopi Kenangan Pahit Ingredients (from prototype-main seed.sql)
		{
			id: 'ing-k-1',
			storeId: STORE_KOPI,
			name: 'Kopi Biji Robusta Roast',
			purchasePrice: 85000,
			purchaseUnit: 'kg',
			unitCapacity: 1000,
			costPerUnit: 85
		},
		{
			id: 'ing-k-2',
			storeId: STORE_KOPI,
			name: 'Susu Fresh UHT Full Cream',
			purchasePrice: 19500,
			purchaseUnit: 'liter',
			unitCapacity: 1000,
			costPerUnit: 19.5
		},
		{
			id: 'ing-k-3',
			storeId: STORE_KOPI,
			name: 'Gula Aren Cair Premium',
			purchasePrice: 32000,
			purchaseUnit: 'liter',
			unitCapacity: 1000,
			costPerUnit: 32
		},
		{
			id: 'ing-k-4',
			storeId: STORE_KOPI,
			name: 'Cup 14oz + Tutup + Sedotan',
			purchasePrice: 30000,
			purchaseUnit: 'pcs',
			unitCapacity: 50,
			costPerUnit: 600
		},
		{
			id: 'ing-k-5',
			storeId: STORE_KOPI,
			name: 'Ayam Segar Potong',
			purchasePrice: 42000,
			purchaseUnit: 'kg',
			unitCapacity: 1000,
			costPerUnit: 42
		},
		{
			id: 'ing-k-6',
			storeId: STORE_KOPI,
			name: 'Beras Pulen Super',
			purchasePrice: 75000,
			purchaseUnit: 'kg',
			unitCapacity: 5000,
			costPerUnit: 15
		},
		{
			id: 'ing-k-7',
			storeId: STORE_KOPI,
			name: 'Minyak Goreng Sawit',
			purchasePrice: 36000,
			purchaseUnit: 'liter',
			unitCapacity: 2000,
			costPerUnit: 18
		},
		{
			id: 'ing-k-8',
			storeId: STORE_KOPI,
			name: 'Cabai Rawit Merah',
			purchasePrice: 55000,
			purchaseUnit: 'kg',
			unitCapacity: 1000,
			costPerUnit: 55
		},
		{
			id: 'ing-k-9',
			storeId: STORE_KOPI,
			name: 'Telur Ayam Ras',
			purchasePrice: 28000,
			purchaseUnit: 'pcs',
			unitCapacity: 16,
			costPerUnit: 1750
		}
	];

	const menuItems: MenuItem[] = [
		// Warkop Ceria Bingit Menus
		{
			id: 'menu-w-1',
			storeId: STORE_WARKOP,
			name: 'Ayam Geprek',
			sellingPrice: 12000,
			category: 'Makanan',
			createdAt: nowIso
		},
		{
			id: 'menu-w-2',
			storeId: STORE_WARKOP,
			name: 'Dendeng',
			sellingPrice: 15000,
			category: 'Makanan',
			createdAt: nowIso
		},
		{
			id: 'menu-w-3',
			storeId: STORE_WARKOP,
			name: 'Es Teh',
			sellingPrice: 2000,
			category: 'Minuman',
			createdAt: nowIso
		},
		{
			id: 'menu-w-4',
			storeId: STORE_WARKOP,
			name: 'Es Teh Jumbo',
			sellingPrice: 5000,
			category: 'Minuman',
			createdAt: nowIso
		},
		// Kopi Kenangan Pahit Menus
		{
			id: 'menu-k-1',
			storeId: STORE_KOPI,
			name: 'Es Kopi Susu Gula Aren',
			sellingPrice: 18000,
			category: 'Minuman',
			createdAt: nowIso
		},
		{
			id: 'menu-k-2',
			storeId: STORE_KOPI,
			name: 'Iced Americano',
			sellingPrice: 12000,
			category: 'Minuman',
			createdAt: nowIso
		},
		{
			id: 'menu-k-3',
			storeId: STORE_KOPI,
			name: 'Ayam Geprek + Nasi Sambal Bawang',
			sellingPrice: 20000,
			category: 'Makanan',
			createdAt: nowIso
		},
		{
			id: 'menu-k-4',
			storeId: STORE_KOPI,
			name: 'Nasi Goreng Spesial Telur',
			sellingPrice: 16000,
			category: 'Makanan',
			createdAt: nowIso
		}
	];

	const recipeIngredients: RecipeRow[] = [
		// Warkop Ceria Bingit Recipes
		{ id: 'ri-w-1', menuId: 'menu-w-1', ingredientId: 'ing-w-1', quantityUsed: 165 },
		{ id: 'ri-w-2', menuId: 'menu-w-2', ingredientId: 'ing-w-3', quantityUsed: 50 },
		{ id: 'ri-w-3', menuId: 'menu-w-2', ingredientId: 'ing-w-2', quantityUsed: 20 },
		{ id: 'ri-w-4', menuId: 'menu-w-2', ingredientId: 'ing-w-4', quantityUsed: 1 },
		{ id: 'ri-w-5', menuId: 'menu-w-3', ingredientId: 'ing-w-6', quantityUsed: 1 },
		{ id: 'ri-w-6', menuId: 'menu-w-3', ingredientId: 'ing-w-4', quantityUsed: 1 },
		{ id: 'ri-w-7', menuId: 'menu-w-4', ingredientId: 'ing-w-6', quantityUsed: 2.5 },
		{ id: 'ri-w-8', menuId: 'menu-w-4', ingredientId: 'ing-w-4', quantityUsed: 2.5 },
		// Kopi Kenangan Pahit Recipes
		{ id: 'ri-k-1', menuId: 'menu-k-1', ingredientId: 'ing-k-1', quantityUsed: 18 },
		{ id: 'ri-k-2', menuId: 'menu-k-1', ingredientId: 'ing-k-2', quantityUsed: 120 },
		{ id: 'ri-k-3', menuId: 'menu-k-1', ingredientId: 'ing-k-3', quantityUsed: 25 },
		{ id: 'ri-k-4', menuId: 'menu-k-1', ingredientId: 'ing-k-4', quantityUsed: 1 },
		{ id: 'ri-k-5', menuId: 'menu-k-2', ingredientId: 'ing-k-1', quantityUsed: 18 },
		{ id: 'ri-k-6', menuId: 'menu-k-2', ingredientId: 'ing-k-4', quantityUsed: 1 },
		{ id: 'ri-k-7', menuId: 'menu-k-3', ingredientId: 'ing-k-5', quantityUsed: 160 },
		{ id: 'ri-k-8', menuId: 'menu-k-3', ingredientId: 'ing-k-6', quantityUsed: 100 },
		{ id: 'ri-k-9', menuId: 'menu-k-3', ingredientId: 'ing-k-7', quantityUsed: 50 },
		{ id: 'ri-k-10', menuId: 'menu-k-3', ingredientId: 'ing-k-8', quantityUsed: 30 },
		{ id: 'ri-k-11', menuId: 'menu-k-4', ingredientId: 'ing-k-6', quantityUsed: 120 },
		{ id: 'ri-k-12', menuId: 'menu-k-4', ingredientId: 'ing-k-9', quantityUsed: 1 },
		{ id: 'ri-k-13', menuId: 'menu-k-4', ingredientId: 'ing-k-7', quantityUsed: 30 },
		{ id: 'ri-k-14', menuId: 'menu-k-4', ingredientId: 'ing-k-8', quantityUsed: 15 }
	];

	const advisorSessions: SessionRow[] = [
		{
			id: 'sess-w-1',
			storeId: STORE_WARKOP,
			title: 'kalo untuk dendeng gimana',
			createdAt: '2026-10-18T10:32:00.000Z',
			updatedAt: '2026-10-18T10:32:00.000Z'
		},
		{
			id: 'sess-w-2',
			storeId: STORE_WARKOP,
			title: 'kasih aku saran bundling dong untuk siang hari',
			createdAt: '2026-10-10T05:13:00.000Z',
			updatedAt: '2026-10-10T05:13:00.000Z'
		}
	];

	const advisorMessages: MessageRow[] = [
		{
			id: 'msg-w-1',
			sessionId: 'sess-w-1',
			role: 'user',
			content: 'kalo untuk dendeng gimana',
			createdAt: '2026-10-18T10:32:00.000Z'
		},
		{
			id: 'msg-w-2',
			sessionId: 'sess-w-1',
			role: 'assistant',
			friendlyAdvice:
				'Dendeng Anda sudah memiliki status Star dengan margin yang sehat. Mari kita buat paket bundling agar menu ini lebih sering dipesan bersama minuman.',
			actionStep:
				'Buat papan menu kecil di meja yang menampilkan paket bundling Dendeng untuk meningkatkan Average Order Value.',
			bundlingRecommendations: [
				{
					comboName: 'Paket Kenyang Mantap',
					itemsIncluded: ['Dendeng', 'Es Teh Jumbo'],
					suggestedPrice: 18000,
					marketingHeadline: 'Kombinasi Gurih & Segar, Perut Kenyang Hati Senang!',
					reasoning:
						'Menggabungkan dua produk Star untuk memaksimalkan volume penjualan dengan harga yang tetap kompetitif bagi pelanggan.'
				},
				{
					comboName: 'Paket Hemat Ceria',
					itemsIncluded: ['Dendeng', 'Es Teh'],
					suggestedPrice: 16000,
					marketingHeadline: 'Makan Enak Gak Pakai Mahal',
					reasoning:
						'Menggabungkan dua produk Star untuk memaksimalkan volume penjualan dengan harga yang tetap kompetitif bagi pelanggan.'
				}
			],
			createdAt: '2026-10-18T10:32:01.000Z'
		},
		{
			id: 'msg-w-3',
			sessionId: 'sess-w-2',
			role: 'user',
			content: 'kasih aku saran bundling dong untuk siang hari',
			createdAt: '2026-10-10T05:13:00.000Z'
		},
		{
			id: 'msg-w-4',
			sessionId: 'sess-w-2',
			role: 'assistant',
			friendlyAdvice:
				'Ayam Geprek dan Es Teh memiliki margin rata-rata di atas 50%. Bundling makan siang akan mempercepat perputaran meja di jam sibuk.',
			actionStep:
				'Buat visual sederhana untuk paket bundling ini dan pajang tepat di area pemesanan atau status WhatsApp hari ini.',
			bundlingRecommendations: [
				{
					comboName: 'Paket Siang Juara',
					itemsIncluded: ['Ayam Geprek', 'Es Teh'],
					suggestedPrice: 13500,
					marketingHeadline: 'Pedasnya Pas, Segarnya Puas!',
					reasoning:
						'Menarik pelanggan jam makan siang dengan selisih hemat Rp 500 namun volume transaksi meningkat.'
				},
				{
					comboName: 'Paket Geprek Jumbo',
					itemsIncluded: ['Ayam Geprek', 'Es Teh Jumbo'],
					suggestedPrice: 16000,
					marketingHeadline: 'Kenyang Maksimal Tanpa Bikin Kantong Jebol',
					reasoning: 'Meningkatkan penjualan Es Teh Jumbo yang memiliki margin 60%.'
				}
			],
			createdAt: '2026-10-10T05:13:01.000Z'
		}
	];

	return {
		stores,
		ingredients,
		menuItems,
		recipeIngredients,
		advisorSessions,
		advisorMessages
	};
}

let memoryDb: LocalDbSchema | null = null;

function readDb(): LocalDbSchema {
	if (memoryDb) return memoryDb;
	try {
		if (fs.existsSync(DB_FILE_PATH)) {
			const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
			const parsed = JSON.parse(raw) as LocalDbSchema;
			if (parsed && Array.isArray(parsed.stores)) {
				memoryDb = parsed;
				return memoryDb;
			}
		}
	} catch {
		// ignore read error and initialize fresh
	}
	memoryDb = createInitialDb();
	writeDb(memoryDb);
	return memoryDb;
}

function writeDb(db: LocalDbSchema) {
	memoryDb = db;
	try {
		const dir = path.dirname(DB_FILE_PATH);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
		fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
	} catch {
		// In serverless / read-only fs, memoryDb remains active
	}
}

// ==========================================
// STORES OPERATIONS
// ==========================================

export function localGetAllStores(): Store[] {
	const db = readDb();
	return [...db.stores].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	);
}

export function localGetStoreById(id: string): Store | null {
	const db = readDb();
	return db.stores.find((s) => s.id === id) || null;
}

export function localCreateStore(data: { storeName: string; targetMargin?: number }): Store {
	const db = readDb();
	const rawMargin = data.targetMargin ?? 0.35;
	const normalizedMargin = rawMargin > 1 ? rawMargin / 100 : rawMargin;
	const newStore: Store = {
		id: crypto.randomUUID(),
		storeName: data.storeName,
		targetMargin: normalizedMargin,
		createdAt: new Date().toISOString()
	};
	db.stores.unshift(newStore);
	writeDb(db);
	return newStore;
}

export function localUpdateStore(
	id: string,
	data: { storeName?: string; targetMargin?: number }
): Store {
	const db = readDb();
	const idx = db.stores.findIndex((s) => s.id === id);
	if (idx === -1) {
		throw new Error('Toko tidak ditemukan');
	}
	const current = db.stores[idx];
	let nextMargin = current.targetMargin;
	if (data.targetMargin !== undefined && data.targetMargin !== null) {
		nextMargin = data.targetMargin > 1 ? data.targetMargin / 100 : data.targetMargin;
	}
	const updated: Store = {
		...current,
		storeName: data.storeName ?? current.storeName,
		targetMargin: nextMargin
	};
	db.stores[idx] = updated;
	writeDb(db);
	return updated;
}

export function localDeleteStore(id: string): boolean {
	const db = readDb();
	const initialLen = db.stores.length;
	db.stores = db.stores.filter((s) => s.id !== id);
	if (db.stores.length === initialLen) return false;

	// Cascade delete ingredients, menus, recipes, sessions, messages
	const menuIds = new Set(db.menuItems.filter((m) => m.storeId === id).map((m) => m.id));
	const ingIds = new Set(db.ingredients.filter((i) => i.storeId === id).map((i) => i.id));
	const sessIds = new Set(db.advisorSessions.filter((s) => s.storeId === id).map((s) => s.id));

	db.menuItems = db.menuItems.filter((m) => m.storeId !== id);
	db.ingredients = db.ingredients.filter((i) => i.storeId !== id);
	db.recipeIngredients = db.recipeIngredients.filter(
		(ri) => !menuIds.has(ri.menuId) && !ingIds.has(ri.ingredientId)
	);
	db.advisorSessions = db.advisorSessions.filter((s) => s.storeId !== id);
	db.advisorMessages = db.advisorMessages.filter((m) => !sessIds.has(m.sessionId));

	writeDb(db);
	return true;
}

// ==========================================
// INGREDIENTS OPERATIONS
// ==========================================

export function localGetIngredients(storeId: string): Ingredient[] {
	const db = readDb();
	return db.ingredients
		.filter((i) => i.storeId === storeId)
		.sort((a, b) => a.name.localeCompare(b.name));
}

export function localGetIngredientById(id: string, storeId: string): Ingredient | null {
	const db = readDb();
	return db.ingredients.find((i) => i.id === id && i.storeId === storeId) || null;
}

export function localCreateIngredient(
	storeId: string,
	data: {
		name: string;
		purchasePrice: number;
		purchaseUnit: string;
		unitCapacity: number;
	}
): Ingredient {
	const db = readDb();
	const cap = Number(data.unitCapacity) || 1;
	const price = Number(data.purchasePrice) || 0;
	const costPerUnit = cap > 0 ? Number((price / cap).toFixed(4)) : 0;

	const created: Ingredient = {
		id: crypto.randomUUID(),
		storeId,
		name: data.name,
		purchasePrice: price,
		purchaseUnit: data.purchaseUnit,
		unitCapacity: cap,
		costPerUnit
	};

	db.ingredients.push(created);
	writeDb(db);
	return created;
}

export function localUpdateIngredient(
	id: string,
	storeId: string,
	data: {
		name: string;
		purchasePrice: number;
		purchaseUnit: string;
		unitCapacity: number;
	}
): Ingredient {
	const db = readDb();
	const idx = db.ingredients.findIndex((i) => i.id === id && i.storeId === storeId);
	if (idx === -1) {
		throw new Error('Bahan baku tidak ditemukan');
	}
	const cap = Number(data.unitCapacity) || 1;
	const price = Number(data.purchasePrice) || 0;
	const costPerUnit = cap > 0 ? Number((price / cap).toFixed(4)) : 0;

	const updated: Ingredient = {
		...db.ingredients[idx],
		name: data.name,
		purchasePrice: price,
		purchaseUnit: data.purchaseUnit,
		unitCapacity: cap,
		costPerUnit
	};

	db.ingredients[idx] = updated;
	writeDb(db);
	return updated;
}

export function localDeleteIngredient(id: string, storeId: string): boolean {
	const db = readDb();
	const before = db.ingredients.length;
	db.ingredients = db.ingredients.filter((i) => !(i.id === id && i.storeId === storeId));
	if (db.ingredients.length === before) return false;

	// Cascade delete from recipe_ingredients
	db.recipeIngredients = db.recipeIngredients.filter((ri) => ri.ingredientId !== id);
	writeDb(db);
	return true;
}

// ==========================================
// MENU & RECIPES OPERATIONS
// ==========================================

export function localGetMenuItemById(id: string, storeId: string): MenuItemWithRecipe | null {
	const db = readDb();
	const item = db.menuItems.find((m) => m.id === id && m.storeId === storeId);
	if (!item) return null;

	const ingMap = new Map(db.ingredients.map((i) => [i.id, i]));
	const recipeRows: RecipeIngredientDetail[] = db.recipeIngredients
		.filter((ri) => ri.menuId === id)
		.map((ri) => {
			const ing = ingMap.get(ri.ingredientId);
			const costPerUnit = Number(ing?.costPerUnit ?? 0);
			const qty = Number(ri.quantityUsed || 0);
			return {
				id: ri.id,
				menuId: ri.menuId,
				ingredientId: ri.ingredientId,
				ingredientName: ing?.name || 'Bahan',
				purchaseUnit: ing?.purchaseUnit || 'pcs',
				costPerUnit,
				quantityUsed: qty,
				subtotalCost: qty * costPerUnit
			};
		})
		.sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));

	const totalHpp = recipeRows.reduce((acc, curr) => acc + Number(curr.subtotalCost || 0), 0);

	return {
		...item,
		ingredients: recipeRows,
		totalHpp
	};
}

export function localGetMenuItemsWithRecipes(storeId: string): MenuItemWithRecipe[] {
	const db = readDb();
	const items = db.menuItems
		.filter((m) => m.storeId === storeId)
		.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

	if (items.length === 0) return [];

	const ingMap = new Map(db.ingredients.map((i) => [i.id, i]));

	return items.map((item) => {
		const ingList: RecipeIngredientDetail[] = db.recipeIngredients
			.filter((ri) => ri.menuId === item.id)
			.map((ri) => {
				const ing = ingMap.get(ri.ingredientId);
				const purchasePrice = Number(ing?.purchasePrice ?? 0);
				const unitCapacity = Number(ing?.unitCapacity ?? 1);
				const costPerUnit = unitCapacity > 0 ? purchasePrice / unitCapacity : 0;
				const qty = Number(ri.quantityUsed || 0);
				return {
					id: ri.id,
					menuId: item.id,
					ingredientId: ri.ingredientId,
					ingredientName: ing?.name || 'Bahan',
					purchaseUnit: ing?.purchaseUnit || 'pcs',
					quantityUsed: qty,
					costPerUnit,
					subtotalCost: qty * costPerUnit
				};
			})
			.sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));

		const totalHpp = ingList.reduce((acc, curr) => acc + Number(curr.subtotalCost || 0), 0);
		const sellingPrice = Number(item.sellingPrice || 0);
		const profit = sellingPrice - totalHpp;
		const margin = sellingPrice > 0 ? profit / sellingPrice : 0;

		return {
			id: item.id,
			storeId: item.storeId,
			name: item.name,
			sellingPrice,
			category: item.category || 'General',
			createdAt: item.createdAt,
			hpp: totalHpp,
			totalHpp,
			profit,
			margin,
			ingredients: ingList,
			recipes: ingList
		};
	});
}

export function localCreateMenuItem(
	storeId: string,
	data: {
		name: string;
		sellingPrice: number;
		category: string;
		ingredients: Array<{ ingredientId: string; quantityUsed: number }>;
	}
): string {
	const db = readDb();
	const newId = crypto.randomUUID();
	const created: MenuItem = {
		id: newId,
		storeId,
		name: data.name,
		sellingPrice: Number(data.sellingPrice) || 0,
		category: data.category || 'General',
		createdAt: new Date().toISOString()
	};

	db.menuItems.push(created);

	if (data.ingredients && data.ingredients.length > 0) {
		const validIngs = data.ingredients.filter((i) => i.ingredientId && Number(i.quantityUsed) > 0);
		for (const ing of validIngs) {
			db.recipeIngredients.push({
				id: crypto.randomUUID(),
				menuId: newId,
				ingredientId: ing.ingredientId,
				quantityUsed: Number(ing.quantityUsed)
			});
		}
	}

	writeDb(db);
	return newId;
}

export function localUpdateMenuItem(
	id: string,
	storeId: string,
	data: {
		name: string;
		sellingPrice: number;
		category: string;
		ingredients: Array<{ ingredientId: string; quantityUsed: number }>;
	}
): void {
	const db = readDb();
	const idx = db.menuItems.findIndex((m) => m.id === id && m.storeId === storeId);
	if (idx === -1) return;

	db.menuItems[idx] = {
		...db.menuItems[idx],
		name: data.name,
		sellingPrice: Number(data.sellingPrice) || 0,
		category: data.category || 'General'
	};

	db.recipeIngredients = db.recipeIngredients.filter((ri) => ri.menuId !== id);

	if (data.ingredients && data.ingredients.length > 0) {
		const validIngs = data.ingredients.filter((i) => i.ingredientId && Number(i.quantityUsed) > 0);
		for (const ing of validIngs) {
			db.recipeIngredients.push({
				id: crypto.randomUUID(),
				menuId: id,
				ingredientId: ing.ingredientId,
				quantityUsed: Number(ing.quantityUsed)
			});
		}
	}

	writeDb(db);
}

export function localDeleteMenuItem(id: string, storeId: string): boolean {
	const db = readDb();
	const before = db.menuItems.length;
	db.menuItems = db.menuItems.filter((m) => !(m.id === id && m.storeId === storeId));
	if (db.menuItems.length === before) return false;

	db.recipeIngredients = db.recipeIngredients.filter((ri) => ri.menuId !== id);
	writeDb(db);
	return true;
}

// ==========================================
// VIEW_MENU_ANALYSIS DETERMINISTIC ENGINE
// ==========================================

export function localGetViewMenuAnalysis(storeId: string): MenuAnalysis[] {
	const db = readDb();
	const store = db.stores.find((s) => s.id === storeId);
	const rawTarget = Number(store?.targetMargin ?? 0.35);
	const targetMargin = rawTarget > 1 ? rawTarget / 100 : rawTarget;

	const menus = db.menuItems.filter((m) => m.storeId === storeId);
	const ingMap = new Map(db.ingredients.map((i) => [i.id, i]));

	const rows: MenuAnalysis[] = menus.map((m) => {
		const recipes = db.recipeIngredients.filter((ri) => ri.menuId === m.id);
		const totalHpp = recipes.reduce((acc, ri) => {
			const ing = ingMap.get(ri.ingredientId);
			const costPerUnit = Number(ing?.costPerUnit ?? 0);
			return acc + Number(ri.quantityUsed || 0) * costPerUnit;
		}, 0);

		const sellingPrice = Number(m.sellingPrice || 0);
		const profitAmount = sellingPrice - totalHpp;
		const currentMargin =
			sellingPrice > 0 ? Math.round(((sellingPrice - totalHpp) / sellingPrice) * 10000) / 10000 : 0;
		const denom = 1 - targetMargin;
		const idealSellingPrice = denom > 0 ? Math.ceil(totalHpp / denom) : sellingPrice;
		const matrixStatus = currentMargin >= targetMargin ? 'Star' : 'Plowhorse';

		return {
			menuId: m.id,
			storeId: m.storeId,
			menuName: m.name,
			category: m.category,
			sellingPrice,
			totalHpp,
			profitAmount,
			currentMargin,
			idealSellingPrice,
			matrixStatus
		};
	});

	return rows.sort((a, b) => {
		if (a.matrixStatus !== b.matrixStatus) {
			return a.matrixStatus.localeCompare(b.matrixStatus);
		}
		return b.currentMargin - a.currentMargin;
	});
}

// ==========================================
// ADVISOR SESSIONS & MESSAGES
// ==========================================

export function localGetAdvisorSessions(storeId: string): AdvisorSessionWithMessages[] {
	const db = readDb();
	return db.advisorSessions
		.filter((s) => s.storeId === storeId)
		.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
		.map((s) => ({
			id: s.id,
			storeId: s.storeId,
			title: s.title,
			createdAt: new Date(s.createdAt),
			updatedAt: new Date(s.updatedAt),
			messages: localGetSessionMessages(s.id)
		}));
}

export function localGetSessionMessages(sessionId: string): AdvisorMessageRow[] {
	const db = readDb();
	return db.advisorMessages
		.filter((m) => m.sessionId === sessionId)
		.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
		.map((m) => ({
			id: m.id,
			sessionId: m.sessionId,
			role: m.role,
			content: m.content,
			friendlyAdvice: m.friendlyAdvice,
			actionStep: m.actionStep,
			bundlingRecommendations: m.bundlingRecommendations || [],
			createdAt: new Date(m.createdAt)
		}));
}

export function localGetDailyAdviceCount(storeId: string): number {
	const db = readDb();
	const todayStart = new Date();
	todayStart.setHours(0, 0, 0, 0);
	const sessIds = new Set(db.advisorSessions.filter((s) => s.storeId === storeId).map((s) => s.id));

	return db.advisorMessages.filter(
		(m) =>
			sessIds.has(m.sessionId) &&
			m.role === 'user' &&
			new Date(m.createdAt).getTime() >= todayStart.getTime()
	).length;
}

export function localSaveNewAdvisorSession(
	storeId: string,
	userQuery: string,
	aiResult: AdvisorResponse
): string {
	const db = readDb();
	const nowIso = new Date().toISOString();
	const sessionId = crypto.randomUUID();
	const sessionTitle = userQuery.length > 50 ? userQuery.slice(0, 47) + '...' : userQuery;

	db.advisorSessions.unshift({
		id: sessionId,
		storeId,
		title: sessionTitle,
		createdAt: nowIso,
		updatedAt: nowIso
	});

	db.advisorMessages.push({
		id: crypto.randomUUID(),
		sessionId,
		role: 'user',
		content: userQuery,
		createdAt: nowIso
	});

	db.advisorMessages.push({
		id: crypto.randomUUID(),
		sessionId,
		role: 'assistant',
		friendlyAdvice: aiResult.friendlyAdvice,
		actionStep: aiResult.actionStep,
		bundlingRecommendations: aiResult.bundlingRecommendations || [],
		createdAt: new Date(Date.now() + 10).toISOString()
	});

	writeDb(db);
	return sessionId;
}

export function localAppendMessageToSession(
	sessionId: string,
	userQuery: string,
	aiResult: AdvisorResponse
): void {
	const db = readDb();
	const nowIso = new Date().toISOString();

	db.advisorMessages.push({
		id: crypto.randomUUID(),
		sessionId,
		role: 'user',
		content: userQuery,
		createdAt: nowIso
	});

	db.advisorMessages.push({
		id: crypto.randomUUID(),
		sessionId,
		role: 'assistant',
		friendlyAdvice: aiResult.friendlyAdvice,
		actionStep: aiResult.actionStep,
		bundlingRecommendations: aiResult.bundlingRecommendations || [],
		createdAt: new Date(Date.now() + 10).toISOString()
	});

	const sessIdx = db.advisorSessions.findIndex((s) => s.id === sessionId);
	if (sessIdx !== -1) {
		db.advisorSessions[sessIdx].updatedAt = nowIso;
	}

	writeDb(db);
}

export function localDeleteAdvisorSession(sessionId: string, storeId: string): boolean {
	const db = readDb();
	const before = db.advisorSessions.length;
	db.advisorSessions = db.advisorSessions.filter(
		(s) => !(s.id === sessionId && s.storeId === storeId)
	);
	if (db.advisorSessions.length === before) return false;

	db.advisorMessages = db.advisorMessages.filter((m) => m.sessionId !== sessionId);
	writeDb(db);
	return true;
}

export function localDeleteAllSessionsByStoreId(storeId: string): boolean {
	const db = readDb();
	const sessIds = new Set(db.advisorSessions.filter((s) => s.storeId === storeId).map((s) => s.id));
	db.advisorSessions = db.advisorSessions.filter((s) => s.storeId !== storeId);
	db.advisorMessages = db.advisorMessages.filter((m) => !sessIds.has(m.sessionId));
	writeDb(db);
	return true;
}

