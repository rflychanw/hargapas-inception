export const initialMenuItems = [
	{
		id: 'm1',
		name: 'Sate ayam 10 tusuk',
		category: 'Makanan Utama',
		price: 28000,
		hpp: {
			bahan: 14000,
			kemasan: 1000,
			energi: 1600,
			tenaga: 2200,
			susut: 800
		},
		monthlySales: 420
	},
	{
		id: 'm2',
		name: 'Ayam geprek',
		category: 'Makanan Utama',
		price: 21000,
		hpp: {
			bahan: 9200,
			kemasan: 800,
			energi: 1000,
			tenaga: 1300,
			susut: 500
		},
		monthlySales: 510
	},
	{
		id: 'm3',
		name: 'Nasi goreng telur balado',
		category: 'Makanan Utama',
		price: 18500,
		hpp: {
			bahan: 6200,
			kemasan: 800,
			energi: 1000,
			tenaga: 1500,
			susut: 500
		},
		monthlySales: 630
	},
	{
		id: 'm4',
		name: 'Tahu tempe',
		category: 'Lauk Pendamping',
		price: 12000,
		hpp: {
			bahan: 3800,
			kemasan: 500,
			energi: 700,
			tenaga: 1000,
			susut: 300
		},
		monthlySales: 280
	},
	{
		id: 'm5',
		name: 'Mie goreng',
		category: 'Makanan Utama',
		price: 17000,
		hpp: {
			bahan: 5500,
			kemasan: 800,
			energi: 900,
			tenaga: 1200,
			susut: 500
		},
		monthlySales: 340
	},
	{
		id: 'm6',
		name: 'Kopi susu',
		category: 'Minuman',
		price: 18000,
		hpp: {
			bahan: 4800,
			kemasan: 1200,
			energi: 400,
			tenaga: 800,
			susut: 200
		},
		monthlySales: 480
	},
	{
		id: 'm7',
		name: 'Pisang goreng',
		category: 'Camilan',
		price: 10000,
		hpp: {
			bahan: 2400,
			kemasan: 400,
			energi: 500,
			tenaga: 600,
			susut: 200
		},
		monthlySales: 310
	},
	{
		id: 'm8',
		name: 'Es teh',
		category: 'Minuman',
		price: 6000,
		hpp: {
			bahan: 700,
			kemasan: 600,
			energi: 100,
			tenaga: 200,
			susut: 100
		},
		monthlySales: 890
	}
];

/** @param {{ bahan: number, kemasan: number, energi: number, tenaga: number, susut: number }} h */
export function calcHppTotal(h) {
	return (h.bahan || 0) + (h.kemasan || 0) + (h.energi || 0) + (h.tenaga || 0) + (h.susut || 0);
}

/**
 * @param {number} price
 * @param {number} totalHpp
 */
export function calcMargin(price, totalHpp) {
	if (!price || price <= 0) return 0;
	return ((price - totalHpp) / price) * 100;
}

export const initialAiChat = [
	{
		id: 'c1',
		sender: 'ai',
		time: '10:14',
		text: 'Halo Bu Sirep! Saya sudah memindai 8 menu aktif di Warung Bu Sirep. Ada 2 menu yang marginnya di bawah batas aman 40%: **Sate ayam 10 tusuk (30.0%)** dan **Ayam geprek (39.0%)**.',
		recommendations: [
			{
				title: 'Naikkan harga Sate Ayam ke Rp 31.000',
				reason: 'Margin melonjak dari 30.0% menjadi 36.8%, menambah estimasi laba Rp 1.260.000/bulan.',
				actionLabel: 'Terapkan Rekomendasi Ini',
				menuId: 'm1',
				newPrice: 31000
			},
			{
				title: 'Paket Bundling Ayam Geprek + Es Teh seharga Rp 25.000',
				reason: 'Total HPP paket Rp 14.500, menghasilkan margin 42.0% dengan memanfaatkan margin Es Teh yang tebal (71.7%).',
				actionLabel: 'Buat Paket Bundling',
				menuId: 'm2'
			}
		]
	}
];

