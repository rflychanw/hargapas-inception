<script lang="ts">
	import Logo from '#lib/components/Logo.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import {
		registerUser,
		getRegisteredUsers,
		getCurrentUser
	} from '#lib/auth.js';

	// Step 1: Form Registrasi, Step 2: 6-Kotak Verifikasi OTP
	let step = $state<'form' | 'verify'>('form');

	let name = $state('');
	let storeName = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let targetMargin = $state(30);

	let showPassword = $state(false);
	let showConfirmPassword = $state(false);

	// 6 Kotak Input OTP
	let otpBoxes = $state(['', '', '', '', '', '']);
	let otpInputRefs: HTMLInputElement[] = [];

	let errorMessage = $state('');
	let successNotice = $state('');
	let isLoading = $state(false);

	// Resend countdown timer
	let resendCooldown = $state(0);
	let countdownInterval: any = null;

	onMount(() => {
		const existingUser = getCurrentUser();
		if (existingUser) {
			goto('/dashboard');
		}
	});

	onDestroy(() => {
		if (countdownInterval) clearInterval(countdownInterval);
	});

	function startCooldown(seconds: number = 30) {
		resendCooldown = seconds;
		if (countdownInterval) clearInterval(countdownInterval);
		countdownInterval = setInterval(() => {
			if (resendCooldown > 0) {
				resendCooldown -= 1;
			} else {
				clearInterval(countdownInterval);
			}
		}, 1000);
	}

	async function requestOtpEmail(targetEmail: string, ownerName: string, store: string) {
		try {
			const res = await fetch('/api/send-otp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: targetEmail,
					name: ownerName,
					storeName: store,
					purpose: 'register'
				})
			});
			const data = await res.json();
			if (data.success) {
				return { success: true, message: data.message };
			}
			return { success: false, message: data.message || 'Gagal mengirim kode OTP ke Gmail.' };
		} catch (err: any) {
			return { success: false, message: 'Gagal menghubungi server untuk mengirim email OTP.' };
		}
	}

	async function handleStep1Submit(e?: SubmitEvent) {
		if (e) e.preventDefault();
		errorMessage = '';
		successNotice = '';

		const cleanName = name.trim();
		const cleanStore = storeName.trim();
		const cleanEmail = email.trim().toLowerCase();
		const cleanPass = password.trim();
		const cleanConfirm = confirmPassword.trim();

		if (!cleanName) {
			errorMessage = 'Nama lengkap wajib diisi.';
			return;
		}
		if (!cleanStore) {
			errorMessage = 'Nama warung atau toko wajib diisi.';
			return;
		}
		if (!cleanEmail || !cleanEmail.includes('@')) {
			errorMessage = 'Alamat email tidak valid.';
			return;
		}
		if (cleanPass.length < 6) {
			errorMessage = 'Kata sandi minimal 6 karakter demi keamanan akun.';
			return;
		}
		if (cleanPass !== cleanConfirm) {
			errorMessage = 'Verifikasi kata sandi tidak cocok. Harap periksa kembali.';
			return;
		}

		// Cek apakah email sudah terdaftar
		const existingList = getRegisteredUsers();
		const exists = existingList.some(
			(u) =>
				u.username.toLowerCase() === cleanEmail ||
				(u.profile && u.profile.email.toLowerCase() === cleanEmail)
		);
		if (exists) {
			errorMessage = 'Email ini sudah terdaftar. Silakan langsung masuk di halaman login.';
			return;
		}

		isLoading = true;
		const otpResult = await requestOtpEmail(cleanEmail, cleanName, cleanStore);
		isLoading = false;

		if (otpResult.success) {
			step = 'verify';
			otpBoxes = ['', '', '', '', '', ''];
			startCooldown(30);
			successNotice = otpResult.message || `Kode OTP 6-digit telah dikirim langsung ke Gmail Anda (${cleanEmail}). Cek kotak masuk atau spam!`;

			// Fokus otomatis ke kotak OTP pertama
			setTimeout(() => {
				if (otpInputRefs[0]) otpInputRefs[0].focus();
			}, 100);
		} else {
			errorMessage = otpResult.message;
		}
	}

	async function handleResendOtp() {
		if (resendCooldown > 0 || isLoading) return;
		errorMessage = '';
		successNotice = '';

		const cleanEmail = email.trim().toLowerCase();
		const cleanName = name.trim();
		const cleanStore = storeName.trim();

		isLoading = true;
		const otpResult = await requestOtpEmail(cleanEmail, cleanName, cleanStore);
		isLoading = false;

		if (otpResult.success) {
			otpBoxes = ['', '', '', '', '', ''];
			startCooldown(30);
			successNotice = otpResult.message || `Kode OTP baru telah berhasil dikirim ke ${cleanEmail}.`;
			if (otpInputRefs[0]) otpInputRefs[0].focus();
		} else {
			errorMessage = otpResult.message;
		}
	}

	// Logika Interaksi 6 Kotak OTP
	function handleOtpInput(index: number, e: Event) {
		const target = e.target as HTMLInputElement;
		const val = target.value.replace(/\D/g, ''); // Hanya terima angka
		otpBoxes[index] = val ? val[val.length - 1] : '';

		if (val && index < 5 && otpInputRefs[index + 1]) {
			otpInputRefs[index + 1].focus();
		}
	}

	function handleOtpKeydown(index: number, e: KeyboardEvent) {
		if (e.key === 'Backspace' && !otpBoxes[index] && index > 0 && otpInputRefs[index - 1]) {
			otpInputRefs[index - 1].focus();
		} else if (e.key === 'ArrowLeft' && index > 0 && otpInputRefs[index - 1]) {
			otpInputRefs[index - 1].focus();
		} else if (e.key === 'ArrowRight' && index < 5 && otpInputRefs[index + 1]) {
			otpInputRefs[index + 1].focus();
		}
	}

	function handleOtpPaste(e: ClipboardEvent) {
		e.preventDefault();
		const pasted = e.clipboardData?.getData('text') || '';
		const digits = pasted.replace(/\D/g, '').slice(0, 6);
		if (!digits) return;

		for (let i = 0; i < 6; i++) {
			otpBoxes[i] = digits[i] || '';
		}

		const nextFocusIndex = Math.min(digits.length, 5);
		if (otpInputRefs[nextFocusIndex]) {
			otpInputRefs[nextFocusIndex].focus();
		}
	}

	async function handleVerifyAndRegister(e?: SubmitEvent) {
		if (e) e.preventDefault();
		errorMessage = '';

		const fullOtp = otpBoxes.join('').trim();
		const cleanEmail = email.trim().toLowerCase();

		if (fullOtp.length < 6) {
			errorMessage = 'Harap lengkapi seluruh 6 digit kode OTP.';
			return;
		}

		isLoading = true;
		try {
			const verifyRes = await fetch('/api/verify-otp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: cleanEmail,
					code: fullOtp,
					purpose: 'register'
				})
			});
			const verifyData = await verifyRes.json();
			if (!verifyData.valid) {
				isLoading = false;
				errorMessage = verifyData.message || 'Kode OTP tidak valid atau kedaluwarsa.';
				return;
			}

			// Pendaftaran berhasil diverifikasi secara nyata
			const result = registerUser({
				name: name.trim(),
				email: cleanEmail,
				password: password.trim(),
				storeName: storeName.trim(),
				targetMargin: Number(targetMargin) || 30
			});

			if (result.success) {
				goto('/dashboard');
			} else {
				errorMessage = result.error || 'Pendaftaran gagal. Silakan coba kembali.';
				isLoading = false;
			}
		} catch (err: any) {
			isLoading = false;
			errorMessage = 'Gagal memverifikasi kode OTP ke server.';
		}
	}
