export interface Store {
	id: string;
	storeName: string;
	targetMargin: number; // e.g. 0.35 = 35%
	createdAt: string;
}

export interface Ingredient {
	id: string;
	storeId: string;
	name: string;
	purchasePrice: number | string;
	purchaseUnit: string;
	unitCapacity: number | string;
	costPerUnit: number | string;
}

export interface MenuItem {
	id: string;
	storeId: string;
	name: string;
	sellingPrice: number;
	category: string;
	createdAt: string;
}

export interface RecipeIngredient {
	id: string;
	menuId: string;
	ingredientId: string;
	quantityUsed: number; // Portion quantity in base unit
	// Joined fields (optional)
	ingredientName?: string;
	purchaseUnit?: string;
	costPerUnit?: number;
	subtotalCost?: number;
}

export type MatrixStatus = 'Star' | 'Plowhorse';

export interface MenuAnalysis {
	menuId: string;
	storeId: string;
	menuName: string;
	category: string;
	sellingPrice: number;
	totalHpp: number;
	profitAmount: number;
	currentMargin: number; // e.g. 0.42 = 42%
	idealSellingPrice: number;
	matrixStatus: MatrixStatus;
}

