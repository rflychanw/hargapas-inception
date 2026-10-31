<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authenticate, getCurrentUser, DEMO_ACCOUNTS } from '#lib/auth.js';

	let identifier = $state('bu.sirep@hargapas.id');
	let password = $state('warung123');
	let showPassword = $state(false);
	let errorMessage = $state('');
	let isLoading = $state(false);

	onMount(() => {
		// Jika sudah login, langsung alihkan ke dashboard
		const existingUser = getCurrentUser();
		if (existingUser) {
			goto('/dashboard');
		}
	});

	function handleLogin(e?: SubmitEvent) {
		if (e) e.preventDefault();
		errorMessage = '';

		if (!identifier.trim() || !password.trim()) {
			errorMessage = 'Silakan isi email/username dan kata sandi.';
			return;
		}

		isLoading = true;

		setTimeout(() => {
			const user = authenticate(identifier, password);
			if (user) {
				goto('/dashboard');
			} else {
				errorMessage = 'Kredensial tidak cocok. Silakan gunakan akun uji coba di bawah.';
				isLoading = false;
			}
		}, 300);
	}

	function handleQuickFill(accIndex: number = 0) {
		const acc = DEMO_ACCOUNTS[accIndex];
		if (!acc) return;
		identifier = acc.username;
		password = acc.password;
		errorMessage = '';
		handleLogin();
	}
</script>

<svelte:head>
	<title>Masuk ke Dashboard — HargaPas</title>
	<meta
		name="description"
		content="Portal login uji coba Dashboard HargaPas untuk Warung Bu Sirep dan pemilik usaha kuliner."
	/>
</svelte:head>

