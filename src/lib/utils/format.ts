/**
 * Formats a number or numeric string to Indonesian Rupiah currency string.
 * e.g., 18500 or "18500.00" -> "Rp 18.500"
 */
export function formatRupiah(amount: number | string | null | undefined): string {
	const num = typeof amount === 'string' ? parseFloat(amount) : amount;

	if (num === null || num === undefined || isNaN(num)) {
		return 'Rp 0';
	}

	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		maximumFractionDigits: 0
	}).format(num);
}

/**
 * Formats a decimal number as percentage.
 * e.g., 0.35 -> "35%" or 0.425 -> "42.5%"
 */
export function formatPercent(value: number | null | undefined): string {
	if (value === null || value === undefined || isNaN(value)) {
		return '0%';
	}
	const percent = value * 100;
	return `${percent % 1 === 0 ? percent.toFixed(0) : percent.toFixed(1)}%`;
}

/**
 * Formats unit capacity labels.
 * e.g., 'kg', 1000 -> '1.000 gram / kg'
 */
export function formatUnitLabel(
	unit: string | null | undefined,
	capacity: number | null | undefined
): string {
	const safeUnit = unit || '';
	const safeCapacity = capacity ?? 0;
	const u = safeUnit.toLowerCase();

	if (u === 'kg') return `${safeCapacity.toLocaleString('id-ID')} gram / kg`;
	if (u === 'liter' || u === 'l') return `${safeCapacity.toLocaleString('id-ID')} ml / liter`;
	if (u === 'pcs' || u === 'pack') return `${safeCapacity.toLocaleString('id-ID')} pcs / pack`;
	return `${safeCapacity.toLocaleString('id-ID')} ${safeUnit}`;
}

