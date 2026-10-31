/**
 * HargaPas Authentication Module (Uji Coba & Registrasi Akun)
 * Mendukung autentikasi berbasis localStorage untuk pengujian dan pendaftaran akun baru.
 *
 * @typedef {Object} UserProfile
 * @property {string} name
 * @property {string} email
 * @property {string} role
 * @property {string} avatarText
 * @property {string} storeName
 * @property {number} targetMargin
 */

export const DEMO_ACCOUNTS = [
	{
		username: 'bu.sirep@hargapas.id',
		aliases: ['busirep', 'bu.sirep'],
		password: 'warung123',
		profile: {
			name: 'Bu Sirep',
			email: 'bu.sirep@hargapas.id',
			role: 'Pemilik Warung',
			avatarText: 'BS',
			storeName: 'Warkop Ceria Bingit',
			targetMargin: 30
		}
	},
	{
		username: 'admin',
		aliases: ['admin@hargapas.id'],
		password: 'admin123',
		profile: {
			name: 'Administrator',
			email: 'admin@hargapas.id',
			role: 'Super Admin',
			avatarText: 'AD',
			storeName: 'Kopi Kenangan Pahit',
			targetMargin: 40
		}
	}
];

const AUTH_STORAGE_KEY = 'hargapas_auth_session';
const REGISTERED_USERS_KEY = 'hargapas_registered_users';

/**
 * Mengambil daftar pengguna terdaftar dari localStorage
 * @returns {Array<{ username: string; aliases: string[]; password: string; profile: UserProfile }>}
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
 * Mendaftarkan akun pengguna baru beserta target keuntungan warung
 * @param {{ name: string; email: string; password: string; storeName: string; targetMargin: number }} data
 * @returns {{ success: boolean; error?: string; profile?: UserProfile }}
 */
export function registerUser({ name, email, password, storeName, targetMargin }) {
	const cleanName = (name || '').trim();
	const cleanEmail = (email || '').trim().toLowerCase();
	const cleanPass = (password || '').trim();
	const cleanStore = (storeName || '').trim() || 'Warung Kuliner';
	const marginVal = Number(targetMargin) || 30;

	if (!cleanName || !cleanEmail || !cleanPass) {
		return { success: false, error: 'Nama, email, dan kata sandi wajib diisi.' };
	}

	// Cek apakah email sudah terdaftar di demo accounts
	const existsInDemo = DEMO_ACCOUNTS.some(
		(acc) => acc.username.toLowerCase() === cleanEmail || acc.aliases.includes(cleanEmail)
	);
	if (existsInDemo) {
		return { success: false, error: 'Email/Username ini sudah terdaftar sebagai akun demo.' };
	}

	const existingList = getRegisteredUsers();
	const existsInCustom = existingList.some(
		(u) => u.username.toLowerCase() === cleanEmail || (u.profile && u.profile.email.toLowerCase() === cleanEmail)
	);
	if (existsInCustom) {
		return { success: false, error: 'Email ini sudah terdaftar. Silakan masuk di halaman login.' };
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
		targetMargin: marginVal
	};

	const newUser = {
		username: cleanEmail,
		aliases: [cleanName.toLowerCase().replace(/\s+/g, '')],
		password: cleanPass,
		profile: newProfile
	};

	const updatedList = [...existingList, newUser];
	if (typeof window !== 'undefined') {
		try {
			localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedList));
		} catch (e) {
			console.warn('Gagal menyimpan pengguna baru ke localStorage', e);
		}
	}

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
 * Validasi kredensial login (Demo accounts + Registered users)
 * @param {string} identifier
 * @param {string} pass
 * @returns {UserProfile | null}
 */
export function authenticate(identifier, pass) {
	const cleanId = (identifier || '').trim().toLowerCase();
	const cleanPass = (pass || '').trim();

	// 1. Cek Demo Accounts
	let account = DEMO_ACCOUNTS.find(
		(acc) =>
			(acc.username.toLowerCase() === cleanId || acc.aliases.some((a) => a.toLowerCase() === cleanId)) &&
			acc.password === cleanPass
	);

	// 2. Jika tidak ada di demo, cek Registered Users
	if (!account) {
		const customList = getRegisteredUsers();
		account = customList.find(
			(acc) =>
				(acc.username.toLowerCase() === cleanId ||
					(acc.aliases && acc.aliases.some((a) => a.toLowerCase() === cleanId)) ||
					(acc.profile && acc.profile.email.toLowerCase() === cleanId)) &&
				acc.password === cleanPass
		);
	}

	if (account) {
		const session = {
			...account.profile,
			token: 'demo-token-' + Date.now(),
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
