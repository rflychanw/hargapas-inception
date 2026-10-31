<script lang="ts">
	import Logo from '#lib/components/Logo.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { resetPassword, getCurrentUser, getRegisteredUsers } from '#lib/auth.js';

	// Tampilan: 'email' | 'otp' | 'password' | 'success'
	let currentView = $state<'email' | 'otp' | 'password' | 'success'>('email');

	let email = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let showNewPass = $state(false);
	let showConfirmPass = $state(false);

	// 6 Kotak Input OTP
	let otpBoxes = $state(['', '', '', '', '', '']);
	let otpInputRefs = $state<HTMLInputElement[]>([]);
	let isOtpVerified = $state(false);
	let newPasswordInputRef = $state<HTMLInputElement | null>(null);

	let errorMessage = $state('');
	let successNotice = $state('');
	let isLoading = $state(false);

	// Resend timer hitung mundur
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

	// 1. Kirim Kode Pemulihan ke Gmail
	async function handleSendResetEmail(e?: SubmitEvent) {
		if (e) e.preventDefault();
		errorMessage = '';
		successNotice = '';

		const cleanEmail = email.trim().toLowerCase();
		if (!cleanEmail || !cleanEmail.includes('@')) {
			errorMessage = 'Masukkan alamat email yang valid.';
			return;
		}

		// Cek apakah akun terdaftar di sistem
		const users = getRegisteredUsers();
		const exists = users.some(
			(u) =>
				u.username.toLowerCase() === cleanEmail ||
				(u.profile && u.profile.email.toLowerCase() === cleanEmail)
		);
		if (!exists) {
			errorMessage = 'Akun dengan alamat email tersebut tidak ditemukan.';
			return;
		}

		isLoading = true;
		try {
			const res = await fetch('/api/send-otp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: cleanEmail,
					purpose: 'reset'
				})
			});
			const data = await res.json();
			isLoading = false;

			if (data.success) {
				currentView = 'otp';
				otpBoxes = ['', '', '', '', '', ''];
				isOtpVerified = false;
				startCooldown(30);
				successNotice = data.message || `Kode verifikasi telah dikirim ke ${cleanEmail}. Periksa kotak masuk atau spam email Anda!`;

				setTimeout(() => {
					if (otpInputRefs[0]) otpInputRefs[0].focus();
				}, 100);
			} else {
				errorMessage = data.message || 'Gagal mengirim email reset kata sandi.';
			}
		} catch (err: any) {
			isLoading = false;
			errorMessage = 'Gagal menghubungi server untuk mengirim kode reset.';
		}
	}

	// Kirim Ulang OTP
	async function handleResendResetCode() {
		if (resendCooldown > 0 || isLoading) return;
		errorMessage = '';
		successNotice = '';

		const cleanEmail = email.trim().toLowerCase();
		isLoading = true;
		try {
			const res = await fetch('/api/send-otp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: cleanEmail,
					purpose: 'reset'
				})
			});
			const data = await res.json();
			isLoading = false;

			if (data.success) {
				otpBoxes = ['', '', '', '', '', ''];
				startCooldown(30);
				successNotice = data.message || `Kode reset baru telah dikirimkan ke ${cleanEmail}.`;
				if (otpInputRefs[0]) otpInputRefs[0].focus();
			} else {
				errorMessage = data.message || 'Gagal mengirim ulang kode reset.';
			}
		} catch (err) {
			isLoading = false;
			errorMessage = 'Gagal menghubungi server untuk kirim ulang kode.';
		}
	}

	// Navigasi 6 Kotak Input OTP
	function handleOtpInput(index: number, e: Event) {
		const target = e.target as HTMLInputElement;
		const val = target.value.replace(/\D/g, '');
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

	// 2. Verifikasi Kode OTP (Hanya verifikasi OTP)
	async function handleVerifyOtp(e?: SubmitEvent) {
		if (e) e.preventDefault();
		errorMessage = '';
		successNotice = '';

		const fullOtp = otpBoxes.join('').trim();
		const cleanEmail = email.trim().toLowerCase();

		if (fullOtp.length < 6) {
			errorMessage = 'Harap masukkan 6 digit kode OTP secara lengkap.';
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
					purpose: 'reset'
				})
			});
			const verifyData = await verifyRes.json();
			isLoading = false;

			if (!verifyData.valid) {
				errorMessage = verifyData.message || 'Kode OTP tidak valid atau kedaluwarsa.';
				return;
			}

			// OTP Valid -> Lanjut ke input kata sandi baru
			isOtpVerified = true;
			currentView = 'password';
			errorMessage = '';
			successNotice = '';

			setTimeout(() => {
				if (newPasswordInputRef) newPasswordInputRef.focus();
			}, 100);
		} catch (err: any) {
			isLoading = false;
			errorMessage = 'Gagal menghubungi server untuk memverifikasi kode OTP.';
		}
	}

	// 3. Simpan Kata Sandi Baru
	async function handleSaveNewPassword(e?: SubmitEvent) {
		if (e) e.preventDefault();
		errorMessage = '';

		if (!isOtpVerified) {
			errorMessage = 'Sesi verifikasi tidak valid. Harap verifikasi kode OTP terlebih dahulu.';
			currentView = 'otp';
			return;
		}

		const cleanEmail = email.trim().toLowerCase();
		const cleanPass = newPassword.trim();
		const cleanConfirm = confirmPassword.trim();

		if (cleanPass.length < 6) {
			errorMessage = 'Kata sandi baru minimal 6 karakter demi keamanan akun.';
			return;
		}

		if (cleanPass !== cleanConfirm) {
			errorMessage = 'Konfirmasi kata sandi tidak cocok. Harap periksa kembali.';
			return;
		}

		isLoading = true;
		try {
			const result = resetPassword(cleanEmail, cleanPass);
			isLoading = false;
			if (result.success) {
				currentView = 'success';
			} else {
				errorMessage = result.message || 'Gagal memperbarui kata sandi.';
			}
		} catch (err: any) {
			isLoading = false;
			errorMessage = 'Gagal memperbarui kata sandi.';
		}
	}

	function handleChangeEmail() {
		currentView = 'email';
		errorMessage = '';
		successNotice = '';
		isOtpVerified = false;
		otpBoxes = ['', '', '', '', '', ''];
	}
