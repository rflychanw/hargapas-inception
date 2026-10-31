<script lang="ts">
	import Logo from '#lib/components/Logo.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import {
		authenticate,
		loginWithGoogle,
		getCurrentUser
	} from '#lib/auth.js';

	// Parameter URL jika baru mendaftar atau baru mereset kata sandi
	const queryEmail = page.url.searchParams.get('email') || '';
	const registeredMsg = page.url.searchParams.get('registered') === 'true';
	const resetMsg = page.url.searchParams.get('reset') === 'success';

	let identifier = $state(queryEmail);
	let password = $state('');
	let showPassword = $state(false);

	let errorMessage = $state('');
	let successMessage = $state(
		registeredMsg
			? 'Pendaftaran berhasil! Silakan masuk ke akun Anda.'
			: resetMsg
				? 'Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.'
				: ''
	);
	let isLoading = $state(false);

	// Modal Panduan Setup Google OAuth (Jika CLIENT_ID belum ada di .env)
	let showGoogleSetupModal = $state(false);
	let isGoogleLoading = $state(false);

	onMount(() => {
		const existingUser = getCurrentUser();
		if (existingUser) {
			goto('/dashboard');
		}
	});

	function handleLogin(e?: SubmitEvent) {
		if (e) e.preventDefault();
		errorMessage = '';
		successMessage = '';

		const cleanId = identifier.trim();
		const cleanPass = password.trim();

		if (!cleanId || !cleanPass) {
			errorMessage = 'Silakan isi email/username dan kata sandi Anda.';
			return;
		}

		isLoading = true;

		setTimeout(() => {
			const user = authenticate(cleanId, cleanPass);
			if (user) {
				goto('/dashboard');
			} else {
				errorMessage = 'Kredensial tidak cocok. Periksa kembali email dan kata sandi Anda.';
				isLoading = false;
			}
		}, 350);
	}

	async function handleGoogleLoginClick() {
		errorMessage = '';
		isGoogleLoading = true;

		// 1. Ambil Google Client ID dari server
		let clientId = '';
		try {
			const res = await fetch('/api/auth/google-config');
			const data = await res.json();
			clientId = data.clientId || '';
		} catch (e) {
			// ignore
		}

		if (!clientId) {
			isGoogleLoading = false;
			showGoogleSetupModal = true;
			return;
		}

		// 2. Cek apakah layanan Google Identity Services sudah siap di browser
		const googleAuth = typeof window !== 'undefined' ? (window as any).google?.accounts?.oauth2 : null;
		if (!googleAuth) {
			isGoogleLoading = false;
			errorMessage = 'Sedang memuat layanan Google Sign-In. Harap tunggu sebentar lalu coba lagi.';
			return;
		}

		// 3. Buka jendela popup login resmi Google (OAuth 2.0)
		try {
			const tokenClient = googleAuth.initTokenClient({
				client_id: clientId,
				scope: 'openid profile email',
				callback: async (tokenResponse: any) => {
					if (tokenResponse.error) {
						isGoogleLoading = false;
						if (tokenResponse.error !== 'popup_closed_by_user') {
							errorMessage = 'Gagal masuk dengan akun Google: ' + tokenResponse.error;
						}
						return;
					}

					if (tokenResponse.access_token) {
						try {
							// 4. Ambil profil asli langsung dari endpoint Google resmi
							const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
								headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
							});
							const googleUser = await userInfoRes.json();

							if (googleUser && googleUser.email) {
								const cleanEmail = googleUser.email.toLowerCase().trim();
								const realName = googleUser.name || googleUser.given_name || cleanEmail.split('@')[0];
								const firstName = (googleUser.given_name || realName).split(' ')[0] || 'Kuliner';

								const res = loginWithGoogle({
									email: cleanEmail,
									name: realName,
									picture: googleUser.picture || '',
									storeName: `Warung ${firstName}`,
									targetMargin: 30
								});

								if (res.success) {
									goto('/dashboard');
								} else {
									errorMessage = 'Gagal membuat sesi masuk dengan akun Google.';
									isGoogleLoading = false;
								}
							} else {
								errorMessage = 'Tidak dapat mengambil profil dari akun Google.';
								isGoogleLoading = false;
							}
						} catch (err: any) {
							isGoogleLoading = false;
							errorMessage = 'Terjadi kesalahan saat memproses data akun Google.';
						}
					}
				}
			});

			tokenClient.requestAccessToken({ prompt: 'select_account' });
			isGoogleLoading = false;
		} catch (err: any) {
			isGoogleLoading = false;
			errorMessage = 'Gagal menginisialisasi Google Sign-In: ' + (err?.message || 'Error');
		}
	}
