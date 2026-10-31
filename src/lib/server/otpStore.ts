interface OtpEntry {
	code: string;
	expiresAt: number;
	purpose: string;
}

// In-memory store untuk kode OTP aktif di level server
const otpMap = new Map<string, OtpEntry>();

/**
 * Menyimpan kode OTP untuk email tertentu
 * @param email Alamat email tujuan
 * @param code 6 digit kode OTP
 * @param purpose Tujuan OTP ('register' | 'reset')
 */
export function setOtp(email: string, code: string, purpose: string = 'register') {
	const cleanEmail = email.trim().toLowerCase();
	otpMap.set(cleanEmail, {
		code: code.trim(),
		expiresAt: Date.now() + 10 * 60 * 1000, // Berlaku 10 menit
		purpose
	});
}

/**
 * Memvalidasi kode OTP yang dimasukkan pengguna
 * @param email Alamat email pengguna
 * @param inputCode Kode OTP yang dimasukkan
 * @param purpose Tujuan OTP opsional ('register' | 'reset')
 */
export function verifyOtp(
	email: string,
	inputCode: string,
	purpose?: string
): { valid: boolean; message?: string } {
	const cleanEmail = email.trim().toLowerCase();
	const cleanCode = inputCode.trim();

	const entry = otpMap.get(cleanEmail);
	if (!entry) {
		return {
			valid: false,
			message: 'Kode verifikasi tidak ditemukan atau sudah kedaluwarsa. Silakan kirim ulang OTP.'
		};
	}

	if (Date.now() > entry.expiresAt) {
		otpMap.delete(cleanEmail);
		return {
			valid: false,
			message: 'Kode OTP telah kedaluwarsa. Silakan klik tombol kirim ulang OTP.'
		};
	}

	if (purpose && entry.purpose !== purpose) {
		return {
			valid: false,
			message: 'Tujuan kode verifikasi tidak valid.'
		};
	}

	if (entry.code !== cleanCode) {
		return {
			valid: false,
			message: 'Kode OTP yang Anda masukkan salah. Harap periksa email Anda kembali.'
		};
	}

	// Hapus kode setelah berhasil digunakan
	otpMap.delete(cleanEmail);
	return { valid: true };
}

/**
 * Menghapus kode OTP tersimpan untuk email tertentu
 */
export function clearOtp(email: string) {
	otpMap.delete(email.trim().toLowerCase());
}

