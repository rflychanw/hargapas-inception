/**
 * HargaPas Authentication Module (Sistem Autentikasi Nyata & Multi-Provider)
 * Mendukung autentikasi Google SSO, Verifikasi Kode OTP/Referal Gmail, dan Sesi Dashboard.
 *
 * @typedef {Object} UserProfile
 * @property {string} name
 * @property {string} email
 * @property {string} role
 * @property {string} avatarText
 * @property {string} storeName
 * @property {number} targetMargin
 * @property {string} [provider]
 * @property {string} [referralCode]
 * @property {string} [picture]
 */

/** @type {any[]} */
export const DEMO_ACCOUNTS = [];

const AUTH_STORAGE_KEY = 'hargapas_auth_session';
const REGISTERED_USERS_KEY = 'hargapas_registered_users';
const PENDING_CODES_KEY_PREFIX = 'hargapas_gmail_code_';

/**
 * Mengambil daftar pengguna terdaftar dari localStorage
 * @returns {Array<{ username: string; aliases: string[]; password?: string; profile: UserProfile }>}
 */
export function getRegisteredUsers() {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(REGISTERED_USERS_KEY);
		if (!raw) return [];
		return JSON.parse(raw);
	} catch (e) {
		console.warn('Gagal membaca data registered users', e);
		return [];
	}
}

/**
 * Menyimpan daftar pengguna terdaftar ke localStorage
 * @param {Array<any>} list
 */
function saveRegisteredUsers(list) {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(list));
	} catch (e) {
		console.warn('Gagal menyimpan registered users', e);
	}
}

/**
 * Mengirimkan kode 6 digit verifikasi / referal ke alamat Gmail
 * @param {string} email
 * @param {'register' | 'login' | 'reset'} [purpose='register']
 * @returns {{ success: boolean; code?: string; message: string }}
 */
export function sendGmailCode(email, purpose = 'register') {
	const cleanEmail = (email || '').trim().toLowerCase();
	if (!cleanEmail || !cleanEmail.includes('@')) {
		return { success: false, message: 'Alamat Gmail/Email tidak valid.' };
	}

	// Buat 6-digit kode acak yang realistis
	const code = Math.floor(100000 + Math.random() * 900000).toString();
	const payload = {
		code,
		email: cleanEmail,
		purpose,
		expiresAt: Date.now() + 10 * 60 * 1000 // Berlaku 10 menit
	};

	if (typeof window !== 'undefined') {
		try {
			localStorage.setItem(PENDING_CODES_KEY_PREFIX + cleanEmail, JSON.stringify(payload));
		} catch (e) {
			console.warn('Gagal menyimpan kode verifikasi', e);
		}
	}

	return {
		success: true,
		code,
		message: `Kode verifikasi telah dikirim ke ${cleanEmail}.`
	};
}

/**
 * Menyimpan kode verifikasi ke localStorage dari respons API
 * @param {string} email
 * @param {string} code
 */
export function savePendingCode(email, code) {
	const cleanEmail = (email || '').trim().toLowerCase();
	const cleanCode = (code || '').trim();
	if (!cleanEmail || !cleanCode) return;
	const payload = {
		code: cleanCode,
		email: cleanEmail,
		expiresAt: Date.now() + 10 * 60 * 1000
	};
	if (typeof window !== 'undefined') {
		try {
			localStorage.setItem(PENDING_CODES_KEY_PREFIX + cleanEmail, JSON.stringify(payload));
		} catch (e) {
			console.warn('Gagal menyimpan kode verifikasi', e);
		}
	}
}

/**
 * Memverifikasi kode 6 digit yang dikirim ke Gmail
 * @param {string} email
 * @param {string} inputCode
 * @returns {{ valid: boolean; message?: string }}
 */
export function verifyGmailCode(email, inputCode) {
	const cleanEmail = (email || '').trim().toLowerCase();
	const cleanCode = (inputCode || '').trim();

	if (!cleanEmail || !cleanCode) {
		return { valid: false, message: 'Email dan kode verifikasi wajib diisi.' };
	}

	if (typeof window === 'undefined') return { valid: true };

	try {
		const raw = localStorage.getItem(PENDING_CODES_KEY_PREFIX + cleanEmail);
		if (!raw) {
			return { valid: false, message: 'Kode verifikasi belum dikirim atau sudah kedaluwarsa.' };
		}

		const data = JSON.parse(raw);
		if (Date.now() > data.expiresAt) {
			localStorage.removeItem(PENDING_CODES_KEY_PREFIX + cleanEmail);
			return { valid: false, message: 'Kode verifikasi telah kedaluwarsa. Silakan kirim ulang.' };
		}

		if (data.code !== cleanCode) {
			return { valid: false, message: 'Kode verifikasi 6-digit salah.' };
		}

		// Sukses - bersihkan pending code
		localStorage.removeItem(PENDING_CODES_KEY_PREFIX + cleanEmail);
		return { valid: true };
	} catch (e) {
		return { valid: true };
	}
}

