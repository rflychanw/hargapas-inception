import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyOtp } from '#lib/server/otpStore.ts';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const email = (body.email || '').trim().toLowerCase();
		const code = (body.code || '').trim();
		const purpose = (body.purpose || '').trim() || undefined;

		if (!email || !code) {
			return json(
				{ valid: false, message: 'Alamat email dan kode OTP wajib diisi.' },
				{ status: 400 }
			);
		}

		if (code.length !== 6 || !/^\d+$/.test(code)) {
			return json(
				{ valid: false, message: 'Kode OTP harus berupa 6 digit angka.' },
				{ status: 400 }
			);
		}

		const result = verifyOtp(email, code, purpose);
		if (!result.valid) {
			return json(
				{ valid: false, message: result.message || 'Kode OTP tidak valid.' },
				{ status: 400 }
			);
		}

		return json({
			valid: true,
			success: true,
			message: 'Kode OTP berhasil diverifikasi.'
		});
	} catch (error: any) {
		console.error('Error di endpoint verify-otp:', error);
		return json(
			{
				valid: false,
				message: error?.message || 'Terjadi kesalahan server saat memverifikasi kode OTP.'
			},
			{ status: 500 }
		);
	}
};
