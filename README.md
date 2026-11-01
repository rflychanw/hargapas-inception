# 🍽️ HargaPas — _Harga Pas, Untung Pas_

[![SvelteKit](https://img.shields.io/badge/SvelteKit-3.x-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)](https://kit.svelte.dev/)
[![Svelte 5](https://img.shields.io/badge/Svelte-5_Runes-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)](https://svelte.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16_/_Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Ollama](https://img.shields.io/badge/AI_Advisor-Gemma_4_31B-black?style=for-the-badge&logo=ollama&logoColor=white)](https://ollama.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **Satu dashboard terpadu untuk harga warung dan UMKM kuliner: pencatatan bahan baku presisi, komposisi resep per porsi, kalkulasi HPP deterministik berbasis formula, analisis matriks menu (BCG Matrix), dan Konsultan Bisnis AI interaktif.**

---

## 📌 Daftar Isi

1. [Latar Belakang & Masalah](#-latar-belakang--masalah)
2. [Solusi yang Ditawarkan](#-solusi-yang-ditawarkan)
3. [Arsitektur Sistem & Alur Kerja](#-arsitektur-sistem--alur-kerja)
4. [Fitur-Fitur Utama](#-fitur-fitur-utama)
5. [Tech Stack & Teknologi](#-tech-stack--teknologi)
6. [Struktur Direktori Proyek](#-struktur-direktori-proyek)
7. [Panduan Instalasi & Menjalankan Proyek](#-panduan-instalasi--menjalankan-proyek)
8. [Deklarasi Penggunaan AI (AI Use Declaration)](#-deklarasi-penggunaan-ai-ai-use-declaration)
9. [Deklarasi Pihak Ketiga (Third-Party Declaration)](#-deklarasi-pihak-ketiga-third-party-declaration)
10. [Lisensi & Penulis](#-lisensi--penulis)

---

## 🎯 Latar Belakang & Masalah

Di sektor Usaha Mikro, Kecil, dan Menengah (UMKM) kuliner di Indonesia—seperti warung makan, kedai kopi, kafe rumahan, hingga katering—penentuan harga jual sering kali menjadi jebakan bisnis yang fatal:

1. **Penetapan Harga Berdasarkan "Kira-Kira" / Ikut Kompetitor:** Pemilik usaha sering menetapkan harga hanya dengan melihat warung sebelah, tanpa mengetahui apakah harga tersebut menutup biaya modal sendiri.
2. **HPP yang Samar & Fluktuatif:** Fluktuasi harga komoditas (cabai, telur, minyak goreng, daging) sering menggerus margin tanpa disadari. Warung terlihat sangat ramai pembeli, namun di akhir bulan tidak ada sisa keuntungan bersih (_omzet besar tapi boncos_).
3. **Pencatatan Manual yang Rapuh:** Perhitungan di kertas bon atau spreadsheet terpisah sulit diperbarui saat harga bahan baku grosir naik, dan tidak terhubung langsung dengan resep per porsi menu.
4. **Ketiadaan Konsultan Finansial yang Terjangkau:** Mempekerjakan konsultan bisnis F&B profesional membutuhkan biaya jutaan rupiah yang berada di luar jangkauan pengusaha mikro.

---

## 💡 Solusi yang Ditawarkan

**HargaPas** hadir menjembatani kesenjangan tersebut melalui platform manajemen harga kuliner yang menggabungkan **Mesin Perhitungan Matematis Deterministik** dan **Konsultan Bisnis Berbasis AI**:

- ⚖️ **Pemisahan Tegas antara Hitungan & Rekomendasi:** Angka HPP, margin laba, dan harga ideal dihitung **100% deterministik** di level database PostgreSQL View (_Zero LLM Hallucination_ untuk angka finansial).
- 📊 **Boston Consulting Group (BCG) Menu Matrix:** Mengelompokkan menu secara otomatis menjadi **Star** (margin tebal pelindung profit) dan **Plowhorse** (margin tipis yang butuh penyesuaian porsi, bundling, atau kenaikan harga).
- 🤖 **Konsultan Bisnis AI Kontekstual:** Asisten AI yang memahami data riil menu dan HPP toko untuk memberikan langkah taktis hari ini, tanggapan ramah empatik, serta formulasi paket bundling promo siap pasang.
- ⚡ **Performa Tinggi & Zero-Latency UI:** Memanfaatkan SvelteKit 3 streaming promises dan Svelte 5 Runes untuk navigasi seketika tanpa jeda serverless.

---

## 🏗️ Arsitektur Sistem & Alur Kerja

```mermaid
flowchart TD
    subgraph Klien_Browser["🌐 Antarmuka Pengguna (SvelteKit 3 + Svelte 5 + Tailwind CSS v4)"]
        UI_Landing["Landing Page Edukatif (Lenis Smooth Scroll)"]
        UI_Store["Manajemen Profil Toko & Target Margin"]
        UI_Ing["Input Bahan Baku & Konversi Satuan"]
        UI_Menu["Penyusunan Komposisi Resep Menu"]
        UI_Dash["Dashboard Metrik & Matriks BCG (Star vs Plowhorse)"]
        UI_Advisor["Konsultan AI Multi-Turn Chat"]
    end

    subgraph Server_Backend["⚙️ SvelteKit Server Endpoints & Services"]
        Service_Store["store.ts (Profil & Target Margin)"]
        Service_Ing["ingredients.ts (Auto Cost Per Unit)"]
        Service_Menu["menu.ts (Resep & Relasi)"]
        Service_Analysis["analysis.ts (Ekstraksi View Matriks)"]
        Service_AI["aiAdvisor.ts (Prompt Engineering & Fallback)"]
    end

    subgraph Data_Layer["💾 Penyimpanan & Deterministic Engine"]
        PG_View["PostgreSQL View: view_menu_analysis\n(Perhitungan HPP, Margin, & BCG Matrix)"]
        PG_Tables["PostgreSQL / Neon Cloud DB\n(stores, ingredients, menu_items, recipe_ingredients, advisor_sessions)"]
        Local_Store["Local Heuristic & In-Memory Store\n(Offline Fallback Otomatis)"]
    end

    subgraph AI_Engine["🧠 AI Intelligence Layer"]
        Ollama_API["Ollama Cloud API (gemma4:31b)\nStructured JSON Output"]
        Heuristic_Engine["Local Rule-Based Heuristic Advisor\n(Fail-safe saat kuota habis / offline)"]
    end

    UI_Store --> Service_Store --> PG_Tables
    UI_Ing --> Service_Ing --> PG_Tables
    UI_Menu --> Service_Menu --> PG_Tables
    PG_Tables --> PG_View --> Service_Analysis --> UI_Dash
    UI_Advisor --> Service_AI
    Service_AI -->|Konteks Menu & HPP| Ollama_API
    Ollama_API -.->|Jika API Gagal / Kuota Habis| Heuristic_Engine
    Service_AI -->|Simpan Riwayat Diskusi| PG_Tables
    PG_Tables -.->|Jika DB Tak Terjangkau| Local_Store
```

---

## ✨ Fitur-Fitur Utama

### 1. Landing Page Edukatif & Interaktif

- **Desain Editorial Modern:** Tipografi elegan dengan Schibsted Grotesk, rasio kontras visual tinggi, dan palet warna oranye kuliner hangat.
- **Lenis Smooth Momentum Scroll:** Pengalaman penjelajahan mulus dengan kurva fisika inersia halus pada desktop maupun perangkat bergerak.
- **Staggered Reveal & Parallax:** Elemen masuk bertahap dengan transisi anggun serta dukungan penuh aksesibilitas (`prefers-reduced-motion` dan _keyboard skip-to-dashboard link_).
- **Live Product Showcase:** Menampilkan contoh konkret piring nasi goreng telur balado dengan rincian 5 komponen HPP (Bahan baku, Kemasan, Gas/listrik, Tenaga kerja, Susut/sisa).
- **Transparansi Model Harga:** Perbandingan paket (Coba, Warung, Dapur) dan FAQ interaktif.

### 2. Multi-Store & Target Margin Management

- Kemampuan mengelola lebih dari satu cabang atau profil toko kuliner.
- Pengaturan preset **Target Margin** yang fleksibel:
  - `25%` (Strategi Volume Tinggi / Kantin)
  - `30%` (Standar Rumah Makan)
  - `35%` (Ideal Bisnis Kuliner)
  - `40%` (Kedai Kopi / Minuman Segar)
  - `50%` (Margin Premium / Restoran Spesialis)

### 3. Katalog Bahan Baku & Konversi Satuan Otomatis

- Input pembelian grosir: Nama bahan, harga beli total, satuan beli (`kg`, `liter`, `pcs`, `gram`, `ikat`, dll.), dan kapasitas unit.
- **Kalkulasi Biaya per Unit Terkecil (`cost_per_unit`) Otomatis:** Database menghitung biaya per gram atau per mililiter secara presisi hingga 4 desimal (`purchase_price / unit_capacity`).
- Operasi CRUD bahan baku yang responsif dan aman terhadap relasi resep (_cascade handling_).

### 4. Penyusunan Resep & Perhitungan HPP Dinamis

- Antarmuka perakitan resep: Tambahkan aneka bahan baku ke dalam satu menu porsi dengan takaran gramasi riil.
- Subtotal biaya bahan langsung terakumulasi membentuk **Total HPP Menu**.
- Perhitungan otomatis **Laba Kotor (Profit Amount)** dan **Persentase Margin Riil**.

### 5. Deterministic Mathematical Engine (BCG Menu Matrix)

- **100% Integritas Matematika:** Dijalankan langsung oleh PostgreSQL View `view_menu_analysis`.
- **Klasifikasi Matriks Menu:**
  - 🌟 **Star:** Menu dengan margin di atas atau sama dengan target margin toko (pilar penyangga keuntungan).
  - 🐎 **Plowhorse:** Menu dengan margin di bawah target margin (menu populer namun margin tipis, membutuhkan rekayasa porsi, bundling, atau penyesuaian harga).
- **Kalkulasi Harga Jual Ideal:** Rumus matematis `CEIL(total_hpp / (1 - target_margin))` memberikan rekomendasi batas harga jual minimal untuk mencapai margin target.

### 6. Konsultan Bisnis AI (AI Business Advisor)

- **Percakapan Multi-Turn Berkelanjutan:** Setiap diskusi disimpan dalam sesi terstruktur (`advisor_sessions` dan `advisor_messages`), memungkinkan pemilik warung menindaklanjuti percakapan sebelumnya.
- **Ide Diskusi Siap Pakai (_Prompt Ideas_):**
  - _"Musim hujan bikin warung sepi, stok ayam melimpah"_
  - _"Harga cabai dan minyak naik, gimana atur margin?"_
  - _"Mau buat paket bundling hemat untuk pelajar"_
- **Structured Output Terstandarisasi:**
  1. `friendlyAdvice`: Nasihat ramah 2-3 kalimat yang langsung menjawab inti masalah.
  2. `actionStep`: 1 aksi taktis prioritas yang dapat segera dieksekusi hari ini.
  3. `bundlingRecommendations`: Paket promo menu lengkap dengan nama paket, menu gabungan, saran harga diskon, headline pemasaran persuasif, dan alasan strategisnya.
- **Sistem Batas Kuota Harian:** Perlindungan kuota (5 pertanyaan per hari per toko) untuk efisiensi biaya dan mencegah penyalahgunaan.
- **Resilient Heuristic Fallback:** Jika koneksi API AI luar terputus atau limit tercapai, sistem secara otomatis beralih ke _Rule-Based Heuristic Engine_ lokal tanpa merusak alur kerja pengguna.

### 7. Arsitektur Dual Storage (Cloud PostgreSQL + Offline Fallback)

- Mendukung koneksi TCP PostgreSQL standar maupun driver HTTP Neon Serverless (`@neondatabase/serverless`).
- Dilengkapi penyimpanan lokal file/in-memory fallback (`localStore.ts`) sehingga aplikasi tetap dapat didemokan secara penuh meskipun tanpa koneksi basis data eksternal.

---

## 🛠️ Tech Stack & Teknologi

| Lapisan                | Teknologi                                                                 | Deskripsi / Penggunaan                                                                     |
| :--------------------- | :------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------- |
| **Framework Utama**    | [SvelteKit 3](https://kit.svelte.dev/)                                    | Full-stack meta-framework dengan routing berbasis direktori dan SSR/CSR hibrida.           |
| **Reactivity Core**    | [Svelte 5 (Runes)](https://svelte.dev/)                                   | Reactivity modern menggunakan runes (`$state`, `$derived`, `$effect`, `$props`).           |
| **Styling & Desain**   | [Tailwind CSS v4](https://tailwindcss.com/)                               | Engine utility-first CSS generasi terbaru dengan kompilasi instan via `@tailwindcss/vite`. |
| **Smooth Motion**      | [Lenis](https://github.com/darkroomengineering/lenis)                     | Animasi scroll momentum berbasis fisika inersia yang ringan dan responsif.                 |
| **Ikonografi**         | [Lucide Svelte](https://lucide.dev/)                                      | Koleksi ikon SVG modern, konsisten, dan ringan.                                            |
| **Tipografi**          | [Schibsted Grotesk](https://fonts.google.com/specimen/Schibsted+Grotesk)  | Variable font sans-serif dengan legibilitas tinggi untuk data angka finansial.             |
| **Basis Data**         | [PostgreSQL 16](https://www.postgresql.org/) / [Neon](https://neon.tech/) | RDBMS utama dengan dukungan pgcrypto UUID dan SQL generated column.                        |
| **Database Clients**   | `postgres.js` & `@neondatabase/serverless`                                | Driver native TCP berkinerja tinggi serta adapter HTTP serverless.                         |
| **AI Intelligence**    | [Ollama Cloud API](https://ollama.com/)                                   | Model `gemma4:31b` untuk konsultasi bisnis F&B dengan output JSON terstruktur.             |
| **Tooling & Language** | TypeScript & [Vite 8](https://vitejs.dev/)                                | Type safety penuh, kecepatan HMR ultra-cepat, dan build produksi optimal.                  |

---

## 📂 Struktur Direktori Proyek

```text
hargapas-inception/
├── scripts/
│   ├── migrate.ts                # Skrip migrasi schema dan seeding database
│   └── schema.sql                # Definisi tabel PostgreSQL & VIEW view_menu_analysis
├── src/
│   ├── app.css                   # Konfigurasi Tailwind CSS v4 & custom font
│   ├── app.d.ts                  # Deklarasi tipe global SvelteKit
│   ├── env.ts                    # Validasi runtime environment variables
│   ├── lib/
│   │   ├── components/           # Komponen UI modular
│   │   │   ├── Hero.svelte       # Hero section dengan live showcase card
│   │   │   ├── HppList.svelte    # Rincian 5 komponen HPP kuliner
│   │   │   ├── Consultant.svelte # Showcase interaktif Konsultan AI
│   │   │   ├── Navbar.svelte     # Navigasi utama dengan anchor jump
│   │   │   ├── Steps.svelte      # 3 langkah cara kerja HargaPas
│   │   │   ├── Pricing.svelte    # Tabel paket langganan
│   │   │   ├── Faq.svelte        # Tanya jawab seputar margin & HPP
│   │   │   ├── SEO.svelte        # Meta tag SEO & OpenGraph dinamis
│   │   │   └── ...               # Komponen form (NumberInput, SelectInput, dll.)
│   │   ├── server/               # Layanan backend & database
│   │   │   ├── db.ts             # Koneksi PostgreSQL (Dual mode: Neon/TCP)
│   │   │   ├── localStore.ts     # Fallback in-memory storage untuk demo offline
│   │   │   ├── otpStore.ts       # Manajemen OTP in-memory
│   │   │   └── services/         # Business logic layer
│   │   │       ├── aiAdvisor.ts  # Layanan integrasi LLM & heuristic fallback
│   │   │       ├── analysis.ts   # Pengambilan data kalkulasi view_menu_analysis
│   │   │       ├── businessAdvice.ts # Manajemen riwayat sesi percakapan
│   │   │       ├── ingredients.ts# Layanan CRUD bahan baku & biaya unit
│   │   │       ├── menu.ts       # Layanan CRUD menu & komposisi resep
│   │   │       └── store.ts      # Layanan CRUD profil toko & target margin
│   │   ├── types/
│   │   │   └── database.ts       # Definisi interface TypeScript (Store, Menu, HPP)
│   │   ├── utils/
│   │   │   └── format.ts         # Formatter Rupiah (IDR) & persentase margin
│   │   ├── data.js               # Mock data awal untuk landing page
│   │   └── scroll.js             # Integrasi Lenis smooth scroll & parallax
│   └── routes/
│       ├── +layout.svelte        # Root layout (Font loading & global setup)
│       ├── +page.svelte          # Landing page utama
│       └── stores/
│           ├── +page.svelte      # Manajemen pemilihan & pembuatan toko
│           └── [storeId]/
│               ├── dashboard/    # Metrik finansial, target margin, & matriks menu
│               ├── ingredients/  # Manajemen daftar bahan baku grosir
│               ├── menu/         # Daftar menu, status Star/Plowhorse, & resep
│               └── advisor/      # Antarmuka chat Konsultan Bisnis AI
├── static/                       # Aset publik (Favicon, logo SVG, gambar ilustrasi)
├── package.json                  # Konfigurasi dependensi dan npm scripts
├── tsconfig.json                 # Konfigurasi TypeScript compiler
└── vite.config.ts                # Konfigurasi bundler Vite dengan plugin Svelte & Tailwind
```

---

## 🚀 Panduan Instalasi & Menjalankan Proyek

### Prasyarat Sistem

- [Node.js](https://nodejs.org/) versi `20.x` atau lebih baru
- [PostgreSQL](https://www.postgresql.org/) (opsional jika menggunakan Neon Cloud atau mode Local Fallback)
- Package manager `npm` atau `pnpm`

### 1. Kloning Repositori

```bash
git clone https://github.com/username/hargapas-inception.git
cd hargapas-inception
```

### 2. Instalasi Dependensi

```bash
npm install
```

### 3. Konfigurasi Environment Variables

Salin berkas `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Sesuaikan variabel lingkungan di dalam file `.env`:

```env
# Koneksi PostgreSQL (bisa lokal atau Neon Cloud URL)
DATABASE_URL=postgres://postgres:postgres@localhost:5432/hargapas

# Kunci API Ollama Cloud untuk fitur AI Advisor (Opsional - Heuristic fallback aktif jika kosong)
OLLAMA_API_KEY=your_ollama_api_key_here
```

### 4. Eksekusi Migrasi Basis Data

Jalankan migrasi skema tabel dan kalkulasi matematis VIEW:

```bash
# Menjalankan migrasi skema tabel & view
npm run db:migrate
```

_(Catatan: Jika PostgreSQL belum terpasang atau sedang offline, sistem HargaPas memiliki ketahanan otomatis yang akan mengalihkan penyimpanan sementara ke `localStore.ts` sehingga aplikasi tetap dapat dijalankan untuk pengujian)._

### 5. Jalankan Server Development

```bash
npm run dev
```

Buka peramban Anda dan akses:
👉 `http://localhost:5173`

### 6. Build untuk Produksi

```bash
npm run build
npm run preview
```

---

## 🤖 Deklarasi Penggunaan AI (AI Use Declaration)

Sesuai dengan prinsip integritas akademik, keterbukaan kompetisi, dan etika kecerdasan buatan, berikut deklarasi resmi pemanfaatan AI dalam proyek **HargaPas**:

### 1. Pemanfaatan AI dalam Fitur Produk (_Runtime AI Feature_)

- **Model AI yang Digunakan:** Model Large Language Model **Gemma 4 31B** (`gemma4:31b`) yang diakses melalui layanan inferensi resmi Ollama API (`https://ollama.com/api/chat`).
- **Peran & Tanggung Jawab AI:**
  - Berperan sebagai **Konsultan Bisnis F&B Virtual** (_Culinary Business Advisor_).
  - Menghasilkan nasihat empati ramah, langkah taktis prioritas harian, dan rekomendasi paket bundling promosi berdasarkan situasi kontekstual yang dihadapi pemilik warung.
- **Prinsip Zero-Hallucination pada Finansial:**
  - **AI TIDAK diperkenankan melakukan kalkulasi matematika HPP, biaya per unit, profit, maupun persentase margin.**
  - Seluruh perhitungan finansial dilakukan secara deterministik oleh mesin database PostgreSQL (`view_menu_analysis`).
  - AI hanya menerima konteks metrik yang telah divalidasi matematis sebagai masukan (_read-only prompt context_) untuk menghasilkan strategi pemasaran dan copy promosi.
- **Pemberlakuan Guardrails & Format Terstruktur:**
  - Menggunakan skema JSON ketat (_JSON schema enforcement_) untuk memastikan respon selalu memuat atribut `friendlyAdvice`, `actionStep`, dan `bundlingRecommendations` tanpa teks liar atau halusinasi format.
- **Fail-Safe Heuristic Engine:**
  - Apabila koneksi internet/API Ollama tidak tersedia atau kuota harian habis, sistem secara otomatis beralih ke mesin heuristik lokal berbasis aturan (_Rule-Based Heuristic Fallback_). Pengguna tetap mendapatkan rekomendasi actionable tanpa pernah mengalami error sistem.

### 2. Pemanfaatan AI dalam Proses Pengembangan (_Development Process_)

- AI digunakan sebagai alat bantu pendukung (_pair-programming assistant_) selama proses perancangan dan pengembangan:
  - Pembuatan draf struktur skema basis data relasional SQL.
  - Brainstorming variasi resep dan formula margin kuliner Indonesia.
  - Optimasi aksesibilitas ARIA dan transisi kurva fisika pada komponen antarmuka.
  - Penyusunan draf dokumentasi teknis komprehensif.
- **Verifikasi Manusia (Human-in-the-Loop):** Seluruh kode program, logika resep, formula SQL view, arsitektur serverless, dan keputusan desain telah ditinjau, diuji, dan disempurnakan secara langsung oleh tim pengembang manusia.

---

## 📦 Deklarasi Pihak Ketiga (Third-Party Declaration)

Aplikasi **HargaPas** dibangun dengan memanfaatkan komponen, pustaka terbuka (_open-source_), dan layanan pihak ketiga berikut:

### 1. Pustaka Perangkat Lunak & Framework

| Komponen / Pustaka           | Pemilik / Pembuat    | Lisensi                                                   | Peran dalam Proyek                                                   |
| :--------------------------- | :------------------- | :-------------------------------------------------------- | :------------------------------------------------------------------- |
| **Svelte & SvelteKit**       | Svelte Team          | [MIT](https://opensource.org/licenses/MIT)                | Framework inti frontend reaktif dan server routing hibrida.          |
| **Tailwind CSS v4**          | Tailwind Labs Inc.   | [MIT](https://opensource.org/licenses/MIT)                | Framework utilitas CSS untuk tata letak dan desain visual responsif. |
| **Lenis**                    | Darkroom Engineering | [MIT](https://opensource.org/licenses/MIT)                | Library smooth scrolling momentum berbasis inersia fisika.           |
| **Lucide Svelte**            | Lucide Project       | [ISC](https://opensource.org/licenses/ISC)                | Koleksi ikon grafis vektor UI.                                       |
| **postgres (Postgres.js)**   | Rasmus Porsager      | [MIT](https://opensource.org/licenses/MIT)                | Driver klien PostgreSQL TCP berkecepatan tinggi untuk Node.js.       |
| **@neondatabase/serverless** | Neon Inc.            | [Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0) | Driver HTTP serverless untuk koneksi komputasi cloud Neon.           |
| **Nodemailer**               | Andris Reinman       | [MIT](https://opensource.org/licenses/MIT)                | Utilitas pengiriman email transaksional / OTP verifikasi.            |

### 2. Aset Tipografi & Desain

| Aset                     | Sumber / Pencipta                                      | Lisensi                                                  | Keterangan                                                                           |
| :----------------------- | :----------------------------------------------------- | :------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| **Schibsted Grotesk**    | The Schibsted Grotesk Project                          | [SIL Open Font License 1.1](https://scripts.sil.org/OFL) | Font sans-serif utama aplikasi untuk tampilan angka dan teks yang jelas.             |
| **Ilustrasi Vektor SVG** | [unDraw](https://undraw.co/) oleh Katerina Limpitsouni | [unDraw Open License](https://undraw.co/license)         | Bebas digunakan untuk kebutuhan komersial maupun non-komersial tanpa atribusi wajib. |

### 3. Layanan Cloud & API Eksternal

| Layanan                      | Penyedia    | Fungsi                                                                    |
| :--------------------------- | :---------- | :------------------------------------------------------------------------ |
| **Ollama API**               | Ollama Inc. | Penyedia layanan inferensi model bahasa kecerdasan buatan (_AI Advisor_). |
| **Neon Serverless Postgres** | Neon, Inc.  | Penyedia infrastruktur basis data PostgreSQL cloud serverless.            |

---

## 📄 Lisensi & Penulis

Proyek ini dikembangkan di bawah lisensi **MIT License**. Anda bebas menggunakan, memodifikasi, dan mendistribusikan kode ini untuk tujuan edukasi, kompetisi, maupun pengembangan komersial.

```text
Copyright (c) 2026 Tim HargaPas (Inception)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

<p align="center">
  Dibuat dengan ❤️ dan dedikasi untuk memajukan UMKM kuliner Indonesia.<br/>
  <b>Harga Pas, Untung Pas.</b>
</p>