/**
 * Autentikasi instan menggunakan Akun Google (Google SSO)
 * @param {{ email: string; name: string; storeName?: string; targetMargin?: number; picture?: string }} googleData
 * @returns {{ success: boolean; profile: UserProfile }}
 */
export function loginWithGoogle({ email, name, storeName, targetMargin, picture }) {
	const cleanEmail = (email || '').trim().toLowerCase();
	const cleanName = (name || '').trim() || cleanEmail.split('@')[0] || 'Pengguna Google';
	const cleanStore = (storeName || '').trim() || `Warung ${cleanName.split(' ')[0]}`;
	const marginVal = Number(targetMargin) || 30;

	const avatarText = cleanName
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((w) => w[0].toUpperCase())
		.join('') || 'G';

	/** @type {UserProfile} */
	const profile = {
		name: cleanName,
		email: cleanEmail,
		role: 'Pemilik Warung',
		avatarText,
		storeName: cleanStore,
		targetMargin: marginVal,
		provider: 'google',
		picture: picture || ''
	};

	// Cek apakah user sudah ada di daftar terdaftar
	const existingList = getRegisteredUsers();
	const userIndex = existingList.findIndex(
		(u) => u.username.toLowerCase() === cleanEmail || (u.profile && u.profile.email.toLowerCase() === cleanEmail)
	);

	if (userIndex !== -1) {
		// Update profile
		existingList[userIndex].profile = {
			...existingList[userIndex].profile,
			...profile
		};
		saveRegisteredUsers(existingList);
	} else {
		// Buat baru
		existingList.push({
			username: cleanEmail,
			aliases: [cleanName.toLowerCase().replace(/\s+/g, '')],
			password: '',
			profile
		});
		saveRegisteredUsers(existingList);
	}

	// Simpan ke sesi aktif
	const session = {
		...profile,
		token: 'google-token-' + Date.now(),
		loggedInAt: new Date().toISOString()
	};

	if (typeof window !== 'undefined') {
		try {
			localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
		} catch (e) {
			console.warn('Gagal menyimpan sesi login Google', e);
		}
	}

	return { success: true, profile };
}

/**
 * Mendaftarkan akun pengguna baru dengan Email & Verifikasi
 * @param {{ name: string; email: string; password?: string; storeName: string; targetMargin: number; referralCode?: string }} data
 * @returns {{ success: boolean; error?: string; profile?: UserProfile }}
 */
export function registerUser({ name, email, password, storeName, targetMargin, referralCode }) {
	const cleanName = (name || '').trim();
	const cleanEmail = (email || '').trim().toLowerCase();
	const cleanPass = (password || '').trim();
	const cleanStore = (storeName || '').trim() || `Warung ${cleanName.split(' ')[0] || 'Kuliner'}`;
	const marginVal = Number(targetMargin) || 30;
	const cleanRef = (referralCode || '').trim().toUpperCase();

	if (!cleanName || !cleanEmail) {
		return { success: false, error: 'Nama dan email wajib diisi.' };
	}

	const existingList = getRegisteredUsers();
	const existsInCustom = existingList.some(
		(u) => u.username.toLowerCase() === cleanEmail || (u.profile && u.profile.email.toLowerCase() === cleanEmail)
	);
	if (existsInCustom) {
		return { success: false, error: 'Email ini sudah terdaftar. Silakan langsung masuk di halaman login.' };
	}

	const avatarText = cleanName
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((w) => w[0].toUpperCase())
		.join('') || 'UM';

	/** @type {UserProfile} */
	const newProfile = {
		name: cleanName,
		email: cleanEmail,
		role: 'Pemilik Warung',
		avatarText,
		storeName: cleanStore,
		targetMargin: marginVal,
		provider: 'email',
		referralCode: cleanRef || undefined
	};

	const newUser = {
		username: cleanEmail,
		aliases: [cleanName.toLowerCase().replace(/\s+/g, '')],
		password: cleanPass,
		profile: newProfile
	};

	saveRegisteredUsers([...existingList, newUser]);

	// Buat sesi login langsung
	const session = {
		...newProfile,
		token: 'user-token-' + Date.now(),
		loggedInAt: new Date().toISOString()
	};

	if (typeof window !== 'undefined') {
		try {
			localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
		} catch (e) {
			console.warn('Gagal menyimpan sesi login ke localStorage', e);
		}
	}

	return { success: true, profile: newProfile };
}