</script>

<svelte:head>
	<title>Masuk ke Dashboard — HargaPas</title>
	<meta
		name="description"
		content="Portal login HargaPas: Kelola HPP presisi, margin laba, dan simulasi harga warung UMKM."
	/>
	<script src="https://accounts.google.com/gsi/client" async defer></script>
</svelte:head>

<div class="auth-page">
	<div class="auth-card-shell">
		<!-- Brand & Header -->
		<header class="auth-card-head">
			<a href="/" class="brand-link" title="Kembali ke Beranda HargaPas">
				<Logo size={36} variant="horizontal" theme="light" />
			</a>
			<h1 class="auth-title">Masuk ke Dashboard</h1>
			<p class="auth-subtitle">
				Kelola 5 komponen HPP, pantau margin sehat, dan jalankan simulasi harga warung.
			</p>
		</header>

		<!-- Card Utama -->
		<main class="auth-card">
			<!-- Alert Pesan Sukses / Error -->
			{#if successMessage}
				<div class="alert alert--success" role="alert">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
						<polyline points="22 4 12 14.01 9 11.01"></polyline>
					</svg>
					<span>{successMessage}</span>
				</div>
			{/if}

			{#if errorMessage}
				<div class="alert alert--error" role="alert">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10"></circle>
						<line x1="12" y1="8" x2="12" y2="12"></line>
						<line x1="12" y1="16" x2="12.01" y2="16"></line>
					</svg>
					<span>{errorMessage}</span>
				</div>
			{/if}

			<!-- Form Login Utama (Email & Kata Sandi) -->
			<form class="auth-form" onsubmit={handleLogin}>
				<div class="form-group">
					<label for="login-email" class="form-label">Email atau Nama Pengguna</label>
					<input
						id="login-email"
						type="text"
						class="form-input"
						placeholder="nama@email.com atau username"
						bind:value={identifier}
						required
						autocomplete="username"
					/>
				</div>

				<div class="form-group">
					<label for="login-password" class="form-label">Kata Sandi</label>
					<div class="password-input-wrapper">
						<input
							id="login-password"
							type={showPassword ? 'text' : 'password'}
							class="form-input form-input--password"
							placeholder="Masukkan kata sandi akun"
							bind:value={password}
							required
							autocomplete="current-password"
						/>
						<button
							type="button"
							class="eye-icon-btn"
							onclick={() => (showPassword = !showPassword)}
							aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
							title={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
						>
							{#if showPassword}
								<!-- Eye off (slashed) -->
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
									<path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
									<path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
									<line x1="2" y1="2" x2="22" y2="22" />
								</svg>
							{:else}
								<!-- Eye open -->
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
									<circle cx="12" cy="12" r="3" />
								</svg>
							{/if}
						</button>
					</div>
					<div class="forgot-pass-row">
						<a
							href="/forgot-password"
							class="forgot-link-btn"
						>
							Lupa kata sandi?
						</a>
					</div>
				</div>

				<button type="submit" class="submit-btn" disabled={isLoading}>
					{#if isLoading}
						<span class="btn-spinner"></span>
						<span>Memproses Masuk...</span>
					{:else}
						<span>Masuk ke Dashboard</span>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
							<line x1="5" y1="12" x2="19" y2="12"></line>
							<polyline points="12 5 19 12 12 19"></polyline>
						</svg>
					{/if}
				</button>
			</form>

			<!-- Divider -->
			<div class="auth-divider">
				<span class="auth-divider__line"></span>
				<span class="auth-divider__text">atau masuk dengan</span>
				<span class="auth-divider__line"></span>
			</div>

			<!-- Tombol Login Google Asli -->
			<button
				type="button"
				class="google-btn"
				onclick={handleGoogleLoginClick}
				disabled={isLoading || isGoogleLoading}
			>
				{#if isGoogleLoading}
					<span class="btn-spinner btn-spinner--dark"></span>
					<span>Menghubungkan ke Google...</span>
				{:else}
					<svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
						<path
							fill="#4285F4"
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
						/>
						<path
							fill="#34A853"
							d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						/>
						<path
							fill="#FBBC05"
							d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
						/>
						<path
							fill="#EA4335"
							d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
						/>
					</svg>
					<span>Masuk dengan Akun Google</span>
				{/if}
			</button>

			<!-- Switch ke Register -->
			<div class="auth-card-footer">
				<p>Belum punya akun warung?</p>
				<a href="/register" class="signup-link">Daftar Akun Baru &rarr;</a>
			</div>
		</main>

		<!-- Footer Link -->
		<footer class="page-footer">
			<a href="/" class="back-link">&larr; Kembali ke Beranda</a>
		</footer>
	</div>
</div>

<!-- Modal Dialog Panduan Aktivasi Google Sign-In (OAuth Asli) -->
{#if showGoogleSetupModal}
	<div
		class="modal-backdrop"
		onclick={() => (showGoogleSetupModal = false)}
		onkeydown={(e) => {
			if (e.key === 'Escape') showGoogleSetupModal = false;
		}}
		role="presentation"
		tabindex="-1"
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="modal-card"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<div class="modal-head">
				<svg viewBox="0 0 24 24" width="24" height="24">
					<path
						fill="#4285F4"
						d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
					/>
					<path
						fill="#34A853"
						d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
					/>
					<path
						fill="#FBBC05"
						d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
					/>
					<path
						fill="#EA4335"
						d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
					/>
				</svg>
				<h2 class="modal-title">Aktivasi Google Sign-In Asli</h2>
				<button
					type="button"
					class="modal-close-btn"
					onclick={() => (showGoogleSetupModal = false)}
					aria-label="Tutup dialog"
				>
					&times;
				</button>
			</div>

			<p class="modal-desc">
				Untuk membuka jendela masuk resmi Google, masukkan <strong>OAuth Client ID</strong> dari Google Cloud Console ke file konfigurasi Anda:
			</p>

			<div class="setup-guide-box">
				<p class="setup-guide-title">1. Buka file <code>.env</code> di root proyek dan isi baris:</p>
				<div class="code-box">
					<code>PUBLIC_GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com</code>
				</div>

				<div class="setup-steps">
					<p class="setup-step-item">
						<strong>Cara buat Client ID (Gratis 2 menit):</strong>
					</p>
					<p class="setup-step-item">
						&bull; Kunjungi <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" class="ext-link">Google Cloud Console Credentials &rarr;</a>
					</p>
					<p class="setup-step-item">
						&bull; Klik <strong>Create Credentials &rarr; OAuth Client ID</strong> (tipe <em>Web Application</em>).
					</p>
					<p class="setup-step-item">
						&bull; Isi <strong>Authorized JavaScript origins</strong>: <code>http://localhost:5173</code>
					</p>
					<p class="setup-step-item">
						&bull; Salin Client ID ke <code>.env</code>, lalu klik tombol masuk Google kembali untuk langsung masuk dengan akun asli Anda.
					</p>
				</div>
			</div>

			<div class="modal-actions-row" style="margin-top: 14px;">
				<button
					type="button"
					class="submit-btn"
					onclick={() => (showGoogleSetupModal = false)}
				>
					Mengerti & Tutup
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Halaman & Container Utama */
	.auth-page {
		min-height: 100vh;
		width: 100%;
		background: #f8fafc;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: clamp(20px, 4vw, 40px) 16px;
		font-family: inherit;
		color: #111111;
		box-sizing: border-box;
		overflow-x: hidden;
	}

	.auth-card-shell {
		width: 100%;
		max-width: 440px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 20px;
		box-sizing: border-box;
		min-width: 0;
	}

	/* Header */
	.auth-card-head {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		width: 100%;
		box-sizing: border-box;
	}

	.brand-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		text-decoration: none;
		margin-bottom: 6px;
		transition: transform 0.15s ease;
	}
	.brand-link:hover {
		transform: scale(1.02);
	}

	.auth-title {
		font-size: clamp(21px, 4.5vw, 24px);
		font-weight: 800;
		letter-spacing: -0.03em;
		margin: 0;
		color: #111111;
		text-align: center;
	}

	.auth-subtitle {
		font-size: 13.5px;
		color: #64748b;
		margin: 0;
		line-height: 1.5;
		width: 100%;
		max-width: 360px;
		text-align: center;
		box-sizing: border-box;
	}

	/* Card Utama - Bersih dengan Border Halus Terang */
	.auth-card {
		width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
		min-width: 0;
		background: #ffffff;
		border: 1px solid #e2e8f0;
		border-radius: 16px;
		padding: clamp(22px, 5vw, 28px) clamp(16px, 4vw, 24px);
		box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02);
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	/* Form Elements */
	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 16px;
		width: 100%;
		box-sizing: border-box;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
		width: 100%;
		box-sizing: border-box;
	}

	.form-label {
		font-size: 13px;
		font-weight: 600;
		color: #334155;
	}

	.form-input {
		width: 100%;
		height: 44px;
		padding: 0 14px;
		font-size: 14.5px;
		font-family: inherit;
		color: #111111;
		background: #ffffff;
		border: 1px solid #e2e8f0;
		border-radius: 9px;
		outline: none;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
		box-sizing: border-box;
	}
	.form-input:focus {
		border-color: #ff6b1a;
		box-shadow: 0 0 0 3px rgba(255, 107, 26, 0.12);
	}

	/* Password Input with Eye Icon */
	.password-input-wrapper {
		position: relative;
		width: 100%;
		display: flex;
		align-items: center;
		box-sizing: border-box;
	}

	.form-input--password {
		padding-right: 42px;
	}

	:global(input::-ms-reveal),
	:global(input::-ms-clear),
	.form-input--password::-ms-reveal,
	.form-input--password::-ms-clear {
		display: none !important;
		width: 0 !important;
		height: 0 !important;
	}

	.eye-icon-btn {
		position: absolute;
		right: 10px;
		top: 50%;
		transform: translateY(-50%);
		background: transparent;
		border: 0;
		padding: 5px;
		color: #94a3b8;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		transition: color 0.15s ease, background-color 0.15s ease;
	}
	.eye-icon-btn:hover {
		color: #111111;
		background: #f1f5f9;
	}

	/* Lupa Sandi di Bawah Input */
	.forgot-pass-row {
		display: flex;
		justify-content: flex-end;
		margin-top: 2px;
	}

	.forgot-link-btn {
		background: none;
		border: 0;
		padding: 2px 0;
		font-size: 12.5px;
		font-weight: 600;
		color: #64748b;
		cursor: pointer;
		transition: color 0.15s ease;
	}
	.forgot-link-btn:hover {
		color: #ff6b1a;
		text-decoration: underline;
	}

	/* Submit Button */
	.submit-btn {
		width: 100%;
		height: 46px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		background: #ff6b1a;
		color: #ffffff;
		border: 0;
		border-radius: 9px;
		font-size: 14.5px;
		font-weight: 700;
		cursor: pointer;
		transition: background-color 0.15s ease, transform 0.1s ease;
		box-shadow: 0 2px 8px rgba(255, 107, 26, 0.25);
		box-sizing: border-box;
	}
	.submit-btn:hover:not(:disabled) {
		background: #e65a0d;
	}
	.submit-btn:active:not(:disabled) {
		transform: scale(0.99);
	}
	.submit-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* Divider */
	.auth-divider {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
	}

	.auth-divider__line {
		flex: 1;
		height: 1px;
		background: #e2e8f0;
	}

	.auth-divider__text {
		font-size: 12px;
		color: #94a3b8;
		font-weight: 500;
		text-transform: lowercase;
	}

	/* Tombol Google SSO (Di Bagian Bawah) */
	.google-btn {
		width: 100%;
		height: 46px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		background: #ffffff;
		border: 1px solid #e2e8f0;
		border-radius: 10px;
		font-size: 14.5px;
		font-weight: 600;
		color: #1e293b;
		cursor: pointer;
		transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
		box-sizing: border-box;
	}
	.google-btn:hover:not(:disabled) {
		background: #f8fafc;
		border-color: #cbd5e1;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
	}
	.google-icon {
		flex-shrink: 0;
	}

	/* Alerts */
	.alert {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 14px;
		border-radius: 8px;
		font-size: 13px;
		line-height: 1.4;
		box-sizing: border-box;
		width: 100%;
	}
	.alert--error {
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #dc2626;
	}
	.alert--success {
		background: #f0fdf4;
		border: 1px solid #bbf7d0;
		color: #16a34a;
	}

	/* Card Footer */
	.auth-card-footer {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		font-size: 13px;
		color: #64748b;
		padding-top: 6px;
		border-top: 1px solid #f1f5f9;
	}
	.auth-card-footer p {
		margin: 0;
	}
	.signup-link {
		color: #ff6b1a;
		font-weight: 700;
		text-decoration: none;
	}
	.signup-link:hover {
		text-decoration: underline;
	}

	/* Page Footer */
	.page-footer {
		text-align: center;
	}
	.back-link {
		font-size: 13px;
		font-weight: 600;
		color: #64748b;
		text-decoration: none;
		transition: color 0.15s ease;
	}
	.back-link:hover {
		color: #111111;
	}

	.btn-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.4);
		border-top-color: #ffffff;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Modal Dialogs */
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(17, 17, 17, 0.5);
		backdrop-filter: blur(3px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
		z-index: 1000;
	}

	.modal-card {
		background: #ffffff;
		border-radius: 16px;
		width: 100%;
		max-width: 420px;
		padding: 24px;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
		display: flex;
		flex-direction: column;
		gap: 16px;
		box-sizing: border-box;
	}

	.modal-head {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.modal-title {
		font-size: 17px;
		font-weight: 700;
		margin: 0;
		flex: 1;
		color: #111111;
	}

	.modal-close-btn {
		background: transparent;
		border: 0;
		font-size: 22px;
		line-height: 1;
		color: #94a3b8;
		cursor: pointer;
		padding: 4px;
	}
	.modal-close-btn:hover {
		color: #111111;
	}

	.modal-desc {
		font-size: 13px;
		color: #64748b;
		margin: 0;
		line-height: 1.45;
	}

	.modal-actions-row {
		display: flex;
		gap: 10px;
		align-items: center;
	}

	/* Setup Guide Box (Jika Google Client ID belum diatur) */
	.setup-guide-box {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 10px;
		padding: 14px 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		text-align: left;
	}

	.setup-guide-title {
		font-size: 12.5px;
		font-weight: 600;
		color: #334155;
		margin: 0;
	}

	.code-box {
		background: #0f172a;
		color: #38bdf8;
		padding: 9px 12px;
		border-radius: 6px;
		font-family: ui-monospace, monospace;
		font-size: 11px;
		overflow-x: auto;
		word-break: break-all;
	}

	.setup-steps {
		display: flex;
		flex-direction: column;
		gap: 5px;
		margin-top: 4px;
	}

	.setup-step-item {
		font-size: 11.5px;
		color: #475569;
		margin: 0;
		line-height: 1.5;
	}

	.ext-link {
		color: #ff6b1a;
		font-weight: 600;
		text-decoration: underline;
	}

	.btn-spinner--dark {
		border-color: rgba(0, 0, 0, 0.15);
		border-top-color: #ff6b1a;
	}

	/* Responsive Mobile (< 480px) */
	@media (max-width: 480px) {
		.auth-page {
			padding: 20px 14px;
		}
		.auth-card {
			padding: 24px 18px;
			border-radius: 14px;
		}
		.auth-title {
			font-size: 22px;
		}
	}
</style>
