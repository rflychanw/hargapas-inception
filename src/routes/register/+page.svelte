<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { registerUser, getCurrentUser } from '#lib/auth.js';

	let name = $state('');
	let storeName = $state('');
	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let targetMargin = $state(30);
	let errorMessage = $state('');
	let isLoading = $state(false);

	const marginPresets = [
		{ value: 20, label: '20%', desc: 'Grosir / Volume Tinggi' },
		{ value: 30, label: '30%', badge: 'Rekomendasi', desc: 'Warung & Rumah Makan' },
		{ value: 40, label: '40%', desc: 'Cafe & Resto' },
		{ value: 50, label: '50%', desc: 'Minuman & Kopi' },
		{ value: 60, label: '60%', desc: 'Camilan & Snack' }
	];

	let marginTip = $derived(
		targetMargin <= 25
			? 'Cocok untuk model grosir atau menu pokok berputar sangat cepat (volume tinggi).'
			: targetMargin <= 35
				? 'Standar ideal kuliner UMKM: menyeimbangkan daya beli pelanggan dengan laba bersih operasional.'
				: targetMargin <= 45
					? 'Batas aman untuk menu dengan biaya sewa tempat, listrik, dan kemasan khusus.'
					: 'Margin tinggi optimal untuk kategori minuman, racikan es, atau camilan berprofit tebal.'
	);

	onMount(() => {
		const existingUser = getCurrentUser();
		if (existingUser) {
			goto('/dashboard');
		}
	});

	function handleRegister(e?: SubmitEvent) {
		if (e) e.preventDefault();
		errorMessage = '';

		if (!name.trim()) {
			errorMessage = 'Nama lengkap wajib diisi.';
			return;
		}
		if (!email.trim()) {
			errorMessage = 'Email atau username wajib diisi.';
			return;
		}
		if (!password.trim() || password.length < 4) {
			errorMessage = 'Kata sandi minimal 4 karakter.';
			return;
		}

		isLoading = true;

		setTimeout(() => {
			const res = registerUser({
				name: name.trim(),
				email: email.trim(),
				password: password.trim(),
				storeName: storeName.trim() || 'Warung Kuliner',
				targetMargin: Number(targetMargin) || 30
			});

			if (res.success) {
				goto('/dashboard');
			} else {
				errorMessage = res.error || 'Gagal mendaftar. Silakan coba lagi.';
				isLoading = false;
			}
		}, 300);
	}
</script>

<svelte:head>
	<title>Daftar Akun & Pilih Target Margin — HargaPas</title>
	<meta
		name="description"
		content="Daftarkan warung atau usaha kulinermu, pilih target keuntungan ideal, dan mulai hitung HPP akurat."
	/>
</svelte:head>