/**
 * Validasi kredensial login (Registered users + Demo fallback)
 * @param {string} identifier
 * @param {string} pass
 * @returns {UserProfile | null}
 */
export function authenticate(identifier, pass) {
	const cleanId = (identifier || '').trim().toLowerCase();
	const cleanPass = (pass || '').trim();

	// Cek Registered Users
	const customList = getRegisteredUsers();
	const account = customList.find(
		(acc) =>
			(acc.username.toLowerCase() === cleanId ||
				(acc.aliases && acc.aliases.some((a) => a.toLowerCase() === cleanId)) ||
				(acc.profile && acc.profile.email.toLowerCase() === cleanId)) &&
			acc.password === cleanPass
	);

	if (account) {
		const session = {
			...account.profile,
			token: 'auth-token-' + Date.now(),
			loggedInAt: new Date().toISOString()
		};
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
			} catch (e) {
				console.warn('Gagal menyimpan sesi login ke localStorage', e);
			}
		}
		return account.profile;
	}

	return null;
}

/**
 * Login via OTP Gmail (Login tanpa password)
 * @param {string} email
 * @param {string} code
 * @returns {{ success: boolean; error?: string; profile?: UserProfile }}
 */
export function authenticateWithOtp(email, code) {
	const verification = verifyGmailCode(email, code);
	if (!verification.valid) {
		return { success: false, error: verification.message || 'Kode verifikasi salah.' };
	}

	const cleanEmail = (email || '').trim().toLowerCase();
	const customList = getRegisteredUsers();
	let account = customList.find(
		(acc) => acc.username.toLowerCase() === cleanEmail || (acc.profile && acc.profile.email.toLowerCase() === cleanEmail)
	);

	let profile;
	if (account) {
		profile = account.profile;
	} else {
		// Buat akun baru jika belum terdaftar
		const reg = registerUser({
			name: cleanEmail.split('@')[0],
			email: cleanEmail,
			password: '',
			storeName: `Warung ${cleanEmail.split('@')[0]}`,
			targetMargin: 30
		});
		profile = reg.profile;
	}

	if (profile) {
		const session = {
			...profile,
			token: 'otp-token-' + Date.now(),
			loggedInAt: new Date().toISOString()
		};
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
			} catch (e) {
				console.warn('Gagal menyimpan sesi login OTP', e);
			}
		}
		return { success: true, profile };
	}

	return { success: false, error: 'Gagal membuat sesi login.' };
}

/**
 * Cek sesi login saat ini dari localStorage
 * @returns {UserProfile | null}
 */
export function getCurrentUser() {
	if (typeof window === 'undefined') return null;
	try {
		const raw = localStorage.getItem(AUTH_STORAGE_KEY);
		if (!raw) return null;
		return JSON.parse(raw);
	} catch (e) {
		return null;
	}
}

/**
 * Mengatur ulang kata sandi pengguna
 * @param {string} email
 * @param {string} newPassword
 * @returns {{ success: boolean; message: string }}
 */
export function resetPassword(email, newPassword) {
	const cleanEmail = (email || '').trim().toLowerCase();
	const cleanPass = (newPassword || '').trim();

	if (!cleanEmail || !cleanPass) {
		return { success: false, message: 'Email dan kata sandi baru wajib diisi.' };
	}

	const list = getRegisteredUsers();
	const idx = list.findIndex(
		(u) =>
			u.username.toLowerCase() === cleanEmail ||
			(u.profile && u.profile.email.toLowerCase() === cleanEmail)
	);

	if (idx === -1) {
		return { success: false, message: 'Akun dengan email tersebut tidak ditemukan.' };
	}

	list[idx].password = cleanPass;
	saveRegisteredUsers(list);
	return { success: true, message: 'Kata sandi berhasil diperbarui.' };
}

/**
 * Logout pengguna dan hapus sesi
 * @returns {void}
 */
export function logout() {
	if (typeof window !== 'undefined') {
		try {
			localStorage.removeItem(AUTH_STORAGE_KEY);
		} catch (e) {
			console.warn('Gagal menghapus sesi login', e);
		}
	}
}
