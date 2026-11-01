export const hpp = [
	{ label: 'Bahan baku', value: 6200, share: 62 },
	{ label: 'Kemasan', value: 800, share: 8 },
	{ label: 'Gas dan listrik', value: 1000, share: 10 },
	{ label: 'Tenaga kerja', value: 1500, share: 15 },
	{ label: 'Susut dan sisa', value: 500, share: 5 }
];

export const hppTotal = hpp.reduce((sum, row) => sum + row.value, 0);

export const menu = [
	{ name: 'Sate ayam 10 tusuk', hpp: 19600, price: 28000, margin: 30.0 },
	{ name: 'Ayam geprek', hpp: 12800, price: 21000, margin: 39.0 },
	{ name: 'Nasi goreng telur balado', hpp: 10000, price: 18500, margin: 45.9 },
	{ name: 'Tahu tempe', hpp: 6300, price: 12000, margin: 47.5 },
	{ name: 'Mie goreng', hpp: 8900, price: 17000, margin: 47.6 },
	{ name: 'Kopi susu', hpp: 7400, price: 18000, margin: 58.9 },
	{ name: 'Pisang goreng', hpp: 4100, price: 10000, margin: 59.0 },
	{ name: 'Es teh', hpp: 1700, price: 6000, margin: 71.7 }
];

export const planRows = [
	{ label: 'Menu aktif', coba: '3 menu', warung: '30 menu', dapur: 'Tanpa batas' },
	{
		label: 'Analisis HPP',
		coba: 'Satu menu',
		warung: 'Semua menu',
		dapur: 'Semua menu, riwayat 12 bulan'
	},
	{
		label: 'Konsultan AI',
		coba: '5 pertanyaan',
		warung: '100 pertanyaan',
		dapur: 'Tanpa batas'
	},
	{ label: 'Laporan', coba: 'Tidak termasuk', warung: 'PDF', dapur: 'PDF dan Excel' },
	{ label: 'Pengguna', coba: '1 orang', warung: '3 orang', dapur: '8 orang' }
];

export const plans = [
	{
		id: 'coba',
		name: 'Coba',
		price: 'Rp 0',
		period: 'selamanya',
		note: 'Untuk satu menu',
		action: 'Buka Dashboard',
		href: '/dashboard',
		recommended: false
	},
	{
		id: 'warung',
		name: 'Warung',
		price: 'Rp 99.000',
		period: 'per bulan',
		note: 'Untuk satu warung',
		action: 'Pilih Warung',
		href: 'mailto:halo@hargapas.id?subject=Paket%20Warung',
		recommended: true
	},
	{
		id: 'dapur',
		name: 'Dapur',
		price: 'Rp 249.000',
		period: 'per bulan',
		note: 'Untuk beberapa cabang',
		action: 'Hubungi kami',
		href: 'mailto:halo@hargapas.id?subject=Paket%20Dapur',
		recommended: false
	}
];

export const faqs = [
	{
		question: 'Apakah HPP dihitung otomatis?',
		answer:
			'Bahan, kemasan, gas, tenaga kerja, dan susut dijumlahkan. Anda bisa mengubah tiap komponen, lalu harga dan margin dihitung ulang saat itu juga.'
	},
	{
		question: 'Konsultan AI butuh data apa?',
		answer:
			'Cukup HPP dan harga jual. Kalau Anda mencatat jumlah piring terjual, rekomendasi promo memakai angka penjualan Anda, bukan rata-rata pasar.'
	},
	{
		question: 'Bagaimana kalau harga pasar murah?',
		answer:
			'HargaPas menunjukkan margin tiap menu, bukan memaksa semua harga naik. Menu bermargin tebal bisa menahan harga; menu tipis bisa dibundel atau diporsikan ulang.'
	}
];