</script>

<svelte:head>
	<title>Lupa Kata Sandi — HargaPas</title>
	<meta
		name="description"
		content="Atur ulang kata sandi akun HargaPas Anda dengan aman melalui verifikasi kode OTP Gmail."
	/>
</svelte:head>

<div class="auth-page">
	<div class="auth-card-shell">
		<!-- Brand & Header -->
		<header class="auth-card-head">
			<a href="/" class="brand-link" title="Kembali ke Beranda HargaPas">
				<Logo size={36} variant="horizontal" theme="light" />
			</a>
			<h1 class="auth-title">
				{#if currentView === 'email'}
					Lupa Kata Sandi
				{:else if currentView === 'otp'}
					Verifikasi Kode OTP
				{:else if currentView === 'password'}
					Buat Kata Sandi Baru
				{:else}
					Kata Sandi Berhasil Diperbarui
				{/if}
			</h1>
			<p class="auth-subtitle">
				{#if currentView === 'email'}
					Masukkan alamat email akun Anda untuk menerima kode OTP pemulihan kata sandi.
				{:else if currentView === 'otp'}
					Masukkan 6 digit kode verifikasi yang telah kami kirimkan ke email Anda.
				{:else if currentView === 'password'}
					Tentukan kata sandi baru untuk mengamankan akun HargaPas Anda.
				{:else}
					Akun Anda siap digunakan kembali dengan kata sandi baru.
				{/if}
			</p>
		</header>

		<!-- Card Utama -->
		<main class="auth-card">
			<!-- Alert Error -->
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

			<!-- Alert Info -->
			{#if successNotice && currentView !== 'success'}
				<div class="alert alert--info" role="alert">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10"></circle>
						<line x1="12" y1="16" x2="12.01" y2="16"></line>
						<path d="M12 8h.01"></path>
					</svg>
					<span>{successNotice}</span>
				</div>
			{/if}

			{#if currentView === 'email'}
				<!-- Form Input Email -->
				<form class="auth-form" onsubmit={handleSendResetEmail}>
					<div class="form-group">
						<label for="forgot-email" class="form-label">Alamat Email Terdaftar</label>
						<input
							id="forgot-email"
							type="email"
							class="form-input"
							placeholder="namaanda@gmail.com"
							bind:value={email}
							required
							autocomplete="email"
						/>
					</div>

					<button type="submit" class="submit-btn" disabled={isLoading || !email.includes('@')}>
						{#if isLoading}
							<span class="btn-spinner"></span>
							<span>Mengirim Kode ke Gmail...</span>
						{:else}
							<span>Kirim Kode Pemulihan &rarr;</span>
						{/if}
					</button>
				</form>

				<div class="auth-card-footer">
					<p>Ingat kata sandi Anda?</p>
					<a href="/login" class="back-login-link">Kembali ke Halaman Masuk &rarr;</a>
				</div>
			{:else if currentView === 'otp'}
				<!-- Form Input Kode OTP Saja -->
				<div class="verify-shell">
					<p class="verify-instruction">
						Kode verifikasi 6 digit telah dikirimkan ke:
						<br />
						<strong class="verify-target-email">{email}</strong>
					</p>

					<form class="auth-form" onsubmit={handleVerifyOtp}>
						<!-- 6 Kotak OTP -->
						<div class="form-group" style="align-items: center;">
							<label for="otp-box-0" class="form-label" style="text-align: center; margin-bottom: 6px;">
								Masukkan 6 Digit Kode OTP
							</label>

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

						<button type="submit" class="submit-btn" disabled={isLoading || otpBoxes.join('').length < 6}>
							{#if isLoading}
								<span class="btn-spinner"></span>
								<span>Memverifikasi Kode...</span>
							{:else}
								<span>Verifikasi Kode &rarr;</span>
							{/if}
						</button>

						<!-- Aksi Resend & Ubah Email -->
						<div class="verify-action-footer">
							<button
								type="button"
								class="change-email-btn"
								onclick={handleChangeEmail}
							>
								&larr; Ubah Email
							</button>

							<button
								type="button"
								class="resend-btn {resendCooldown > 0 ? 'resend-btn--disabled' : ''}"
								onclick={handleResendResetCode}
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
			{:else if currentView === 'password'}
				<!-- Form Buat Kata Sandi Baru -->
				<form class="auth-form" onsubmit={handleSaveNewPassword}>
					<div class="form-group">
						<label for="new-pass" class="form-label">Kata Sandi Baru</label>
						<div class="password-input-wrapper">
							<input
								id="new-pass"
								type={showNewPass ? 'text' : 'password'}
								class="form-input form-input--password"
								placeholder="Minimal 6 karakter"
								bind:value={newPassword}
								bind:this={newPasswordInputRef}
								required
								autocomplete="new-password"
							/>
							<button
								type="button"
								class="eye-icon-btn"
								onclick={() => (showNewPass = !showNewPass)}
								aria-label={showNewPass ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
								title={showNewPass ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
							>
								{#if showNewPass}
									<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
										<path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
										<path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
										<line x1="2" y1="2" x2="22" y2="22" />
									</svg>
								{:else}
									<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
										<circle cx="12" cy="12" r="3" />
									</svg>
								{/if}
							</button>
						</div>
					</div>

					<div class="form-group">
						<label for="confirm-pass" class="form-label">Konfirmasi Kata Sandi Baru</label>
						<div class="password-input-wrapper">
							<input
								id="confirm-pass"
								type={showConfirmPass ? 'text' : 'password'}
								class="form-input form-input--password"
								placeholder="Ulangi kata sandi baru"
								bind:value={confirmPassword}
								required
								autocomplete="new-password"
							/>
							<button
								type="button"
								class="eye-icon-btn"
								onclick={() => (showConfirmPass = !showConfirmPass)}
								aria-label={showConfirmPass ? 'Sembunyikan verifikasi sandi' : 'Lihat verifikasi sandi'}
								title={showConfirmPass ? 'Sembunyikan verifikasi sandi' : 'Lihat verifikasi sandi'}
							>
								{#if showConfirmPass}
									<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
										<path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
										<path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
										<line x1="2" y1="2" x2="22" y2="22" />
									</svg>
								{:else}
									<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
										<circle cx="12" cy="12" r="3" />
									</svg>
								{/if}
							</button>
						</div>
					</div>

					<button type="submit" class="submit-btn" disabled={isLoading}>
						{#if isLoading}
							<span class="btn-spinner"></span>
							<span>Menyimpan Sandi Baru...</span>
						{:else}
							<span>Simpan Kata Sandi Baru &rarr;</span>
						{/if}
					</button>
				</form>
			{:else}
				<!-- Tampilan Sukses -->
				<div class="success-box">
					<div class="success-icon-wrap">
						<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
					</div>
					<h2 class="success-title">Kata Sandi Berhasil Diperbarui</h2>
					<p class="success-desc">
						Kata sandi akun Anda telah berhasil diubah. Silakan masuk kembali menggunakan kata sandi baru Anda.
					</p>
					<a href="/login?reset=success" class="submit-btn" style="text-decoration: none;">
						<span>Masuk ke Dashboard Sekarang &rarr;</span>
					</a>
				</div>
			{/if}
		</main>

		<!-- Footer Link -->
		<footer class="page-footer">
			<a href="/login" class="back-link">&larr; Kembali ke Halaman Masuk</a>
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
		max-width: 440px;
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

	/* Card Utama */
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

	.btn-spinner {
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

	/* Verifikasi & 6 Kotak OTP */
	.verify-shell {
		display: flex;
		flex-direction: column;
		gap: 16px;
		align-items: center;
		width: 100%;
		box-sizing: border-box;
	}

	.verify-instruction {
		font-size: 13.5px;
		color: #475569;
		margin: 0;
		line-height: 1.5;
		text-align: center;
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
		width: 46px;
		height: 52px;
		text-align: center;
		font-size: 22px;
		font-weight: 800;
		font-family: inherit;
		color: #111111;
		background: #ffffff;
		border: 1.5px solid #cbd5e1;
		border-radius: 10px;
		outline: none;
		transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease;
		box-sizing: border-box;
	}
	.otp-box:focus {
		border-color: #ff6b1a;
		box-shadow: 0 0 0 3px rgba(255, 107, 26, 0.16);
		transform: translateY(-1px);
	}

	@media (max-width: 400px) {
		.otp-grid {
			gap: 5px;
		}
		.otp-box {
			width: 38px;
			height: 46px;
			font-size: 18px;
		}
	}

	/* Footer Aksi Verifikasi */
	.verify-action-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		margin-top: 4px;
		padding-top: 10px;
		border-top: 1px solid #f1f5f9;
	}

	.change-email-btn {
		background: none;
		border: 0;
		color: #64748b;
		font-size: 12.5px;
		font-weight: 600;
		cursor: pointer;
		padding: 4px 0;
		transition: color 0.15s ease;
	}
	.change-email-btn:hover {
		color: #111111;
	}

	.resend-btn {
		background: none;
		border: 0;
		color: #ff6b1a;
		font-size: 12.5px;
		font-weight: 700;
		cursor: pointer;
		padding: 4px 0;
		transition: opacity 0.15s ease;
	}
	.resend-btn--disabled {
		color: #94a3b8;
		cursor: not-allowed;
	}

	/* Sukses Box */
	.success-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 12px 6px;
		gap: 14px;
	}

	.success-icon-wrap {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		background: #dcfce7;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.success-title {
		font-size: 18px;
		font-weight: 800;
		color: #111111;
		margin: 0;
	}

	.success-desc {
		font-size: 13.5px;
		color: #64748b;
		margin: 0;
		line-height: 1.5;
	}

	/* Footer Card */
	.auth-card-footer {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		font-size: 13px;
		color: #64748b;
		border-top: 1px solid #f1f5f9;
		padding-top: 14px;
		margin: 0;
	}
	.auth-card-footer p {
		margin: 0;
	}

	.back-login-link {
		color: #ff6b1a;
		font-weight: 700;
		text-decoration: none;
		transition: color 0.15s ease;
	}
	.back-login-link:hover {
		text-decoration: underline;
	}

	/* Alerts */
	.alert {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 11px 14px;
		border-radius: 9px;
		font-size: 13px;
		font-weight: 500;
		line-height: 1.45;
		box-sizing: border-box;
	}
	.alert--error {
		background: #fef2f2;
		border: 1px solid #fee2e2;
		color: #b91c1c;
	}
	.alert--info {
		background: #eff6ff;
		border: 1px solid #dbeafe;
		color: #1d4ed8;
	}

	.page-footer {
		text-align: center;
		margin-top: 4px;
	}

	.back-link {
		font-size: 13px;
		font-weight: 600;
		color: #64748b;
		text-decoration: none;
		transition: color 0.15s ease;
	}
	.back-link:hover {
		color: #ff6b1a;
	}
</style>
