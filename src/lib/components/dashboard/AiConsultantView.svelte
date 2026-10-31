<script lang="ts">
	import { formatFigmaRupiah } from '#lib/dashboard-data.js';
	import type { MenuItem } from './HppModal.svelte';
	import type {
		AdvisorSessionWithMessages,
		AdvisorMessageRow
	} from '#lib/server/services/aiAdvisor.ts';

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

	interface Props {
		items?: MenuItem[];
		initialPrompt?: string;
		storeId?: string;
		initialSessions?: AdvisorSessionWithMessages[];
		dailyCount?: number;
	}

	let {
		items = [],
		initialPrompt = '',
		storeId = '',
		initialSessions = [],
		dailyCount = 0
	}: Props = $props();

	let mode = $state<'chat' | 'history'>('chat');
	let sessions = $state<AdvisorSessionWithMessages[]>([]);
	let activeSessionId = $state<string | null>(null);
	let chatMessages = $state<AdvisorMessageRow[]>([]);
	let userInput = $state('');
	let copiedId = $state<string | null>(null);
	let isLoading = $state(false);
	let currentDailyCount = $state(0);

	const promptIdeas = [
		'Musim hujan bikin warung sepi, stok ayam melimpah',
		'Harga cabai dan minyak naik, gimana atur margin?',
		'Mau buat paket bundling hemat untuk pelajar'
	];

	function formatDate(dateInput?: Date | string) {
		if (!dateInput) return '';
		const d = new Date(dateInput);
		if (isNaN(d.getTime())) return '';
		return (
			d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) +
			', ' +
			d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
		);
	}

	// Sync sessions when storeId or initialSessions change
	let lastSyncedStoreId = $state('');
	$effect(() => {
		if (storeId !== lastSyncedStoreId) {
			lastSyncedStoreId = storeId;
			sessions = initialSessions || [];
			currentDailyCount = dailyCount || 0;
			if (sessions.length > 0) {
				activeSessionId = sessions[0].id;
				chatMessages = sessions[0].messages || [];
			} else {
				activeSessionId = null;
				chatMessages = [];
			}
		} else if (sessions.length === 0 && initialSessions && initialSessions.length > 0) {
			sessions = initialSessions;
			activeSessionId = sessions[0].id;
			chatMessages = sessions[0].messages || [];
		}
	});

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

	function startNewSession() {
		activeSessionId = null;
		chatMessages = [];
		userInput = '';
		mode = 'chat';
	}

	async function handleSendCustom(queryText: string) {
		const q = queryText.trim();
		if (!q || isLoading) return;

		const tempUserMsg: AdvisorMessageRow = {
			id: `u-${Date.now()}`,
			role: 'user',
			content: q,
			createdAt: new Date()
		};

		chatMessages = [...chatMessages, tempUserMsg];
		userInput = '';
		mode = 'chat';
		isLoading = true;

		try {
			const formData = new FormData();
			formData.set('storeId', storeId);
			formData.set('userQuery', q);
			if (activeSessionId) {
				formData.set('sessionId', activeSessionId);
			}

			const res = await fetch('/dashboard?/askAdvisor', {
				method: 'POST',
				body: formData
			});

			let newAdvice: any = null;
			let returnedSessionId: string | undefined = activeSessionId || undefined;

			if (res.ok) {
				const payload = await res.json();
				let parsedData: any = payload?.data;
				if (typeof parsedData === 'string') {
					try {
						const devalued = JSON.parse(parsedData);
						// SvelteKit action devalue array or object
						if (Array.isArray(devalued)) {
							// Find object containing friendlyAdvice
							const foundAdvice = devalued.find(
								(el: any) =>
									el && typeof el === 'object' && ('friendlyAdvice' in el || 'actionStep' in el)
							);
							if (foundAdvice) {
								const resolveVal = (v: any): any => {
									if (typeof v === 'number' && devalued[v] !== undefined) return resolveVal(devalued[v]);
									if (Array.isArray(v)) return v.map(resolveVal);
									if (v && typeof v === 'object') {
										const out: Record<string, any> = {};
										for (const [k, val] of Object.entries(v)) {
											out[k] = resolveVal(val);
										}
										return out;
									}
									return v;
								};
								newAdvice = resolveVal(foundAdvice);
							}
							const rootObj = devalued[0];
							if (rootObj && typeof rootObj === 'object' && 'sessionId' in rootObj) {
								const sidIdx = rootObj.sessionId;
								if (typeof sidIdx === 'number' && typeof devalued[sidIdx] === 'string') {
									returnedSessionId = devalued[sidIdx];
								} else if (typeof sidIdx === 'string') {
									returnedSessionId = sidIdx;
								}
							}
						} else if (devalued && typeof devalued === 'object') {
							newAdvice = devalued.advice;
							returnedSessionId = devalued.sessionId || returnedSessionId;
						}
					} catch {
						// fallback below
					}
				} else if (parsedData && typeof parsedData === 'object') {
					newAdvice = parsedData.advice;
					returnedSessionId = parsedData.sessionId || returnedSessionId;
				}
			}

			if (!newAdvice) {
				const firstItem = items[0];
				const secondItem = items[1];
				newAdvice = {
					friendlyAdvice: `Berdasarkan kendala "${q}", kita bisa dorong kombinasi menu favorit untuk mendongkrak penjualan.`,
					actionStep:
						'Buat papan menu kecil di meja yang menampilkan paket bundling untuk meningkatkan Average Order Value.',
					bundlingRecommendations: [
						{
							comboName: `Paket Kombo: ${firstItem?.name || 'Menu Utama'} + ${secondItem?.name || 'Minuman'}`,
							itemsIncluded: [
								firstItem?.name || 'Menu Utama',
								secondItem?.name || 'Minuman Segar'
							],
							suggestedPrice: Math.ceil(
								((firstItem?.price || 15000) + (secondItem?.price || 5000)) * 0.9
							),
							marketingHeadline: 'Kombinasi Gurih & Segar, Perut Kenyang Hati Senang!',
							reasoning:
								'Menggabungkan produk unggulan untuk memaksimalkan volume penjualan dengan harga tetap kompetitif.'
						}
					]
				};
			}

			if (returnedSessionId) {
				activeSessionId = returnedSessionId;
			} else if (!activeSessionId) {
				activeSessionId = `sess-${Date.now()}`;
			}

			const aiMsg: AdvisorMessageRow = {
				id: `a-${Date.now()}`,
				role: 'assistant',
				friendlyAdvice: newAdvice.friendlyAdvice,
				actionStep: newAdvice.actionStep,
				bundlingRecommendations: newAdvice.bundlingRecommendations || [],
				createdAt: new Date()
			};

			chatMessages = [...chatMessages, aiMsg];
			currentDailyCount = Math.min(5, currentDailyCount + 1);

			const sessionTitle = q.length > 50 ? q.slice(0, 47) + '...' : q;
			const existingIdx = sessions.findIndex((s) => s.id === activeSessionId);

			if (existingIdx >= 0) {
				sessions[existingIdx] = {
					...sessions[existingIdx],
					updatedAt: new Date(),
					messages: chatMessages
				};
			} else if (activeSessionId) {
				const newSession: AdvisorSessionWithMessages = {
					id: activeSessionId,
					storeId,
					title: sessionTitle,
					createdAt: new Date(),
					updatedAt: new Date(),
					messages: chatMessages
				};
				sessions = [newSession, ...sessions];
			}
		} catch (err) {
			console.error('Gagal berkonsultasi dengan AI Advisor:', err);
		} finally {
			isLoading = false;
		}
	}

	function handleFormSubmit(e: SubmitEvent) {
		e.preventDefault();
		handleSendCustom(userInput);
	}

	function selectSessionItem(sess: AdvisorSessionWithMessages) {
		activeSessionId = sess.id;
		chatMessages = sess.messages || [];
		mode = 'chat';
	}

	async function deleteSingleSession(e: MouseEvent, sessId: string) {
		e.stopPropagation();
		sessions = sessions.filter((s) => s.id !== sessId);
		if (activeSessionId === sessId) {
			if (sessions.length > 0) {
				activeSessionId = sessions[0].id;
				chatMessages = sessions[0].messages || [];
			} else {
				activeSessionId = null;
				chatMessages = [];
			}
		}
		if (storeId) {
			const fd = new FormData();
			fd.set('storeId', storeId);
			fd.set('sessionId', sessId);
			await fetch('/dashboard?/deleteSession', { method: 'POST', body: fd }).catch(() => {});
		}
	}

	async function clearAllHistory() {
		sessions = [];
		activeSessionId = null;
		chatMessages = [];
		if (storeId) {
			const fd = new FormData();
			fd.set('storeId', storeId);
			await fetch('/dashboard?/deleteAllSessions', { method: 'POST', body: fd }).catch(() => {});
		}
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
				<p class="hp-consult-head__sub">
					Diskusi strategi margin & racikan promo otomatis ({currentDailyCount}/5 kuota hari ini).
				</p>
			</div>
		</div>

		<div style="display: flex; align-items: center; gap: 8px;">
			<button
				type="button"
				class="hp-btn-primary"
				style="height: 36px; padding: 0 12px; font-size: 12px;"
				onclick={startNewSession}
				disabled={isLoading}
			>
				+ Sesi Baru
			</button>

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
					<span>Riwayat ({sessions.length})</span>
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
		</div>
	</header>

	<!-- CHAT VIEW CONTAINER -->
	<div class="hp-consult-body" class:hp-hidden={mode !== 'chat'}>
		{#if chatMessages.length === 0}
			<!-- Empty / New Session Prompt Ideas -->
			<div class="hp-card" style="padding: 28px 24px; text-align: center; max-width: 600px; margin: 16px auto;">
				<h2 style="font-size: 18px; font-weight: 800; color: #0F172A; margin: 0 0 6px;">
					Ada kendala jualan apa hari ini?
				</h2>
				<p style="font-size: 13px; color: #64748B; margin: 0 0 18px;">
					Ceritakan situasi warungmu. AI akan menganalisis resep, HPP, dan memberikan racikan promo otomatis.
				</p>
				<div style="display: flex; flex-direction: column; gap: 8px; text-align: left;">
					{#each promptIdeas as idea (idea)}
						<button
							type="button"
							class="hp-card"
							style="padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; font-size: 13px; font-weight: 600; color: #334155;"
							onclick={() => handleSendCustom(idea)}
							disabled={isLoading}
						>
							<span>{idea}</span>
							<span style="color: #E64A0A; font-weight: 800;">&rarr;</span>
						</button>
					{/each}
				</div>
			</div>
		{:else}
			{#each chatMessages as msg, msgIdx (msg.id || msgIdx)}
				{#if msg.role === 'user'}
					<div class="hp-user-bubble-row">
						<div class="hp-user-bubble">
							{msg.content}
						</div>
					</div>
				{:else}
					{@const bundles = Array.isArray(msg.bundlingRecommendations)
						? msg.bundlingRecommendations
						: []}
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
							{#if msg.friendlyAdvice}
								<p class="hp-ai-section-label">ANALISIS SITUASI</p>
								<p class="hp-ai-analysis-text">{msg.friendlyAdvice}</p>
							{/if}

							{#if msg.actionStep}
								<div class="hp-priority-box">
									<p class="hp-priority-box__tag">→ LANGKAH PRIORITAS UTAMA</p>
									<p class="hp-priority-box__text">{msg.actionStep}</p>
								</div>
							{/if}

							{#if bundles.length > 0}
								<p class="hp-ai-section-label hp-ai-section-label--promo">
									<span>💡</span>
									<span>PILIHAN PAKET PROMO ({bundles.length})</span>
								</p>

								<div class="hp-promo-grid">
									{#each bundles as b, bIdx (bIdx)}
										{@const promoObj = {
											id: `${msgIdx}-${bIdx}`,
											badge: `Pilihan #${bIdx + 1}`,
											title: b.comboName || 'Paket Promo',
											price: Number(b.suggestedPrice || 0),
											itemsText: (b.itemsIncluded || []).join(' • '),
											quote: `“${b.marketingHeadline || 'Solusi hemat rasa mantap!'}”`,
											reason: b.reasoning || 'Paket promosi khusus untuk meningkatkan volume penjualan.'
										}}
										<article class="hp-card hp-promo-card">
											<div class="hp-promo-card__top">
												<span class="hp-promo-badge">{promoObj.badge}</span>
												<button
													type="button"
													class="hp-copy-btn"
													onclick={() => handleCopyPromo(promoObj)}
												>
													<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
														<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
														<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
													</svg>
													<span>{copiedId === promoObj.id ? 'Tersalin!' : 'Salin Teks'}</span>
												</button>
											</div>

											<h3 class="hp-promo-card__title">{promoObj.title}</h3>

											{#if promoObj.price > 0}
												<p class="hp-promo-card__price">
													<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
														<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
														<circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
													</svg>
													<span>{formatFigmaRupiah(promoObj.price)}</span>
												</p>
											{/if}

											{#if promoObj.itemsText}
												<div class="hp-promo-card__items">{promoObj.itemsText}</div>
											{/if}

											<p class="hp-promo-card__quote">{promoObj.quote}</p>

											<p class="hp-promo-card__reason">
												<strong>Alasan:</strong> {promoObj.reason}
											</p>
										</article>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				{/if}
			{/each}

			{#if isLoading}
				<div style="display: flex; align-items: center; gap: 10px; font-size: 13px; color: #64748B; font-style: italic; padding: 8px 0;">
					<span>⏳ Menganalisis margin resep & meracik promo...</span>
				</div>
			{/if}
		{/if}
	</div>

	<!-- Bottom Floating Input Bar (Hanya tampil di Chat mode) -->
	{#if mode === 'chat'}
		<form class="hp-chat-bar" onsubmit={handleFormSubmit}>
			<input
				type="text"
				class="hp-chat-bar__input"
				placeholder="Tulis kendala warungmu (misal: Cabai naik, stok lele banyak)..."
				bind:value={userInput}
				disabled={isLoading}
			/>
			<button type="submit" class="hp-chat-bar__submit" disabled={isLoading || !userInput.trim()}>
				{isLoading ? 'Proses...' : 'Kirim'}
			</button>
		</form>
	{/if}

	<!-- HISTORY VIEW CONTAINER -->
	<div class="hp-history-body" class:hp-hidden={mode !== 'history'}>
		<div class="hp-history-subhead">
			<span class="hp-ai-section-label">RIWAYAT KONSULTASI</span>
			{#if sessions.length > 0}
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

		{#if sessions.length === 0}
			<div class="hp-card hp-history-empty">
				<p>Belum ada riwayat konsultasi.</p>
			</div>
		{:else}
			<div class="hp-history-grid">
				{#each sessions as sess (sess.id)}
					{@const lastAssistant = [...(sess.messages || [])].reverse().find((m) => m.role === 'assistant')}
					{@const promoCount = lastAssistant?.bundlingRecommendations?.length || 0}
					{@const summary = lastAssistant?.actionStep || lastAssistant?.friendlyAdvice || 'Diskusi strategi harga & promo'}
					{@const dateText = formatDate(sess.updatedAt || sess.createdAt)}
					<div class="hp-card hp-history-card" style="position: relative;">
						<button
							type="button"
							style="width: 100%; background: none; border: 0; padding: 0; text-align: left; cursor: pointer;"
							onclick={() => selectSessionItem(sess)}
						>
							<div class="hp-history-card__top">
								<span class="hp-history-card__prompt">“{sess.title}”</span>
								<span class="hp-history-card__date-desktop" style="padding-right: 26px;">{dateText}</span>
							</div>
							<p class="hp-history-card__summary">{summary}</p>
							<div class="hp-history-card__foot">
								<span class="hp-history-card__tag">{promoCount} Paket Promo</span>
								<span class="hp-history-card__date-mobile">{dateText}</span>
							</div>
						</button>
						<button
							type="button"
							class="hp-icon-btn hp-icon-btn--danger"
							style="position: absolute; top: 12px; right: 12px;"
							onclick={(e) => deleteSingleSession(e, sess.id)}
							title="Hapus Sesi"
							aria-label="Hapus Sesi"
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M3 6h18" />
								<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
								<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
							</svg>
						</button>
					</div>
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
