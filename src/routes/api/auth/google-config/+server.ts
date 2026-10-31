import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	let clientId = process.env.PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;

	// Baca langsung dari file .env jika ada perubahan tanpa restart
	if (!clientId) {
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
					if ((key === 'PUBLIC_GOOGLE_CLIENT_ID' || key === 'GOOGLE_CLIENT_ID') && val) {
						clientId = val;
						break;
					}
				}
			}
		} catch (e) {
			// ignore file read error
		}
	}

	return json({
		clientId: clientId || '',
		isConfigured: Boolean(clientId)
	});
};

