const whole = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat('id-ID', {
	minimumFractionDigits: 1,
	maximumFractionDigits: 1
});

/** @param {number} value */
export const rupiah = (value) => `Rp ${whole.format(Math.round(value || 0))}`;
/** @param {number} value */
export const number = (value) => whole.format(Math.round(value || 0));
/** @param {number} value */
export const percent = (value) => `${oneDecimal.format(value || 0)}%`;
/** @param {number} value */
export const points = (value) => oneDecimal.format(Math.abs(value || 0));
/** @param {number} value */
export const signedRupiah = (value) =>
	`${value < 0 ? '\u2212' : '+'}${rupiah(Math.abs(value))}`;
