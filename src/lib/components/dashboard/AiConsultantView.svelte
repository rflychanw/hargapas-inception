<script lang="ts">
	import { initialAiChat } from '#lib/dashboard-data.js';
	import type { MenuItem } from './HppModal.svelte';

	interface Props {
		items?: MenuItem[];
		initialPrompt?: string;
		onapplyrecommendation?: (menuId: string, newPrice: number) => void;
	}

	let {
		items = [],
		initialPrompt = '',
		onapplyrecommendation = () => {}
	}: Props = $props();

	let messages = $state(initialAiChat);
	let userInput = $state('');
	let isAnalyzing = $state(false);

	$effect(() => {
		if (initialPrompt && initialPrompt !== userInput) {
			userInput = initialPrompt;
			sendQuestion(initialPrompt);
		}
	});

	const suggestions = [
		'Bagaimana cara menaikkan margin Ayam Geprek?',
		'Menu apa yang paling menghasilkan laba kotor?',
		'Apakah aman menaikkan harga Sate Ayam Rp 3.000?',
		'Buat paket hemat untuk menu makan siang'
	];

	function sendQuestion(text: string) {
		const q = text ? text.trim() : '';
		if (!q || isAnalyzing) return;

		const userMsg = {
			id: `u-${Date.now()}`,
			sender: 'user',
			time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
			text: q,
			recommendations: []
		};

		messages = [...messages, userMsg];
		userInput = '';
		isAnalyzing = true;

		setTimeout(() => {
			let responseText = '';
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			let recs: any[] = [];

			if (q.toLowerCase().includes('ayam geprek')) {
				responseText =
					'Untuk **Ayam Geprek** (HPP Rp 12.800, Harga Rp 21.000, Margin 39.0%):\nBiaya bahan baku (Rp 9.200) mendominasi 72% dari total HPP. Rekomendasi terbaik adalah mempertahankan harga Rp 21.000 namun tawarkan varian sambal level atau paket kombo dengan Es Teh Manis untuk mengerek margin gabungan ke 45%.';
				recs = [
					{
						title: 'Ubah Harga ke Rp 22.500',
						reason: 'Margin naik dari 39.0% ke 43.1%, aman tanpa resistensi pelanggan setia.',
						actionLabel: 'Terapkan Harga Rp 22.500',
						menuId: 'm2',
						newPrice: 22500
					}
				];
			} else if (q.toLowerCase().includes('sate ayam')) {
				responseText =
					'**Sate Ayam 10 tusuk** saat ini memiliki margin terendah (30.0%) karena biaya daging ayam segar (Rp 14.000) dan tenaga tusuk arang (Rp 2.200). Kenaikan harga menjadi Rp 31.000 akan mengembalikan laba warung ke tingkat sehat.';
				recs = [
					{
						title: 'Sesuaikan ke Rp 31.000',
						reason: 'Margin melompat ke 36.8%, menambah estimasi kas Rp 1.260.000 per bulan.',
						actionLabel: 'Terapkan Harga Rp 31.000',
						menuId: 'm1',
						newPrice: 31000
					}
				];
			} else if (q.toLowerCase().includes('laba kotor')) {
				responseText =
					'Berdasarkan volume penjualan sebulan, **Nasi Goreng Telur Balado** (Rp 18.500) dan **Es Teh** (Rp 6.000) adalah kontributor laba terbesar warung Bu Sirep karena kombinasi volume tinggi dan margin di atas 45%.';
			} else {
				responseText =
					`Saya telah memeriksa data 8 menu warung Anda terkait "${q}". Rekomendasi prioritas saat ini adalah menjaga keseimbangan: jangan menaikkan harga semua menu sekaligus. Cukup naikkan 1-2 menu yang marginnya tipis terlebih dahulu.`;
			}

			messages = [
				...messages,
				{
					id: `ai-${Date.now()}`,
					sender: 'ai',
					time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
					text: responseText,
					recommendations: recs
				}
			];
			isAnalyzing = false;
		}, 800);
	}
</script>

<div class="dash-view dash-ai-view">
	<header class="dash-topbar">
		<div>
			<div class="dash-ai-title-row">
				<h2 class="dash-topbar__title">Konsultan AI Warung</h2>
				<span class="dash-pill dash-pill--orange">Live AI Model</span>
			</div>
			<p class="dash-topbar__sub">
				Analisis cerdas struktur HPP dan simulasi dampak penyesuaian harga jual warung.
			</p>
		</div>
	</header>

	<div class="dash-ai-container">
		<!-- Chat History -->
		<div class="dash-chat-messages">
			{#each messages as msg (msg.id)}
				<div class="dash-chat-item" class:dash-chat-item--user={msg.sender === 'user'}>
					<div class="dash-chat-avatar" aria-hidden="true">
						{#if msg.sender === 'ai'}
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
								<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
							</svg>
						{:else}
							<span>BS</span>
						{/if}
					</div>

					<div class="dash-chat-bubble">
						<div class="dash-chat-bubble__meta">
							<strong>{msg.sender === 'ai' ? 'Konsultan HargaPas' : 'Bu Sirep (Pemilik Warung)'}</strong>
							<span>{msg.time}</span>
						</div>

						<p class="dash-chat-bubble__text">{msg.text}</p>

						<!-- Rekomendasi Taktis Sesuai Figma Prototype -->
						{#if msg.recommendations && msg.recommendations.length > 0}
							<div class="dash-ai-recs">
								{#each msg.recommendations as rec}
									<div class="dash-ai-rec-card">
										<div class="dash-ai-rec-card__top">
											<span class="dash-ai-rec-card__badge">Rekomendasi</span>
											<h4 class="dash-ai-rec-card__title">{rec.title}</h4>
										</div>
										<p class="dash-ai-rec-card__reason">{rec.reason}</p>

										{#if rec.newPrice && rec.menuId}
											<button
												type="button"
												class="dash-btn dash-btn--sm dash-btn--orange"
												onclick={() => onapplyrecommendation(rec.menuId, rec.newPrice)}
											>
												{rec.actionLabel}
											</button>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			{/each}

			{#if isAnalyzing}
				<div class="dash-chat-item">
					<div class="dash-chat-avatar" aria-hidden="true">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
						</svg>
					</div>
					<div class="dash-chat-bubble dash-chat-bubble--typing">
						<span>Menganalisis margin menu warung...</span>
					</div>
				</div>
			{/if}
		</div>

		<!-- Pertanyaan Rekomendasi Cepat -->
		<div class="dash-prompt-chips" role="group" aria-label="Saran pertanyaan cepat">
			{#each suggestions as sug}
				<button
					type="button"
					class="dash-prompt-chip"
					onclick={() => sendQuestion(sug)}
					disabled={isAnalyzing}
				>
					{sug}
				</button>
			{/each}
		</div>

		<!-- Input Chat -->
		<form
			class="dash-chat-input-row"
			onsubmit={(e) => {
				e.preventDefault();
				sendQuestion(userInput);
			}}
		>
			<input
				type="text"
				placeholder="Tanyakan analisis harga atau biaya warung Anda..."
				class="dash-chat-input"
				bind:value={userInput}
				disabled={isAnalyzing}
			/>
			<button
				type="submit"
				class="dash-btn dash-btn--orange"
				disabled={isAnalyzing || !userInput.trim()}
			>
				Kirim
			</button>
		</form>
	</div>
</div>
