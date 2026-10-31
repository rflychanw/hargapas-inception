import { sql, isPostgresAvailable } from '#lib/server/db.ts';
import type { MenuAnalysis } from '#lib/types/database.ts';
import { localGetViewMenuAnalysis } from '#lib/server/localStore.ts';

export interface AnalysisSummary {
	items: MenuAnalysis[];
	totalMenuCount: number;
	starCount: number;
	plowhorseCount: number;
	avgMargin: number;
	totalPotentialRevenue: number;
	totalEstimatedHpp: number;
}

/**
 * Fetches deterministic menu analysis directly from PostgreSQL view_menu_analysis.
 * Zero LLM calculation. 100% mathematical integrity.
 */
export async function getMenuAnalysis(storeId: string): Promise<AnalysisSummary> {
	let items: MenuAnalysis[] = [];

	if (await isPostgresAvailable()) {
		try {
			items = await sql<MenuAnalysis[]>`
				SELECT
					menu_id,
					store_id,
					menu_name,
					category,
					selling_price,
					total_hpp,
					profit_amount,
					current_margin,
					ideal_selling_price,
					matrix_status
				FROM view_menu_analysis
				WHERE store_id = ${storeId}
				ORDER BY matrix_status ASC, current_margin DESC
			`;
		} catch (err) {
			console.warn('Postgres fallback (getMenuAnalysis):', err);
			items = localGetViewMenuAnalysis(storeId);
		}
	} else {
		items = localGetViewMenuAnalysis(storeId);
	}

	const totalMenuCount = items.length;
	const starCount = items.filter((i: MenuAnalysis) => i.matrixStatus === 'Star').length;
	const plowhorseCount = items.filter((i: MenuAnalysis) => i.matrixStatus === 'Plowhorse').length;

	const avgMargin =
		totalMenuCount > 0
			? items.reduce(
					(acc: number, curr: MenuAnalysis) => acc + Number(curr.currentMargin || 0),
					0
				) / totalMenuCount
			: 0;

	const totalPotentialRevenue = items.reduce(
		(acc: number, curr: MenuAnalysis) => acc + Number(curr.sellingPrice || 0),
		0
	);
	const totalEstimatedHpp = items.reduce(
		(acc: number, curr: MenuAnalysis) => acc + Number(curr.totalHpp || 0),
		0
	);

	return {
		items,
		totalMenuCount,
		starCount,
		plowhorseCount,
		avgMargin: Math.round(avgMargin * 10000) / 10000,
		totalPotentialRevenue,
		totalEstimatedHpp
	};
}

