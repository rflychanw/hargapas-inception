export const initialStores = [
	{
		id: 'c8d0975d-1a2b-4c3d-9e8f-112233445566',
		shortId: 'c8d0975d...',
		name: 'Kopi Kenangan Pahit',
		targetMargin: 40
	},
	{
		id: '4dad1268-5e6f-7a8b-9c0d-223344556677',
		shortId: '4dad1268...',
		name: 'Warmindo Tunjungan',
		targetMargin: 25
	},
	{
		id: 'e11c6a9e-9b0c-1d2e-3f4a-334455667788',
		shortId: 'e11c6a9e...',
		name: 'Warkop Ceria Bingit',
		targetMargin: 30
	}
];

export const initialMenuItems = [
	{
		id: 'm1',
		name: 'Ayam Geprek',
		category: 'MAKANAN',
		price: 12000,
		hppCost: 6270,
		recipeCount: 1,
		recipe: [
			{ ingredientId: 'i1', name: 'Ayam Mentah', qty: 165, unit: 'gram', cost: 6270 }
		],
		hpp: {
			bahan: 6270,
			kemasan: 0,
			energi: 0,
			tenaga: 0,
			susut: 0
		}
	},
	{
		id: 'm2',
		name: 'Dendeng',
		category: 'MAKANAN',
		price: 15000,
		hppCost: 9100,
		recipeCount: 3,
		recipe: [
			{ ingredientId: 'i3', name: 'Daging Sapi', qty: 50, unit: 'gram', cost: 7500 },
			{ ingredientId: 'i2', name: 'Cabe Merah Besar', qty: 20, unit: 'gram', cost: 1200 },
			{ ingredientId: 'i4', name: 'Es / Bumbu', qty: 1, unit: 'pcs', cost: 400 }
		],
		hpp: {
			bahan: 9100,
			kemasan: 0,
			energi: 0,
			tenaga: 0,
			susut: 0
		}
	},
	{
		id: 'm3',
		name: 'Es Teh',
		category: 'MINUMAN',
		price: 2000,
		hppCost: 800,
		recipeCount: 2,
		recipe: [
			{ ingredientId: 'i6', name: 'Teh Tubruk', qty: 1, unit: 'pcs', cost: 400 },
			{ ingredientId: 'i4', name: 'Es', qty: 1, unit: 'pcs', cost: 400 }
		],
		hpp: {
			bahan: 800,
			kemasan: 0,
			energi: 0,
			tenaga: 0,
			susut: 0
		}
	},
	{
		id: 'm4',
		name: 'Es Teh Jumbo',
		category: 'MINUMAN',
		price: 5000,
		hppCost: 2000,
		recipeCount: 2,
		recipe: [
			{ ingredientId: 'i6', name: 'Teh Tubruk', qty: 2.5, unit: 'pcs', cost: 1000 },
			{ ingredientId: 'i4', name: 'Es', qty: 2.5, unit: 'pcs', cost: 1000 }
		],
		hpp: {
			bahan: 2000,
			kemasan: 0,
			energi: 0,
			tenaga: 0,
			susut: 0
		}
	}
];

export const initialIngredients = [
	{
		id: 'i1',
		name: 'Ayam Mentah',
		buyPrice: 38000,
		capacity: 1000,
		baseUnit: 'gram',
		buyUnit: 'kg',
		unitCost: 38
	},
	{
		id: 'i2',
		name: 'Cabe Merah Besar',
		buyPrice: 60000,
		capacity: 1000,
		baseUnit: 'gram',
		buyUnit: 'kg',
		unitCost: 60
	},
	{
		id: 'i3',
		name: 'Daging Sapi',
		buyPrice: 150000,
		capacity: 1000,
		baseUnit: 'gram',
		buyUnit: 'kg',
		unitCost: 150
	},
	{
		id: 'i4',
		name: 'Es',
		buyPrice: 20000,
		capacity: 50,
		baseUnit: 'pcs',
		buyUnit: 'pack',
		unitCost: 400
	},
	{
		id: 'i5',
		name: 'Kecap Bango',
		buyPrice: 10000,
		capacity: 1,
		baseUnit: 'pcs',
		buyUnit: 'pack',
		unitCost: 10000
	},
	{
		id: 'i6',
		name: 'Teh Tubruk',
		buyPrice: 20000,
		capacity: 50,
		baseUnit: 'pcs',
		buyUnit: 'pack',
		unitCost: 400
	}
];

