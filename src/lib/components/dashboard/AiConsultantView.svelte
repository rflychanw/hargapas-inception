<script lang="ts">
	import {
		initialAiThread,
		initialConsultationHistory,
		formatFigmaRupiah
	} from '#lib/dashboard-data.js';
	import type { MenuItem } from './HppModal.svelte';

	interface PromoPackage {
		id: string;
		badge: string;
		title: string;
		price: number;
		itemsText: string;
		quote: string;
		reason: string;
	}

	interface AiThread {
		id: string;
		prompt: string;
		date: string;
		analysis: string;
		priorityStep: string;
		promos: PromoPackage[];
	}

	interface HistoryEntry {
		id: string;
		prompt: string;
		date: string;
		summary: string;
		promoCount: number;
		thread: AiThread;
	}

	interface Props {
		items?: MenuItem[];
		initialPrompt?: string;
	}

	let { items = [], initialPrompt = '' }: Props = $props();

	let mode = $state<'chat' | 'history'>('chat');
	let activeThread = $state<AiThread>(initialAiThread);
	let historyList = $state<HistoryEntry[]>(initialConsultationHistory);
	let userInput = $state('');
	let copiedId = $state<string | null>(null);

	$effect(() => {
		if (initialPrompt && initialPrompt.trim()) {
			handleSendCustom(initialPrompt.trim());
		}
	});

	function handleCopyPromo(promo: PromoPackage) {
		const text = `${promo.title} - ${formatFigmaRupiah(promo.price)} (${promo.itemsText})\n${promo.quote}`;
		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			navigator.clipboard.writeText(text).catch(() => {});
		}
		copiedId = promo.id;
		setTimeout(() => {
			if (copiedId === promo.id) copiedId = null;
		}, 1800);
	}

	function handleSendCustom(queryText: string) {
		const q = queryText.trim();
		if (!q) return;

		const now = new Date();
		const dateStr =
			now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) +
			', ' +
			now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

		const lower = q.toLowerCase();
		let newThread: AiThread;

		if (lower.includes('ayam') || lower.includes('geprek')) {
			newThread = {
				id: `c-${Date.now()}`,
				prompt: q,
				date: dateStr,
				analysis:
					'Ayam Geprek Anda memiliki margin sehat 47.8% (HPP Rp 6.270 dari harga jual Rp 12.000). Menu ini sangat cocok dijadikan jangkar paket makan hemat bersama minuman.',
				priorityStep:
					'Tawarkan upsell Es Teh Jumbo hanya tambah Rp 3.500 setiap pembelian Ayam Geprek untuk mendongkrak laba bersih per transaksi.',
				promos: [
					{
						id: `p-${Date.now()}-1`,
						badge: 'Pilihan #1',
						title: 'Paket Geprek Puas',
						price: 15500,
						itemsText: 'Ayam Geprek • Es Teh Jumbo',
						quote: '“Pedas Mantap, Segar Ukuran Jumbo!”',
						reason:
							'Menggabungkan menu favorit Ayam Geprek dengan Es Teh Jumbo bermargin 60% untuk memaksimalkan laba kotor.'
					},
					{
						id: `p-${Date.now()}-2`,
						badge: 'Pilihan #2',
						title: 'Paket Geprek Hemat',
						price: 13500,
						itemsText: 'Ayam Geprek • Es Teh',
						quote: '“Kenyang Hemat Setiap Hari”',
						reason:
							'Harga psikologis di bawah Rp 15.000 sangat efektif menarik pelanggan pelajar dan pekerja.'
					}
				]
			};
		} else {
			newThread = {
				id: `c-${Date.now()}`,
				prompt: q,
				date: dateStr,
				analysis:
					'Berdasarkan komposisi HPP warung Anda saat ini, seluruh menu utama berada di atas target margin 30%. Strategi terbaik adalah mengombinasikan lauk utama dengan minuman bermargin 60%.',
				priorityStep:
					'Buat papan menu kecil di meja yang menampilkan paket bundling untuk meningkatkan Average Order Value.',
				promos: [
					{
						id: `p-${Date.now()}-1`,
						badge: 'Pilihan #1',
						title: 'Paket Kenyang Mantap',
						price: 18000,
						itemsText: 'Dendeng • Es Teh Jumbo',
						quote: '“Kombinasi Gurih & Segar, Perut Kenyang Hati Senang!”',
						reason:
							'Menggabungkan dua produk Star untuk memaksimalkan volume penjualan dengan harga yang tetap kompetitif bagi pelanggan.'
					},
					{
						id: `p-${Date.now()}-2`,
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
		}

		activeThread = newThread;
		historyList = [
			{
				id: `h-${Date.now()}`,
				prompt: `“${q}”`,
				date: dateStr,
				summary: newThread.priorityStep,
				promoCount: newThread.promos.length,
				thread: newThread
			},
			...historyList
		];
		userInput = '';
		mode = 'chat';
	}

	function handleFormSubmit(e: SubmitEvent) {
		e.preventDefault();
		handleSendCustom(userInput);
	}

	function selectHistoryItem(entry: HistoryEntry) {
		activeThread = entry.thread;
		mode = 'chat';
	}

	function clearAllHistory() {
		historyList = [];
	}
</script>

<div class="hp-consult-shell" data-reveal>
	<!-- Konsultan Top Header -->
	<header class="hp-consult-head">
		<div class="hp-consult-head__left">
			<div class="hp-consult-badge" aria-hidden="true">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72" />
					<path d="m14 7 3 3" />
					<path d="M5 6v4" />
					<path d="M19 14v4" />
					<path d="M10 2v2" />
					<path d="M7 8H3" />
					<path d="M21 16h-4" />
					<path d="M11 3H9" />
				</svg>
			</div>
			<div>
				<h1 class="hp-consult-head__title">Konsultan Bisnis AI</h1>
				<p class="hp-consult-head__sub">Diskusi strategi margin & racikan promo otomatis.</p>
			</div>
		</div>

		{#if mode === 'chat'}
			<button
				type="button"
				class="hp-btn-outline hp-btn-outline--sm"
				onclick={() => (mode = 'history')}
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
					<path d="M3 3v5h5" />
					<path d="M12 7v5l4 2" />
				</svg>
				<span>Riwayat ({historyList.length})</span>
			</button>
		{:else}
			<button
				type="button"
				class="hp-btn-outline hp-btn-outline--sm"
				onclick={() => (mode = 'chat')}
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
					<line x1="18" x2="6" y1="6" y2="18" />
					<line x1="6" x2="18" y1="6" y2="18" />
				</svg>
				<span>Ke Chat</span>
			</button>
		{/if}
	</header>

	<!-- CHAT VIEW CONTAINER -->
	<div class="hp-consult-body" class:hp-hidden={mode !== 'chat'}>
		<!-- User Prompt Bubble -->
		<div class="hp-user-bubble-row">
			<div class="hp-user-bubble">
				{activeThread.prompt}
			</div>
		</div>

		<!-- AI Response Thread -->
		<div class="hp-ai-response">
			<div class="hp-ai-avatar" aria-hidden="true">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M12 2v4" />
					<path d="m16.2 7.8 2.9-2.9" />
					<path d="M18 12h4" />
					<path d="m16.2 16.2 2.9 2.9" />
					<path d="M12 18v4" />
					<path d="m4.9 19.1 2.9-2.9" />
					<path d="M2 12h4" />
					<path d="m4.9 4.9 2.9 2.9" />
				</svg>
			</div>

			<div class="hp-ai-content">
				<p class="hp-ai-section-label">ANALISIS SITUASI</p>
				<p class="hp-ai-analysis-text">{activeThread.analysis}</p>

				<!-- Priority Step Callout -->
				<div class="hp-priority-box">
					<p class="hp-priority-box__tag">→ LANGKAH PRIORITAS UTAMA</p>
					<p class="hp-priority-box__text">{activeThread.priorityStep}</p>
				</div>

				<!-- Promo Packages -->
				<p class="hp-ai-section-label hp-ai-section-label--promo">
					<span>💡</span>
					<span>PILIHAN PAKET PROMO ({activeThread.promos.length})</span>
				</p>

				<div class="hp-promo-grid">
					{#each activeThread.promos as promo (promo.id)}
						<article class="hp-card hp-promo-card">
							<div class="hp-promo-card__top">
								<span class="hp-promo-badge">{promo.badge}</span>
								<button
									type="button"
									class="hp-copy-btn"
									onclick={() => handleCopyPromo(promo)}
								>
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
										<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
									</svg>
									<span>{copiedId === promo.id ? 'Tersalin!' : 'Salin Teks'}</span>
								</button>
							</div>

							<h3 class="hp-promo-card__title">{promo.title}</h3>

							<p class="hp-promo-card__price">
								<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
									<circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
								</svg>
								<span>{formatFigmaRupiah(promo.price)}</span>
							</p>

							<div class="hp-promo-card__items">{promo.itemsText}</div>

							<p class="hp-promo-card__quote">{promo.quote}</p>

							<p class="hp-promo-card__reason">
								<strong>Alasan:</strong> {promo.reason}
							</p>
						</article>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- Bottom Floating Input Bar (Hanya tampil di Chat mode) -->
	{#if mode === 'chat'}
		<form class="hp-chat-bar" onsubmit={handleFormSubmit}>
			<input
				type="text"
				class="hp-chat-bar__input"
				placeholder="Tulis kendala warungmu (misal: Cabai naik, stok lele banyak)..."
				bind:value={userInput}
			/>
			<button type="submit" class="hp-chat-bar__submit">
				Kirim
			</button>
		</form>
	{/if}

	<!-- HISTORY VIEW CONTAINER -->
	<div class="hp-history-body" class:hp-hidden={mode !== 'history'}>
		<div class="hp-history-subhead">
			<span class="hp-ai-section-label">RIWAYAT KONSULTASI</span>
			{#if historyList.length > 0}
				<button type="button" class="hp-btn-clear-history" onclick={clearAllHistory}>
					<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 6h18" />
						<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
						<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
					</svg>
					<span>Hapus Semua</span>
				</button>
			{/if}
		</div>

		{#if historyList.length === 0}
			<div class="hp-card hp-history-empty">
				<p>Belum ada riwayat konsultasi.</p>
			</div>
		{:else}
			<div class="hp-history-grid">
				{#each historyList as item (item.id)}
					<button
						type="button"
						class="hp-card hp-history-card"
						onclick={() => selectHistoryItem(item)}
					>
						<div class="hp-history-card__top">
							<span class="hp-history-card__prompt">{item.prompt}</span>
							<span class="hp-history-card__date-desktop">{item.date}</span>
						</div>
						<p class="hp-history-card__summary">{item.summary}</p>
						<div class="hp-history-card__foot">
							<span class="hp-history-card__tag">{item.promoCount} Paket Promo</span>
							<span class="hp-history-card__date-mobile">{item.date}</span>
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.hp-hidden {
		display: none !important;
	}
</style>