</script>

<svelte:head>
	<title>Daftar Akun Warung — HargaPas</title>
	<meta
		name="description"
		content="Daftar akun HargaPas: Decision engine kalkulasi HPP presisi dan simulator harga warung UMKM."
	/>
</svelte:head>

<div class="auth-page">
	<div class="auth-card-shell">
		<!-- Header Bersih (Tanpa Tulisan Data Warung / Verifikasi Gmail) -->
		<header class="auth-card-head">
			<a href="/" class="brand-link" title="Kembali ke Beranda HargaPas">
				<Logo size={36} variant="horizontal" theme="light" />
			</a>
			<h1 class="auth-title">
				{step === 'form' ? 'Daftar Akun Warung Baru' : 'Verifikasi Kode OTP'}
			</h1>
			<p class="auth-subtitle">
				{step === 'form'
					? 'Mulai kalkulasi HPP presisi, amankan margin untung, dan hindari jual rugi.'
					: 'Masukkan 6 digit kode OTP yang kami kirimkan ke email Anda.'}
			</p>
		</header>

		<!-- Card Utama -->
		<main class="auth-card">
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

			{#if successNotice}
				<div class="alert alert--info" role="alert">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10"></circle>
						<line x1="12" y1="16" x2="12" y2="12"></line>
						<line x1="12" y1="8" x2="12.01" y2="8"></line>
					</svg>
					<span>{successNotice}</span>
				</div>
			{/if}

			{#if step === 'form'}
				<!-- TAHAP 1: FORMULIR DATA PENGGUNA & TOKO -->
				<form class="auth-form" onsubmit={handleStep1Submit}>
					<!-- Nama Lengkap & Nama Warung/Toko -->
					<div class="form-row-2">
						<div class="form-group">
							<label for="reg-name" class="form-label">Nama Lengkap</label>
							<input
								id="reg-name"
								type="text"
								class="form-input"
								placeholder="Misal: Budi Santoso"
								bind:value={name}
								required
								autocomplete="name"
							/>
						</div>

						<div class="form-group">
							<label for="reg-store" class="form-label">Nama Warung / Toko</label>
							<input
								id="reg-store"
								type="text"
								class="form-input"
								placeholder="Misal: Warung Berkah"
								bind:value={storeName}
								required
							/>
						</div>
					</div>

					<!-- Alamat Email (Gmail) -->
					<div class="form-group">
						<label for="reg-email" class="form-label">Alamat Email (Gmail)</label>
						<input
							id="reg-email"
							type="email"
							class="form-input"
							placeholder="namaanda@gmail.com"
							bind:value={email}
							required
							autocomplete="email"
						/>
					</div>

					<!-- Kata Sandi & Verifikasi Kata Sandi -->
					<div class="form-row-2">
						<div class="form-group">
							<label for="reg-password" class="form-label">Kata Sandi</label>
							<div class="password-input-wrapper">
								<input
									id="reg-password"
									type={showPassword ? 'text' : 'password'}
									class="form-input form-input--password"
									placeholder="Minimal 6 karakter"
									bind:value={password}
									required
									autocomplete="new-password"
								/>
								<button
									type="button"
									class="eye-icon-btn"
									onclick={() => (showPassword = !showPassword)}
									aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
									title={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
								>
									{#if showPassword}
										<!-- Eye off -->
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
						</div>

						<div class="form-group">
							<label for="reg-confirm-password" class="form-label">Verifikasi Kata Sandi</label>
							<div class="password-input-wrapper">
								<input
									id="reg-confirm-password"
									type={showConfirmPassword ? 'text' : 'password'}
									class="form-input form-input--password"
									placeholder="Ulangi kata sandi"
									bind:value={confirmPassword}
									required
									autocomplete="new-password"
								/>
								<button
									type="button"
									class="eye-icon-btn"
									onclick={() => (showConfirmPassword = !showConfirmPassword)}
									aria-label={showConfirmPassword ? 'Sembunyikan verifikasi sandi' : 'Lihat verifikasi sandi'}
									title={showConfirmPassword ? 'Sembunyikan verifikasi sandi' : 'Lihat verifikasi sandi'}
								>
									{#if showConfirmPassword}
										<!-- Eye off -->
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
						</div>
					</div>

					<!-- Target Margin Keuntungan Awal -->
					<div class="form-group">
						<div class="label-row">
							<label for="reg-margin" class="form-label">Target Margin Keuntungan</label>
							<span class="margin-badge">{targetMargin}% Target Laba</span>
						</div>
						<input
							id="reg-margin"
							type="range"
							min="15"
							max="65"
							step="5"
							class="margin-slider"
							bind:value={targetMargin}
						/>
						<span class="field-hint">
							{targetMargin <= 25
								? 'Standar perputaran cepat & volume tinggi.'
								: targetMargin <= 35
									? 'Standar ideal UMKM kuliner: seimbang pembeli & laba warung.'
									: 'Optimal untuk kategori minuman, kopi, atau camilan berprofit tebal.'}
						</span>
					</div>

					<!-- Tombol Lanjutkan ke Verifikasi -->
					<button type="submit" class="submit-btn" disabled={isLoading}>
						{#if isLoading}
							<span class="btn-spinner"></span>
							<span>Mengirim Kode OTP ke Gmail...</span>
						{:else}
							<span>Lanjutkan ke Verifikasi Email</span>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
								<line x1="5" y1="12" x2="19" y2="12"></line>
								<polyline points="12 5 19 12 12 19"></polyline>
							</svg>
						{/if}
					</button>
				</form>
			{:else}
				<!-- TAHAP 2: 6 KOTAK VERIFIKASI OTP & RESEND BUTTON -->
				<div class="verify-step-shell">
					<div class="verify-icon-wrap">
						<div class="verify-mail-badge">
							<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FF6B1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<rect width="20" height="16" x="2" y="4" rx="2" />
								<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
							</svg>
						</div>
					</div>

					<p class="verify-instruction">
						Kode OTP 6 digit telah dikirimkan ke alamat email:
						<br />
						<strong class="verify-target-email">{email}</strong>
					</p>

					<form class="auth-form" onsubmit={handleVerifyAndRegister}>
						<div class="form-group" style="align-items: center;">
							<label for="otp-box-0" class="form-label" style="text-align: center; margin-bottom: 6px;">
								Masukkan 6 Digit Kode OTP
							</label>

							<!-- 6 Kotak Input OTP -->
							<div class="otp-grid" onpaste={handleOtpPaste} role="group" aria-label="6 digit kode OTP">
								{#each otpBoxes as _, idx}
									<input
										id="otp-box-{idx}"
										type="text"
										inputmode="numeric"
										pattern="[0-9]*"
										maxlength="1"
										class="otp-box"
										bind:value={otpBoxes[idx]}
										bind:this={otpInputRefs[idx]}
										oninput={(e) => handleOtpInput(idx, e)}
										onkeydown={(e) => handleOtpKeydown(idx, e)}
										aria-label="Digit ke-{idx + 1}"
									/>
								{/each}
							</div>
						</div>

						<button
							type="submit"
							class="submit-btn"
							disabled={isLoading || otpBoxes.join('').length < 6}
						>
							{#if isLoading}
								<span class="btn-spinner"></span>
								<span>Mengaktifkan Akun...</span>
							{:else}
								<span>Verifikasi & Masuk ke Dashboard</span>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
									<line x1="5" y1="12" x2="19" y2="12"></line>
									<polyline points="12 5 19 12 12 19"></polyline>
								</svg>
							{/if}
						</button>

						<!-- Resend OTP & Kembali Ubah Data -->
						<div class="otp-action-row">
							<button
								type="button"
								class="sub-btn"
								onclick={() => (step = 'form')}
							>
								&larr; Ubah Data / Email
							</button>

							<button
								type="button"
								class="resend-btn {resendCooldown > 0 ? 'resend-btn--disabled' : ''}"
								onclick={handleResendOtp}
								disabled={resendCooldown > 0 || isLoading}
							>
								{#if resendCooldown > 0}
									<span>Kirim Ulang OTP ({resendCooldown}s)</span>
								{:else}
									<span>Kirim Ulang OTP</span>
								{/if}
							</button>
						</div>
					</form>
				</div>
			{/if}

			<!-- Switch ke Login -->
			<div class="auth-card-footer">
				<p>Sudah punya akun warung?</p>
				<a href="/login" class="signup-link">Masuk di sini &rarr;</a>
			</div>
		</main>

		<!-- Footer Link -->
		<footer class="page-footer">
			<a href="/" class="back-link">&larr; Kembali ke Beranda</a>
		</footer>
	</div>
</div>

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
		max-width: 460px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 18px;
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
		max-width: 380px;
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

	.form-row-2 {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 12px;
		width: 100%;
		box-sizing: border-box;
	}
	@media (max-width: 580px) {
		.form-row-2 {
			grid-template-columns: 1fr;
		}
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
		width: 100%;
		box-sizing: border-box;
	}

	.label-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
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

	/* Hilangkan ikon mata bawaan Edge/Chrome */
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

	.field-hint {
		font-size: 11.5px;
		color: #64748b;
		line-height: 1.4;
	}

	/* Slider Target Margin */
	.margin-badge {
		font-size: 12px;
		font-weight: 700;
		color: #ff6b1a;
		background: #fff7ed;
		padding: 2px 8px;
		border-radius: 6px;
	}

	.margin-slider {
		width: 100%;
		accent-color: #ff6b1a;
		cursor: pointer;
		margin: 4px 0;
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
		margin-top: 4px;
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
	.alert--info {
		background: #eff6ff;
		border: 1px solid #bfdbfe;
		color: #2563eb;
	}

	/* Step 2: 6 Kotak OTP Styles */
	.verify-step-shell {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		text-align: center;
		width: 100%;
		box-sizing: border-box;
	}

	.verify-icon-wrap {
		display: flex;
		justify-content: center;
	}

	.verify-mail-badge {
		width: 58px;
		height: 58px;
		border-radius: 50%;
		background: #fff7ed;
		border: 1px solid #fed7aa;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.verify-instruction {
		font-size: 13.5px;
		color: #475569;
		line-height: 1.5;
		margin: 0;
	}

	.verify-target-email {
		color: #111111;
		font-size: 14.5px;
	}

	/* 6 Kotak Input OTP Grid */
	.otp-grid {
		display: flex;
		justify-content: center;
		gap: 8px;
		width: 100%;
		margin: 4px 0 10px 0;
	}

	.otp-box {
		width: 48px;
		height: 54px;
		border: 1.5px solid #cbd5e1;
		border-radius: 10px;
		font-size: 24px;
		font-weight: 800;
		text-align: center;
		font-family: ui-monospace, monospace;
		color: #111111;
		background: #ffffff;
		outline: none;
		transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease;
		box-sizing: border-box;
	}
	.otp-box:focus {
		border-color: #ff6b1a;
		box-shadow: 0 0 0 3px rgba(255, 107, 26, 0.15);
		transform: scale(1.04);
	}

	@media (max-width: 400px) {
		.otp-grid {
			gap: 6px;
		}
		.otp-box {
			width: 40px;
			height: 48px;
			font-size: 20px;
		}
	}

	/* Aksi Resend & Ubah Data */
	.otp-action-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding-top: 4px;
	}

	.sub-btn {
		background: transparent;
		border: 0;
		padding: 4px 0;
		font-size: 12.5px;
		font-weight: 600;
		color: #64748b;
		cursor: pointer;
		transition: color 0.15s ease;
	}
	.sub-btn:hover {
		color: #111111;
	}

	.resend-btn {
		background: transparent;
		border: 0;
		padding: 4px 0;
		font-size: 12.5px;
		font-weight: 700;
		color: #ff6b1a;
		cursor: pointer;
		transition: opacity 0.15s ease;
	}
	.resend-btn:hover:not(:disabled) {
		text-decoration: underline;
	}
	.resend-btn--disabled {
		color: #94a3b8;
		cursor: not-allowed;
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