export const initialAiThread = {
	id: 'c1',
	prompt: 'kalo untuk dendeng gimana',
	date: '18 Okt, 17:32',
	analysis:
		'Dendeng Anda sudah memiliki status Star dengan margin yang sehat. Mari kita buat paket bundling agar menu ini lebih sering dipesan bersama minuman.',
	priorityStep:
		'Buat papan menu kecil di meja yang menampilkan paket bundling Dendeng untuk meningkatkan Average Order Value.',
	promos: [
		{
			id: 'p1',
			badge: 'Pilihan #1',
			title: 'Paket Kenyang Mantap',
			price: 18000,
			itemsText: 'Dendeng • Es Teh Jumbo',
			quote: '“Kombinasi Gurih & Segar, Perut Kenyang Hati Senang!”',
			reason:
				'Menggabungkan dua produk Star untuk memaksimalkan volume penjualan dengan harga yang tetap kompetitif bagi pelanggan.'
		},
		{
			id: 'p2',
			badge: 'Pilihan #2',
			title: 'Paket Hemat Ceria',
			price: 16000,
			itemsText: 'Dendeng • Es Teh',
			quote: '“Makan Enak Gak Pakai Mahal”',
			reason:
				'Menggabungkan dua produk Star untuk memaksimalkan volume penjualan dengan harga yang tetap kompetitif bagi pelanggan.'
		}
	]
};

export const initialConsultationHistory = [
	{
		id: 'h1',
		prompt: '“kalo untuk dendeng gimana”',
		date: '18 Okt, 17:32',
		summary:
			'Buat papan menu kecil di meja yang menampilkan paket bundling Dendeng untuk meningkatkan Average Order...',
		promoCount: 2,
		thread: initialAiThread
	},
	{
		id: 'h2',
		prompt: '“kasih aku saran bundling dong untuk si...”',
		date: '10 Okt, 12:13',
		summary:
			'Buat visual sederhana untuk paket bundling ini dan pajang tepat di area pemesanan atau status WhatsApp hari ini.',
		promoCount: 2,
		thread: {
			id: 'c2',
			prompt: 'kasih aku saran bundling dong untuk siang hari',
			date: '10 Okt, 12:13',
			analysis:
				'Ayam Geprek dan Es Teh memiliki margin rata-rata di atas 50%. Bundling makan siang akan mempercepat perputaran meja di jam sibuk.',
			priorityStep:
				'Buat visual sederhana untuk paket bundling ini dan pajang tepat di area pemesanan atau status WhatsApp hari ini.',
			promos: [
				{
					id: 'p3',
					badge: 'Pilihan #1',
					title: 'Paket Siang Juara',
					price: 13500,
					itemsText: 'Ayam Geprek • Es Teh',
					quote: '“Pedasnya Pas, Segarnya Puas!”',
					reason:
						'Menarik pelanggan jam makan siang dengan selisih hemat Rp 500 namun volume transaksi meningkat.'
				},
				{
					id: 'p4',
					badge: 'Pilihan #2',
					title: 'Paket Geprek Jumbo',
					price: 16000,
					itemsText: 'Ayam Geprek • Es Teh Jumbo',
					quote: '“Kenyang Maksimal Tanpa Bikin Kantong Jebol”',
					reason:
						'Meningkatkan penjualan Es Teh Jumbo yang memiliki margin 60%.'
				}
			]
		}
	}
];

/**
 * @param {{ bahan?: number; kemasan?: number; energi?: number; tenaga?: number; susut?: number } | number} hpp
 */
export function calcHppTotal(hpp) {
	if (typeof hpp === 'number') return hpp;
	if (!hpp) return 0;
	return (
		(hpp.bahan || 0) +
		(hpp.kemasan || 0) +
		(hpp.energi || 0) +
		(hpp.tenaga || 0) +
		(hpp.susut || 0)
	);
}

/**
 * @param {number} price
 * @param {number} totalHpp
 */
export function calcMargin(price, totalHpp) {
	if (!price || price <= 0) return 0;
	return ((price - totalHpp) / price) * 100;
}

/**
 * Format percentage matching Figma (e.g. 47.8%, 60%, 51.8%)
 * @param {number} val
 */
export function formatFigmaPercent(val) {
	const rounded = Math.round(val * 10) / 10;
	if (Number.isInteger(rounded)) return `${rounded}%`;
	return `${rounded.toFixed(1)}%`;
}

/**
 * Format Rupiah matching Figma (e.g. Rp 12.000, Rp 800)
 * @param {number} val
 */
export function formatFigmaRupiah(val) {
	return 'Rp ' + Math.round(val).toLocaleString('id-ID');
}