<div class="reg-wrapper">
	<div class="reg-shell">
		<!-- Brand Header -->
		<header class="reg-head">
			<a href="/" class="reg-brand" title="Kembali ke beranda">
				<span class="reg-brand__mark"></span>
				<span class="reg-brand__text">HargaPas</span>
			</a>
			<span class="reg-pill">Registrasi Akun Baru</span>
		</header>

		<!-- Card Register -->
		<main class="reg-card">
			<div class="reg-card__intro">
				<h1 class="reg-card__title">Mulai Kelola HPP & Margin Warung</h1>
				<p class="reg-card__sub">
					Daftarkan toko dan tentukan target keuntungan untuk memantau kesehatan laba menu Anda.
				</p>
			</div>

			{#if errorMessage}
				<div class="reg-alert" role="alert">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10"></circle>
						<line x1="12" y1="8" x2="12" y2="12"></line>
						<line x1="12" y1="16" x2="12.01" y2="16"></line>
					</svg>
					<span>{errorMessage}</span>
				</div>
			{/if}

			<form class="reg-form" onsubmit={handleRegister}>
				<!-- Profil Pemilik & Toko -->
				<div class="reg-grid-2">
					<div class="reg-field">
						<label for="reg-name" class="reg-label">Nama Lengkap Pemilik</label>
						<input
							id="reg-name"
							type="text"
							class="reg-input"
							placeholder="Contoh: Budi Santoso"
							bind:value={name}
							required
						/>
					</div>

					<div class="reg-field">
						<label for="reg-store" class="reg-label">Nama Warung / Usaha</label>
						<input
							id="reg-store"
							type="text"
							class="reg-input"
							placeholder="Contoh: Warung Berkah Ceria"
							bind:value={storeName}
							required
						/>
					</div>
				</div>

				<!-- Kredensial Login -->
				<div class="reg-grid-2">
					<div class="reg-field">
						<label for="reg-email" class="reg-label">Email atau Username</label>
						<input
							id="reg-email"
							type="text"
							class="reg-input"
							placeholder="budi@hargapas.id"
							bind:value={email}
							required
							autocomplete="username"
						/>
					</div>

					<div class="reg-field">
						<div class="reg-field__between">
							<label for="reg-pass" class="reg-label">Kata Sandi</label>
							<button
								type="button"
								class="reg-toggle-pass"
								onclick={() => (showPassword = !showPassword)}
							>
								{showPassword ? 'Sembunyikan' : 'Lihat'}
							</button>
						</div>
						<input
							id="reg-pass"
							type={showPassword ? 'text' : 'password'}
							class="reg-input"
							placeholder="Minimal 4 karakter"
							bind:value={password}
							required
							autocomplete="new-password"
						/>
					</div>
				</div>

				<!-- Pemilihan Target Keuntungan (Target Margin %) -->
				<div class="reg-target-section">
					<div class="reg-target-head">
						<div>
							<label for="reg-margin-range" class="reg-label reg-label--lg">
								Target Keuntungan (Margin Bersih Minimal)
							</label>
							<p class="reg-target-sub">
								Digunakan sistem untuk menandai apakah harga jual menu Anda masuk kategori <strong>Sesuai Target</strong> atau <strong>Perlu Evaluasi</strong>.
							</p>
						</div>
						<div class="reg-target-badge">
							<span class="reg-target-badge__num">{targetMargin}%</span>
						</div>
					</div>

					<!-- Preset Pills -->
					<div class="reg-preset-list" role="radiogroup" aria-label="Pilihan cepat target keuntungan">
						{#each marginPresets as preset (preset.value)}
							<button
								type="button"
								class="reg-preset-btn"
								class:reg-preset-btn--active={targetMargin === preset.value}
								onclick={() => (targetMargin = preset.value)}
							>
								{#if preset.badge}
									<span class="reg-preset-badge">{preset.badge}</span>
								{/if}
								<span class="reg-preset-pct">{preset.label}</span>
								<span class="reg-preset-desc">{preset.desc}</span>
							</button>
						{/each}
					</div>

					<!-- Interactive Range Slider -->
					<div class="reg-slider-wrap">
						<input
							id="reg-margin-range"
							type="range"
							min="10"
							max="80"
							step="5"
							class="reg-range-slider"
							bind:value={targetMargin}
						/>
						<div class="reg-slider-ticks">
							<span>10% (Konservatif)</span>
							<span>30% (Ideal)</span>
							<span>50%</span>
							<span>80% (Premium)</span>
						</div>
					</div>

					<!-- Real-time Tip Box -->
					<div class="reg-tip-box">
						<span class="reg-tip-box__icon">💡</span>
						<p class="reg-tip-box__text">{marginTip}</p>
					</div>
				</div>

				<button
					type="submit"
					class="reg-btn reg-btn--primary"
					disabled={isLoading}
				>
					{#if isLoading}
						<span class="reg-spinner"></span>
						<span>Mendaftarkan Usaha Anda...</span>
					{:else}
						<span>Daftar & Masuk ke Dashboard</span>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
							<line x1="5" y1="12" x2="19" y2="12"></line>
							<polyline points="12 5 19 12 12 19"></polyline>
						</svg>
					{/if}
				</button>
			</form>

			<div class="reg-switch-login">
				<p>Sudah memiliki akun?</p>
				<a href="/login" class="reg-login-link">Masuk ke Portal Login &rarr;</a>
			</div>
		</main>

		<!-- Footer Link -->
		<footer class="reg-foot">
			<a href="/" class="reg-back-link">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="19" y1="12" x2="5" y2="12"></line>
					<polyline points="12 19 5 12 12 5"></polyline>
				</svg>
				<span>Kembali ke Beranda HargaPas</span>
			</a>
		</footer>
	</div>
</div>

<style>
	.reg-wrapper {
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: clamp(20px, 4vw, 48px) 16px;
		background: #f6f8fb;
		font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
		color: #0f172a;
	}

	.reg-shell {
		width: 100%;
		max-width: 580px;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.reg-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-inline: 4px;
	}

	.reg-brand {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		color: #0f172a;
	}

	.reg-brand__mark {
		width: 14px;
		height: 14px;
		background: #e64a0a;
		border-radius: 4px;
	}

	.reg-brand__text {
		font-size: 20px;
		font-weight: 800;
		letter-spacing: -0.03em;
	}

	.reg-pill {
		font-size: 12px;
		font-weight: 700;
		color: #e64a0a;
		background: #fff1e8;
		border: 1px solid #fed7aa;
		padding: 4px 10px;
		border-radius: 9999px;
	}

	.reg-card {
		background: #ffffff;
		border: 1px solid #e3e9f0;
		border-radius: 16px;
		padding: clamp(24px, 4vw, 36px);
		box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
		display: flex;
		flex-direction: column;
		gap: 22px;
	}

	.reg-card__intro {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.reg-card__title {
		font-size: clamp(20px, 2.8vw, 24px);
		font-weight: 800;
		letter-spacing: -0.025em;
		margin: 0;
		color: #0f172a;
		line-height: 1.25;
	}

	.reg-card__sub {
		font-size: 13.5px;
		color: #64748b;
		margin: 0;
		line-height: 1.5;
	}

	.reg-alert {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 14px;
		background: #fff1f2;
		border: 1px solid #fecdd3;
		border-radius: 10px;
		font-size: 13px;
		font-weight: 600;
		color: #e11d48;
	}

	.reg-form {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.reg-grid-2 {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 14px;
	}

	@media (min-width: 540px) {
		.reg-grid-2 {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	.reg-field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.reg-field__between {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.reg-label {
		font-size: 12.5px;
		font-weight: 700;
		color: #334155;
	}

	.reg-label--lg {
		font-size: 13.5px;
		color: #0f172a;
	}

	.reg-toggle-pass {
		background: none;
		border: 0;
		font-size: 12px;
		font-weight: 700;
		color: #e64a0a;
		cursor: pointer;
		padding: 0;
	}

	.reg-toggle-pass:hover {
		text-decoration: underline;
	}

	.reg-input {
		width: 100%;
		height: 44px;
		padding: 0 14px;
		font-size: 14px;
		font-family: inherit;
		border: 1px solid #d1d5db;
		border-radius: 9px;
		background: #f8fafc;
		color: #0f172a;
		transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
		outline: none;
	}

	.reg-input:focus {
		background: #ffffff;
		border-color: #e64a0a;
		box-shadow: 0 0 0 3px rgba(230, 74, 10, 0.14);
	}

	/* Target Margin Custom Selection */
	.reg-target-section {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.reg-target-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
	}

	.reg-target-sub {
		font-size: 12px;
		color: #64748b;
		margin: 2px 0 0 0;
		line-height: 1.4;
	}

	.reg-target-badge {
		background: #fff1e8;
		border: 1px solid #fed7aa;
		border-radius: 10px;
		padding: 6px 14px;
		flex: none;
	}

	.reg-target-badge__num {
		font-size: 20px;
		font-weight: 800;
		color: #e64a0a;
		letter-spacing: -0.02em;
	}

	.reg-preset-list {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 8px;
	}

	@media (min-width: 520px) {
		.reg-preset-list {
			grid-template-columns: repeat(5, minmax(0, 1fr));
		}
	}

	.reg-preset-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 10px 8px;
		background: #ffffff;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		cursor: pointer;
		position: relative;
		transition: all 0.15s ease;
		text-align: center;
	}

	.reg-preset-btn:hover {
		border-color: #cbd5e1;
		background: #fbfcfd;
	}

	.reg-preset-btn--active {
		background: #e64a0a;
		border-color: #e64a0a;
		color: #ffffff;
		box-shadow: 0 4px 12px rgba(230, 74, 10, 0.25);
	}

	.reg-preset-badge {
		position: absolute;
		top: -7px;
		background: #0f172a;
		color: #ffffff;
		font-size: 9px;
		font-weight: 700;
		padding: 1px 5px;
		border-radius: 4px;
		letter-spacing: 0.02em;
	}

	.reg-preset-pct {
		font-size: 15px;
		font-weight: 800;
		line-height: 1.2;
	}

	.reg-preset-desc {
		font-size: 10px;
		color: #64748b;
		margin-top: 2px;
		line-height: 1.2;
	}

	.reg-preset-btn--active .reg-preset-desc {
		color: rgba(255, 255, 255, 0.9);
	}

	.reg-slider-wrap {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.reg-range-slider {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		height: 6px;
		border-radius: 999px;
		background: #cbd5e1;
		outline: none;
		cursor: pointer;
	}

	.reg-range-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: #e64a0a;
		border: 3px solid #ffffff;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
		cursor: grab;
	}

	.reg-range-slider::-moz-range-thumb {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: #e64a0a;
		border: 3px solid #ffffff;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
		cursor: grab;
	}

	.reg-slider-ticks {
		display: flex;
		justify-content: space-between;
		font-size: 11px;
		color: #94a3b8;
	}

	.reg-tip-box {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		background: #ffffff;
		border: 1px solid #eef2f6;
		border-radius: 8px;
		padding: 10px 12px;
	}

	.reg-tip-box__icon {
		font-size: 14px;
		line-height: 1.3;
	}

	.reg-tip-box__text {
		font-size: 12px;
		line-height: 1.45;
		color: #475569;
		margin: 0;
	}

	.reg-btn {
		width: 100%;
		height: 48px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		font-size: 15px;
		font-weight: 700;
		font-family: inherit;
		border-radius: 10px;
		cursor: pointer;
		border: 0;
		transition: background-color 0.15s ease, transform 0.1s ease;
	}

	.reg-btn--primary {
		background: #e64a0a;
		color: #ffffff;
		box-shadow: 0 4px 14px rgba(230, 74, 10, 0.28);
	}

	.reg-btn--primary:hover:not(:disabled) {
		background: #d14006;
	}

	.reg-btn--primary:active:not(:disabled) {
		transform: scale(0.98);
	}

	.reg-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.reg-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: #ffffff;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.reg-switch-login {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding-top: 14px;
		border-top: 1px solid #eef2f6;
		font-size: 13.5px;
		color: #64748b;
	}

	.reg-switch-login p {
		margin: 0;
	}

	.reg-login-link {
		color: #e64a0a;
		font-weight: 700;
		text-decoration: none;
	}

	.reg-login-link:hover {
		text-decoration: underline;
	}

	.reg-foot {
		text-align: center;
	}

	.reg-back-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		font-weight: 600;
		color: #64748b;
		text-decoration: none;
		transition: color 0.15s ease;
	}

	.reg-back-link:hover {
		color: #e64a0a;
	}
</style>

