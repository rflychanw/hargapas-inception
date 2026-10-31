<!-- src/routes/[storeId]/advisor/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import type {
		AdvisorSessionWithMessages,
		AdvisorMessageRow
	} from '#lib/server/services/aiAdvisor.ts';
	import SEO from '#lib/components/SEO.svelte';
	import { page } from '$app/state';
	import {
		ArrowRight,
		Copy,
		Check,
		Sparkles,
		Send,
		Bot,
		Lightbulb,
		Tag,
		RotateCcwClock,
		Plus,
		Trash,
		ChevronLeft,
		LoaderCircle
	} from '@lucide/svelte';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();

	let storeId = $derived(page.params.storeId || '');
	let sessions = $state<AdvisorSessionWithMessages[]>([]);
	let activeSessionId = $state<string | null>(null);
	let chatMessages = $state<AdvisorMessageRow[]>([]);
	let showHistoryPage = $state(false);
	let isLoading = $state(false);
	let isDeleting = $state(false);
	let copiedKey = $state<string | null>(null);
	let userQuery = $state('');

	const promptIdeas = [
		'Musim hujan bikin warung sepi, stok ayam melimpah',
		'Harga cabai dan minyak naik, gimana atur margin?',
		'Mau buat paket bundling hemat untuk pelajar'
	];

	$effect(() => {
		if (data.advisorInfo) {
			Promise.resolve(data.advisorInfo).then((info) => {
				if (info && sessions.length === 0 && info.sessions?.length) {
					sessions = info.sessions;
				}
			});
		}
	});

	function formatDate(dateInput?: Date | string) {
		if (!dateInput) return '';
		const d = new Date(dateInput);
		if (isNaN(d.getTime())) return '';
		return d.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function selectSession(session: AdvisorSessionWithMessages) {
		activeSessionId = session.id;
		chatMessages = session.messages || [];
		showHistoryPage = false;
	}

	function startNewSession() {
		activeSessionId = null;
		chatMessages = [];
		showHistoryPage = false;
		userQuery = '';
	}

	function handleIdeaClick(idea: string) {
		if (isLoading) return;
		userQuery = idea;
		const formEl = document.querySelector<HTMLFormElement>('#advisor-chat-form');
		if (formEl) formEl.requestSubmit();
	}

	async function handleDeleteSession(e: Event, sessionId: string) {
		e.stopPropagation();
		if (!sessionId || isDeleting) return;
		if (!confirm('Apakah Anda yakin ingin menghapus sesi diskusi ini?')) return;

		isDeleting = true;
		try {
			const body = new FormData();
			body.append('sessionId', sessionId);
			const res = await fetch('?/deleteSession', { method: 'POST', body });
			if (res.ok) {
				sessions = sessions.filter((s) => s.id !== sessionId);
				if (activeSessionId === sessionId) {
					startNewSession();
				}
			}
		} catch (err) {
			console.error('Gagal menghapus sesi:', err);
		} finally {
			isDeleting = false;
		}
	}

	function copyHeadline(item: any, key: string) {
		const headline = item.marketingHeadline;
		if (!headline) return;
		const price = item.suggestedPrice;
		const name = item.comboName;
		const priceText = price ? ` (Harga Promo: Rp ${price.toLocaleString('id-ID')})` : '';
		navigator.clipboard.writeText(`${name}${priceText}: "${headline}"`);
		copiedKey = key;
		setTimeout(() => {
			copiedKey = null;
		}, 2000);
	}
</script>

<SEO title="Konsultan Bisnis AI" />

<div class="relative flex min-h-[calc(100vh-140px)] flex-col pb-40 font-sans sm:pb-28">
	<div class="hidden items-center justify-between border-b border-slate-200/80 pb-3 md:flex">
		<div class="flex items-center gap-2.5">
			{#if showHistoryPage || chatMessages.length > 0}
				<button
					onclick={() => {
						if (showHistoryPage) {
							showHistoryPage = false;
						} else {
							startNewSession();
						}
					}}
					class="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100"
					title="Kembali"
				>
					<ChevronLeft class="h-5 w-5" />
				</button>
			{:else}
				<div
					class="flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-xs"
				>
					<Sparkles class="h-5 w-5" />
				</div>
			{/if}
			<div>
				<h2 class="text-base font-extrabold text-slate-900">Konsultan Bisnis AI</h2>
				<p class="text-xs text-slate-500">
					{showHistoryPage
						? 'Riwayat Sesi Diskusi'
						: chatMessages.length > 0
							? 'Sesi Diskusi Aktif'
							: 'Asisten Strategi HPP & Promo'}
				</p>
			</div>
		</div>

		<div class="flex items-center gap-2">
			<button
				onclick={startNewSession}
				disabled={isLoading}
				class="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-50"
			>
				<Plus class="h-3.5 w-3.5" />
				<span>Sesi Baru</span>
			</button>
			<button
				onclick={() => (showHistoryPage = !showHistoryPage)}
				disabled={isLoading}
				class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 disabled:opacity-50"
			>
				<RotateCcwClock class="h-3.5 w-3.5 text-slate-500" />
				<span>{showHistoryPage ? 'Kembali ke Chat' : `Riwayat (${sessions.length})`}</span>
			</button>
		</div>
	</div>

	{#await data.advisorInfo}
		<div class="mx-auto flex max-w-xl flex-col items-center justify-center px-1 pt-8 text-center">
			<div class="mb-4 h-14 w-14 animate-pulse rounded-3xl bg-slate-200/80"></div>
			<div class="h-6 w-64 animate-pulse rounded-xl bg-slate-200/80"></div>
		</div>
	{:then _}
		<div class="flex-1 pt-2 sm:pt-4">
			{#if showHistoryPage}
				<div class="mx-auto max-w-3xl space-y-3 sm:space-y-4">
					<div class="flex items-center justify-between px-1">
						<h3 class="text-[10px] font-bold tracking-wider text-slate-400 uppercase sm:text-xs">
							Daftar Sesi Percakapan
						</h3>
						<span class="text-[10px] text-slate-500 sm:text-xs">Total: {sessions.length} sesi</span>
					</div>

					{#if sessions.length === 0}
						<div
							class="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-xs text-slate-400 sm:rounded-3xl sm:p-12"
						>
							Belum ada riwayat diskusi tersimpan.
						</div>
					{:else}
						<div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
							{#each sessions as session (session.id)}
								<div
									class="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs transition-all hover:border-orange-300 sm:rounded-2xl sm:p-4"
								>
									<button
										onclick={() => selectSession(session)}
										class="w-full text-left focus:outline-none"
									>
										<div class="line-clamp-2 pr-6 text-xs font-bold text-slate-900">
											{session.title || 'Diskusi Baru'}
										</div>
										<div class="mt-1.5 flex items-center gap-2 text-[10px] text-slate-400">
											<span>{formatDate(session.updatedAt || session.createdAt)}</span>
										</div>
									</button>
									<button
										onclick={(e) => handleDeleteSession(e, session.id)}
										disabled={isDeleting}
										class="absolute top-3 right-3 rounded-lg p-1 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
										title="Hapus Sesi"
									>
										<Trash class="h-3.5 w-3.5" />
									</button>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{:else if chatMessages.length === 0}
				<div
					class="mx-auto flex max-w-xl flex-col items-center justify-center px-1 pt-2 text-center sm:pt-12"
				>
					<div
						class="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 shadow-xs sm:mb-4 sm:h-14 sm:w-14 sm:rounded-3xl"
					>
						<Bot class="h-6 w-6 sm:h-7 sm:w-7" />
					</div>
					<h3 class="text-base font-bold text-slate-900 sm:text-xl">
						Ada kendala jualan apa hari ini?
					</h3>
					<p class="mt-1.5 text-xs leading-relaxed text-slate-500 sm:mt-2 sm:text-sm">
						Ceritakan situasi warungmu. AI akan menganalisis resep, HPP, dan memberikan racikan
						promo otomatis.
					</p>

					<div class="mt-5 w-full space-y-2 text-left sm:mt-6">
						<span class="px-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
							Coba Tanya Masalah Ini:
						</span>
						<div class="grid grid-cols-1 gap-2">
							{#each promptIdeas as idea (idea)}
								<button
									type="button"
									disabled={isLoading}
									onclick={() => handleIdeaClick(idea)}
									class="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3 text-left text-xs font-medium text-slate-700 shadow-2xs transition-all hover:border-orange-300 hover:bg-orange-50/30 active:scale-[0.99] disabled:opacity-50 sm:rounded-2xl sm:p-3.5"
								>
									<span class="pr-2">{idea}</span>
									<ArrowRight class="h-3.5 w-3.5 shrink-0 text-orange-500 sm:h-4 sm:w-4" />
								</button>
							{/each}
						</div>
					</div>
				</div>
			{:else}
				<div class="mx-auto max-w-3xl space-y-4 sm:space-y-5">
					{#each chatMessages as msg, msgIdx (msg.id || msgIdx)}
						{#if msg.role === 'user'}
							<div class="flex justify-end">
								<div
									class="max-w-[90%] rounded-2xl rounded-br-xs bg-orange-600 px-3.5 py-2.5 text-xs font-medium text-white shadow-2xs sm:max-w-[75%] sm:px-4 sm:py-3 sm:text-sm"
								>
									<p class="leading-relaxed">{msg.content}</p>
								</div>
							</div>
						{:else}
							{@const adviceText = msg.friendlyAdvice || ''}
							{@const actionText = msg.actionStep || ''}
							{@const bundles = Array.isArray(msg.bundlingRecommendations)
								? msg.bundlingRecommendations
								: []}
							<div class="flex items-start gap-2 pt-1 sm:gap-3">
								<div
									class="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-xs sm:h-8 sm:w-8 sm:rounded-2xl"
								>
									<Bot class="h-4 w-4 sm:h-4.5 sm:w-4.5" />
								</div>
								<div class="min-w-0 flex-1 space-y-3 text-xs sm:space-y-4 sm:text-sm">
									{#if adviceText}
										<div class="space-y-0.5">
											<p
												class="text-[9px] font-bold tracking-wider text-slate-400 uppercase sm:text-[10px]"
											>
												Analisis Situasi
											</p>
											<p class="text-xs leading-relaxed font-medium text-slate-800 sm:text-base">
												{adviceText}
											</p>
										</div>
									{/if}

									{#if actionText}
										<div
											class="rounded-xl border border-orange-200/80 bg-orange-50/70 p-3 sm:rounded-2xl sm:p-4"
										>
											<div
												class="flex items-center gap-1 text-[9px] font-bold tracking-wider text-orange-900 uppercase sm:text-[10px]"
											>
												<ArrowRight class="h-3 w-3 text-orange-600 sm:h-3.5 sm:w-3.5" />
												<span>Langkah Prioritas Utama</span>
											</div>
											<p class="mt-0.5 text-xs font-semibold text-orange-950 sm:mt-1 sm:text-sm">
												{actionText}
											</p>
										</div>
									{/if}

									{#if bundles.length > 0}
										<div class="space-y-2 pt-1">
											<div
												class="flex items-center gap-1 text-[9px] font-bold tracking-wider text-slate-400 uppercase sm:text-[10px]"
											>
												<Lightbulb class="h-3 w-3 text-orange-500 sm:h-3.5 sm:w-3.5" />
												<span>Rekomendasi Paket Promo ({bundles.length})</span>
											</div>
											<div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
												{#each bundles as b, bIdx (bIdx)}
													{@const key = `${msgIdx}-${bIdx}`}
													{@const comboName = b.comboName || 'Paket Promo'}
													{@const suggestedPrice = b.suggestedPrice || 0}
													{@const itemsIncluded = b.itemsIncluded || []}
													{@const marketingHeadline = b.marketingHeadline || ''}
													{@const reasoning = b.reasoning || ''}
													<div
														class="flex flex-col justify-between space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs transition-all hover:border-orange-300 sm:rounded-2xl sm:p-3.5"
													>
														<div class="space-y-1.5">
															<div class="flex items-center justify-between gap-2">
																<span
																	class="rounded-md bg-orange-100 px-2 py-0.5 text-[9px] font-bold text-orange-800 sm:text-[10px]"
																>
																	Paket #{bIdx + 1}
																</span>
																<button
																	type="button"
																	onclick={() => copyHeadline(b, key)}
																	class="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-semibold text-slate-600 hover:bg-slate-100 sm:text-[10px]"
																>
																	{#if copiedKey === key}
																		<Check class="h-3 w-3 text-emerald-600" />
																		<span class="font-bold text-emerald-700">Tersalin</span>
																	{:else}
																		<Copy class="h-3 w-3 text-slate-400" />
																		<span>Salin Teks</span>
																	{/if}
																</button>
															</div>
															<h5 class="text-xs font-bold text-slate-900 sm:text-sm">
																{comboName}
															</h5>
															{#if suggestedPrice > 0}
																<div
																	class="flex items-center gap-1 text-xs font-bold text-emerald-700"
																>
																	<Tag class="h-3 w-3" />
																	<span>Rp {Number(suggestedPrice).toLocaleString('id-ID')}</span>
																</div>
															{/if}
															{#if itemsIncluded.length > 0}
																<div class="flex flex-wrap gap-1 pt-0.5">
																	{#each itemsIncluded as item (item)}
																		<span
																			class="inline-flex items-center rounded-md border border-slate-200/80 bg-slate-50 px-1.5 py-0.5 text-[9px] font-semibold text-slate-700 sm:text-[10px]"
																		>
																			+ {item}
																		</span>
																	{/each}
																</div>
															{/if}
															{#if marketingHeadline}
																<p
																	class="text-xs leading-relaxed font-medium text-slate-600 italic"
																>
																	"{marketingHeadline}"
																</p>
															{/if}
															{#if reasoning}
																<p
																	class="border-t border-slate-100 pt-1.5 text-[9px] leading-normal text-slate-500 sm:text-[10px]"
																>
																	<b>Alasan:</b>
																	{reasoning}
																</p>
															{/if}
														</div>
													</div>
												{/each}
											</div>
										</div>
									{/if}
								</div>
							</div>
						{/if}
					{/each}

					{#if isLoading}
						<div class="flex items-center gap-2.5 pt-1 text-xs text-slate-400 italic">
							<div
								class="flex h-7 w-7 items-center justify-center rounded-xl bg-orange-500 text-white shadow-xs sm:h-8 sm:w-8"
							>
								<Bot class="h-4 w-4 animate-bounce" />
							</div>
							<span>Menganalisis margin resep & meracik promo...</span>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{:catch error}
		<div
			class="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-center text-xs text-rose-600"
		>
			Gagal memuat konsultan AI: {error.message || 'Terjadi kesalahan sistem.'}
		</div>
	{/await}

	<div
		class="fixed inset-x-0 bottom-16 z-30 flex flex-col items-center gap-2 bg-linear-to-t from-slate-50 via-slate-50/95 to-transparent px-3 py-2 sm:bottom-0 sm:px-4 sm:py-4"
	>
		<div class="flex w-full items-center justify-end gap-2 md:hidden">
			<button
				type="button"
				onclick={startNewSession}
				disabled={isLoading}
				class="inline-flex items-center gap-1 rounded-full bg-orange-600 p-2 text-[11px] font-bold text-white shadow-md transition-transform active:scale-95 disabled:opacity-50"
			>
				<Plus class="h-5 w-5" />
			</button>
			<button
				type="button"
				onclick={() => (showHistoryPage = !showHistoryPage)}
				disabled={isLoading}
				class="inline-flex items-center gap-1 rounded-full border border-slate-200/90 bg-white p-2 text-[11px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
			>
				<RotateCcwClock class="h-5 w-5 text-slate-500" />
			</button>
		</div>

		{#if !showHistoryPage}
			<form
				id="advisor-chat-form"
				method="POST"
				action="?/askAdvisor"
				use:enhance={({ formData }) => {
					const queryText = userQuery.trim();
					if (!queryText || isLoading) return;

					const tempUserMsg: AdvisorMessageRow = {
						id: crypto.randomUUID(),
						role: 'user',
						content: queryText,
						createdAt: new Date()
					};
					chatMessages = [...chatMessages, tempUserMsg];
					isLoading = true;

					if (activeSessionId) {
						formData.append('sessionId', activeSessionId);
					}
					formData.set('userQuery', queryText);
					userQuery = '';

					return async ({ result }) => {
						isLoading = false;
						if (result.type === 'success' && result.data) {
							const responseData = result.data as Record<string, any>;
							const newAdvice = responseData.advice;

							if (responseData.sessionId) {
								activeSessionId = responseData.sessionId as string;
							}

							if (newAdvice) {
								const aiMsg: AdvisorMessageRow = {
									id: crypto.randomUUID(),
									role: 'assistant',
									friendlyAdvice: newAdvice.friendlyAdvice,
									actionStep: newAdvice.actionStep,
									bundlingRecommendations: newAdvice.bundlingRecommendations || [],
									createdAt: new Date()
								};
								chatMessages = [...chatMessages, aiMsg];

								const sessionTitle =
									queryText.length > 50 ? queryText.slice(0, 47) + '...' : queryText;
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
							}
						}
					};
				}}
				class="mx-auto flex w-full max-w-3xl items-center gap-2 rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-md focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 sm:rounded-2xl"
			>
				<input
					type="text"
					name="userQuery"
					bind:value={userQuery}
					disabled={isLoading}
					placeholder="Tulis kendala warungmu disini..."
					class="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
				/>
				<button
					type="submit"
					disabled={isLoading || !userQuery.trim()}
					class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-600 text-white transition-colors hover:bg-orange-700 disabled:opacity-40 sm:h-10 sm:w-auto sm:rounded-xl sm:px-4 sm:text-xs sm:font-bold"
				>
					{#if isLoading}
						<LoaderCircle class="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
					{:else}
						<Send class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
					{/if}
					<span class="hidden sm:ml-1.5 sm:inline">{isLoading ? 'Proses...' : 'Kirim'}</span>
				</button>
			</form>
		{/if}
	</div>
</div>