<div class="login-wrapper">
	<div class="login-shell">
		<!-- Brand Header -->
		<header class="login-head">
			<a href="/" class="login-brand" title="Kembali ke beranda">
				<span class="login-brand__mark"></span>
				<span class="login-brand__text">HargaPas</span>
			</a>
			<span class="login-pill">Portal Demo & Uji Coba</span>
		</header>

		<!-- Card Login -->
		<main class="login-card">
			<div class="login-card__intro">
				<h1 class="login-card__title">Masuk ke Dashboard</h1>
				<p class="login-card__sub">
					Kelola 5 komponen HPP, pantau margin sehat, dan jalankan simulasi harga warung.
				</p>
			</div>

			{#if errorMessage}
				<div class="login-alert" role="alert">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10"></circle>
						<line x1="12" y1="8" x2="12" y2="12"></line>
						<line x1="12" y1="16" x2="12.01" y2="16"></line>
					</svg>
					<span>{errorMessage}</span>
				</div>
			{/if}

			<form class="login-form" onsubmit={handleLogin}>
				<div class="login-field">
					<label for="login-id" class="login-label">Email atau Nama Pengguna</label>
					<div class="login-input-wrap">
						<input
							id="login-id"
							type="text"
							class="login-input"
							placeholder="bu.sirep@hargapas.id"
							bind:value={identifier}
							required
							autocomplete="username"
						/>
					</div>
				</div>

				<div class="login-field">
					<div class="login-field__between">
						<label for="login-pass" class="login-label">Kata Sandi</label>
						<button
							type="button"
							class="login-toggle-pass"
							onclick={() => (showPassword = !showPassword)}
						>
							{showPassword ? 'Sembunyikan' : 'Lihat Sandi'}
						</button>
					</div>
					<div class="login-input-wrap">
						<input
							id="login-pass"
							type={showPassword ? 'text' : 'password'}
							class="login-input"
							placeholder="Masukkan kata sandi"
							bind:value={password}
							required
							autocomplete="current-password"
						/>
					</div>
				</div>

				<button
					type="submit"
					class="login-btn login-btn--primary"
					disabled={isLoading}
				>
					{#if isLoading}
						<span class="login-spinner"></span>
						<span>Memverifikasi...</span>
					{:else}
						<span>Masuk ke Dashboard</span>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
							<line x1="5" y1="12" x2="19" y2="12"></line>
							<polyline points="12 5 19 12 12 19"></polyline>
						</svg>
					{/if}
				</button>
			</form>

			<div class="login-switch-reg">
				<p>Belum punya akun warung?</p>
				<a href="/register" class="login-reg-link">Daftar Akun Baru &rarr;</a>
			</div>

			<!-- Hardcoded Demo Accounts Card -->
			<section class="login-demo-box" aria-label="Informasi Akun Uji Coba">
				<div class="login-demo-box__head">
					<span class="login-demo-box__icon">🔑</span>
					<div>
						<h2 class="login-demo-box__title">Akun Uji Coba (Hardcoded)</h2>
						<p class="login-demo-box__desc">Klik tombol di bawah untuk langsung mencoba tanpa perlu mengetik:</p>
					</div>
				</div>

				<div class="login-demo-list">
					<div class="login-demo-item">
						<div class="login-demo-item__info">
							<span class="login-demo-item__tag">Akun Warung</span>
							<strong>bu.sirep@hargapas.id</strong>
							<code>sandi: warung123</code>
						</div>
						<button
							type="button"
							class="login-quick-btn"
							onclick={() => handleQuickFill(0)}
						>
							⚡ Pakai Akun Ini
						</button>
					</div>

					<div class="login-demo-item">
						<div class="login-demo-item__info">
							<span class="login-demo-item__tag">Akun Admin</span>
							<strong>admin</strong>
							<code>sandi: admin123</code>
						</div>
						<button
							type="button"
							class="login-quick-btn"
							onclick={() => handleQuickFill(1)}
						>
							⚡ Pakai Akun Ini
						</button>
					</div>
				</div>
			</section>
		</main>

		<!-- Footer Link -->
		<footer class="login-foot">
			<a href="/" class="login-back-link">
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
	.login-wrapper {
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: clamp(20px, 4vw, 48px) 16px;
		background: #f8f9fa;
		font-family: inherit;
		color: #111111;
	}

	.login-shell {
		width: 100%;
		max-width: 480px;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.login-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-inline: 4px;
	}

	.login-brand {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		text-decoration: none;
		color: #111111;
	}

	.login-brand__mark {
		width: 14px;
		height: 14px;
		background: #ff6b1a;
		border-radius: 3px;
	}

	.login-brand__text {
		font-size: 20px;
		font-weight: 800;
		letter-spacing: -0.03em;
	}

	.login-pill {
		font-size: 12px;
		font-weight: 600;
		color: #ff6b1a;
		background: rgba(255, 107, 26, 0.1);
		padding: 4px 10px;
		border-radius: 9999px;
	}

	.login-card {
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: clamp(24px, 4vw, 36px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.login-card__intro {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.login-card__title {
		font-size: clamp(22px, 3vw, 26px);
		font-weight: 800;
		letter-spacing: -0.03em;
		margin: 0;
		color: #111111;
	}

	.login-card__sub {
		font-size: 14px;
		color: #6b7280;
		margin: 0;
		line-height: 1.5;
	}

	.login-alert {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 14px;
		background: #fff1f2;
		border: 1px solid #fecdd3;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 500;
		color: #e11d48;
	}

	.login-form {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.login-field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.login-field__between {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.login-label {
		font-size: 13px;
		font-weight: 600;
		color: #374151;
	}

	.login-toggle-pass {
		background: none;
		border: 0;
		font-size: 12px;
		font-weight: 600;
		color: #ff6b1a;
		cursor: pointer;
		padding: 0;
	}

	.login-toggle-pass:hover {
		text-decoration: underline;
	}

	.login-input {
		width: 100%;
		height: 44px;
		padding: 0 14px;
		font-size: 15px;
		font-family: inherit;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		background: #ffffff;
		color: #111111;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
		outline: none;
	}

	.login-input:focus {
		border-color: #ff6b1a;
		box-shadow: 0 0 0 3px rgba(255, 107, 26, 0.15);
	}

	.login-btn {
		width: 100%;
		height: 46px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		font-size: 15px;
		font-weight: 700;
		font-family: inherit;
		border-radius: 8px;
		cursor: pointer;
		border: 0;
		transition: background-color 0.15s ease, transform 0.1s ease;
	}

	.login-btn--primary {
		background: #111111;
		color: #ffffff;
	}

	.login-btn--primary:hover:not(:disabled) {
		background: #ff6b1a;
		color: #ffffff;
	}

	.login-btn--primary:active:not(:disabled) {
		transform: scale(0.98);
	}

	.login-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.login-switch-reg {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		font-size: 13.5px;
		color: #6b7280;
	}

	.login-switch-reg p {
		margin: 0;
	}

	.login-reg-link {
		color: #ff6b1a;
		font-weight: 700;
		text-decoration: none;
	}

	.login-reg-link:hover {
		text-decoration: underline;
	}

	.login-spinner {
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

	/* Demo Box */
	.login-demo-box {
		background: #fafafa;
		border: 1px dashed #d1d5db;
		border-radius: 8px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.login-demo-box__head {
		display: flex;
		gap: 10px;
		align-items: flex-start;
	}

	.login-demo-box__icon {
		font-size: 18px;
		line-height: 1;
	}

	.login-demo-box__title {
		font-size: 13px;
		font-weight: 700;
		margin: 0;
		color: #111111;
	}

	.login-demo-box__desc {
		font-size: 12px;
		color: #6b7280;
		margin: 2px 0 0 0;
		line-height: 1.4;
	}

	.login-demo-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.login-demo-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		font-size: 12px;
	}

	.login-demo-item__info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.login-demo-item__tag {
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		color: #ff6b1a;
	}

	.login-demo-item code {
		font-size: 11px;
		color: #6b7280;
		font-family: ui-monospace, monospace;
	}

	.login-quick-btn {
		background: #f3f4f6;
		color: #111111;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		padding: 6px 10px;
		font-size: 11px;
		font-weight: 700;
		cursor: pointer;
		white-space: nowrap;
		transition: background-color 0.15s ease, border-color 0.15s ease;
	}

	.login-quick-btn:hover {
		background: #ff6b1a;
		color: #ffffff;
		border-color: #ff6b1a;
	}

	.login-foot {
		text-align: center;
	}

	.login-back-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		font-weight: 600;
		color: #6b7280;
		text-decoration: none;
		transition: color 0.15s ease;
	}

	.login-back-link:hover {
		color: #ff6b1a;
	}
</style>

