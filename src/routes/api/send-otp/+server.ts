import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import nodemailer from 'nodemailer';
import { setOtp } from '#lib/server/otpStore.ts';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const email = (body.email || '').trim().toLowerCase();
		const name = (body.name || '').trim() || 'Rekan Pemilik Usaha';
		const storeName = (body.storeName || '').trim() || 'Warung Kuliner';
		const purpose = (body.purpose || 'register').trim(); // 'register' | 'reset'

		if (!email || !email.includes('@')) {
			return json({ success: false, message: 'Alamat email tidak valid.' }, { status: 400 });
		}

		// Buat 6-digit kode OTP acak
		const code = Math.floor(100000 + Math.random() * 900000).toString();

		// Simpan kode OTP di memori server
		setOtp(email, code, purpose);

		let gmailUser = process.env.GMAIL_USER;
		let gmailPass = process.env.GMAIL_APP_PASSWORD;
		let smtpHost = process.env.SMTP_HOST;
		let smtpPort = Number(process.env.SMTP_PORT) || 587;
		let smtpUser = process.env.SMTP_USER;
		let smtpPass = process.env.SMTP_PASS;

		// Baca langsung dari file .env jika ada pembaruan
		try {
			const fs = await import('node:fs');
			const path = await import('node:path');
			const envPath = path.resolve(process.cwd(), '.env');
			if (fs.existsSync(envPath)) {
				const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
				for (const line of lines) {
					const trimmed = line.trim();
					if (trimmed.startsWith('#') || !trimmed.includes('=')) continue;
					const [k, ...vParts] = trimmed.split('=');
					const key = k.trim();
					const val = vParts.join('=').trim().replace(/^["']|["']$/g, '');
					if (key === 'GMAIL_USER' && val) gmailUser = val;
					if (key === 'GMAIL_APP_PASSWORD' && val) gmailPass = val;
					if (key === 'SMTP_HOST' && val) smtpHost = val;
					if (key === 'SMTP_PORT' && val) smtpPort = Number(val) || 587;
					if (key === 'SMTP_USER' && val) smtpUser = val;
					if (key === 'SMTP_PASS' && val) smtpPass = val;
				}
			}
		} catch (e) {
			// ignore file read error
		}

		let isSent = false;
		let smtpError = '';

		const isReset = purpose === 'reset';
		
		// Subjek yang dioptimalkan agar tidak masuk filter spam:
		// Nama brand di depan, tanpa angka acak telanjang di awal subjek
		const emailSubject = isReset
			? `[HargaPas] Kode Reset Kata Sandi Akun Anda: ${code}`
			: `[HargaPas] Kode Verifikasi Pendaftaran: ${code}`;

		const emailTitle = isReset ? 'Reset Kata Sandi Akun' : 'Verifikasi Akun Warung Anda';
		const emailGreeting = isReset
			? `Halo <strong>${name}</strong>,<br>Kami menerima permintaan untuk mengatur ulang kata sandi akun HargaPas Anda. Gunakan kode keamanan di bawah ini untuk melanjutkan:`
			: `Halo <strong>${name}</strong>,<br>Terima kasih telah mendaftar di HargaPas untuk usaha <strong>${storeName}</strong>. Masukkan kode verifikasi 6 digit berikut untuk mengaktifkan akun Anda:`;

		// Template HTML yang ramah anti-spam (memiliki preheader, table standard, dan footer kepatuhan email)
		const htmlTemplate = `<!DOCTYPE html>
<html lang="id">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${emailSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
	<!-- Hidden Preheader: Teks pratinjau di daftar inbox agar rapi dan tidak spam -->
	<div style="display: none; font-size: 1px; color: #f8fafc; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
		Kode keamanan Anda adalah ${code}. Berlaku selama 10 menit untuk akun HargaPas Anda.
	</div>

	<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 30px 15px;">
		<tr>
			<td align="center">
				<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
					<!-- Header Brand -->
					<tr>
						<td style="padding: 28px 24px 20px 24px; text-align: center; border-bottom: 1px solid #f1f5f9;">
							<span style="font-size: 26px; font-weight: 800; color: #111111; letter-spacing: -0.5px;">Harga<span style="color: #ff6b1a;">Pas</span></span>
							<p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Platform Manajemen HPP & Simulasi Usaha Kuliner</p>
						</td>
					</tr>

					<!-- Content Body -->
					<tr>
						<td style="padding: 28px 24px;">
							<h1 style="margin: 0 0 14px 0; font-size: 18px; font-weight: 700; color: #0f172a; text-align: center;">${emailTitle}</h1>
							<p style="margin: 0 0 22px 0; font-size: 14px; line-height: 1.6; color: #334155; text-align: center;">
								${emailGreeting}
							</p>

							<!-- Box Kode OTP -->
							<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 22px;">
								<tr>
									<td align="center" style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 18px 20px;">
										<div style="font-size: 11px; font-weight: 700; color: #ea580c; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Kode Keamanan 6 Digit</div>
										<div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; color: #c2410c; letter-spacing: 8px; padding-left: 8px;">
											${code}
										</div>
										<div style="margin-top: 8px; font-size: 12px; color: #9a3412;">
											Berlaku selama <strong>10 menit</strong> ke depan
										</div>
									</td>
								</tr>
							</table>

							<p style="margin: 0 0 12px 0; font-size: 12.5px; line-height: 1.5; color: #64748b; text-align: center;">
								Demi keamanan akun warung Anda, mohon <strong>jangan berikan kode ini kepada siapa pun</strong>, termasuk pihak yang mengatasnamakan HargaPas.
							</p>
						</td>
					</tr>

					<!-- Footer Kepatuhan Email (CAN-SPAM / Google Guidelines) -->
					<tr>
						<td style="background-color: #f8fafc; padding: 20px 24px; text-align: center; border-top: 1px solid #f1f5f9;">
							<p style="margin: 0 0 6px 0; font-size: 11.5px; color: #64748b; line-height: 1.4;">
								Anda menerima email ini karena adanya permintaan pendaftaran/pemulihan akun dengan alamat email ini di HargaPas.
							</p>
							<p style="margin: 0; font-size: 11px; color: #94a3b8;">
								&copy; ${new Date().getFullYear()} HargaPas Indonesia &bull; Decision Engine UMKM Kuliner
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>`;

		// Teks alternatif plain-text untuk keselarasan 1:1 (mencegah penalti spam filter)
		const plainText = `Halo ${name},\n\n` +
			`Berikut adalah kode verifikasi akun HargaPas Anda untuk ${storeName}:\n\n` +
			`KODE VERIFIKASI: ${code}\n\n` +
			`Kode ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapa pun demi keamanan akun Anda.\n\n` +
			`Jika Anda tidak merasa mendaftar di HargaPas, abaikan email ini.\n\n` +
			`Salam,\nTim HargaPas Indonesia\nPlatform Manajemen HPP & Simulasi Usaha Kuliner`;

		// Kirim via Gmail SMTP
		if (gmailUser && gmailPass) {
			try {
				const transporter = nodemailer.createTransport({
					service: 'gmail',
					auth: {
						user: gmailUser,
						pass: gmailPass.replace(/\s+/g, '') // hilangkan spasi pada sandi aplikasi
					}
				});

				await transporter.sendMail({
					from: `"HargaPas" <${gmailUser}>`,
					to: email,
					replyTo: gmailUser,
					subject: emailSubject,
					text: plainText,
					html: htmlTemplate,
					headers: {
						'X-Priority': '1',
						'X-MSMail-Priority': 'High',
						'Importance': 'high',
						'X-Auto-Response-Suppress': 'OOF, AutoReply',
						'Feedback-ID': 'otp:hargapas:transactional'
					}
				});
				isSent = true;
			} catch (err: any) {
				console.error('Gagal mengirim email via Gmail SMTP:', err);
				smtpError = err?.message || 'Error autentikasi Gmail SMTP';
			}
		} else if (smtpHost && smtpUser && smtpPass) {
			try {
				const transporter = nodemailer.createTransport({
					host: smtpHost,
					port: smtpPort,
					secure: smtpPort === 465,
					auth: {
						user: smtpUser,
						pass: smtpPass
					}
				});

				await transporter.sendMail({
					from: `"HargaPas" <${smtpUser}>`,
					to: email,
					replyTo: smtpUser,
					subject: emailSubject,
					text: plainText,
					html: htmlTemplate,
					headers: {
						'X-Priority': '1',
						'X-MSMail-Priority': 'High',
						'Importance': 'high'
					}
				});
				isSent = true;
			} catch (err: any) {
				console.error('Gagal mengirim email via custom SMTP:', err);
				smtpError = err?.message || 'Error pengiriman SMTP';
			}
		}

		if (!isSent) {
			return json(
				{
					success: false,
					message: smtpError
						? `Gagal mengirim email ke ${email} (${smtpError}). Pastikan email dan 16-digit App Password di .env sudah benar.`
						: 'Konfigurasi Gmail belum lengkap di file .env. Pastikan GMAIL_USER dan GMAIL_APP_PASSWORD sudah terisi.'
				},
				{ status: 400 }
			);
		}

		return json({
			success: true,
			message: `Kode verifikasi 6-digit telah berhasil dikirim ke alamat email ${email}. Cek kotak masuk atau folder spam!`
		});
	} catch (error: any) {
		console.error('Error di endpoint send-otp:', error);
		return json(
			{
				success: false,
				message: error?.message || 'Terjadi kesalahan server saat memproses kode OTP.'
			},
			{ status: 500 }
		);
	}
};
