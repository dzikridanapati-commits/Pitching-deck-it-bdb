# BDB Deck Agent — Panduan Deploy ke Vercel

## Apa Ini?

Web app internal Banana Digital Boost untuk generate konten pitching deck secara otomatis menggunakan AI. Tim tinggal isi form step-by-step, klik Generate, dan langsung dapat konten deck yang siap dimasukkan ke Google Slides.

---

## Yang Kamu Butuhkan

1. **Akun GitHub** — gratis di github.com
2. **Akun Vercel** — gratis di vercel.com (login pakai GitHub)
3. **Anthropic API Key** — dari console.anthropic.com
4. **Node.js** — install dari nodejs.org (versi 18+)

---

## Step-by-Step Deploy

### STEP 1: Dapatkan Anthropic API Key

1. Buka https://console.anthropic.com
2. Sign up / Login
3. Klik **API Keys** di sidebar
4. Klik **Create Key**
5. Copy key-nya (format: `sk-ant-api03-xxxx...`)
6. **Simpan baik-baik** — key ini hanya ditampilkan sekali

> **Biaya:** API Claude berbayar per penggunaan. Estimasi ~$0.01-0.05 per generate deck (sangat murah). Anthropic kasih credit gratis untuk akun baru.

### STEP 2: Upload Project ke GitHub

**Opsi A — Lewat GitHub.com (Tanpa Terminal):**

1. Buka https://github.com/new
2. Isi repository name: `bdb-deck-agent`
3. Set ke **Private** (penting karena ini internal)
4. Klik **Create repository**
5. Klik **uploading an existing file**
6. Drag & drop SEMUA file dari folder `bdb-deck-agent` yang aku berikan
7. Klik **Commit changes**

**Opsi B — Lewat Terminal (Lebih Cepat):**

```bash
cd bdb-deck-agent
git init
git add .
git commit -m "Initial commit - BDB Deck Agent"
git branch -M main
git remote add origin https://github.com/USERNAME-KAMU/bdb-deck-agent.git
git push -u origin main
```

### STEP 3: Deploy ke Vercel

1. Buka https://vercel.com dan login dengan GitHub
2. Klik **"Add New..."** > **"Project"**
3. Cari repo `bdb-deck-agent` > klik **Import**
4. Di halaman konfigurasi:
   - Framework Preset: otomatis detect **Vite** (biarkan)
   - Root Directory: biarkan default
5. Klik **Environment Variables** (penting!)
6. Tambahkan:
   - Key: `VITE_ANTHROPIC_API_KEY`
   - Value: paste API key dari Step 1 (`sk-ant-api03-xxxx...`)
7. Klik **Deploy**
8. Tunggu ~1-2 menit sampai deploy selesai
9. Kamu akan dapat URL seperti: `bdb-deck-agent.vercel.app`

### STEP 4: Custom Domain (Opsional)

Kalau mau pakai domain sendiri seperti `deck.bananadigital.com`:

1. Di Vercel dashboard > project > **Settings** > **Domains**
2. Tambahkan domain kamu
3. Ikuti instruksi DNS yang diberikan Vercel
4. Selesai!

### STEP 5: Share ke Tim

Kirim URL Vercel ke tim:
```
Hey tim, ini tool baru untuk generate pitching deck otomatis:
https://bdb-deck-agent.vercel.app

Cara pakai:
1. Pilih jenis jasa
2. Isi info client sebisanya
3. Klik Generate
4. Copy hasilnya ke Google Slides template kita
```

---

## Struktur File

```
bdb-deck-agent/
  index.html          # Entry point
  package.json        # Dependencies
  vite.config.js      # Build config
  .env.example        # Contoh environment variable
  .gitignore          # File yang tidak di-push
  public/
    favicon.svg       # Icon browser tab
  src/
    main.jsx          # React entry
    App.jsx           # Main app (semua logic ada di sini)
```

---

## FAQ & Troubleshooting

### "API Key belum diset"
Pastikan environment variable `VITE_ANTHROPIC_API_KEY` sudah ditambahkan di Vercel:
- Dashboard > Project > Settings > Environment Variables

### "CORS Error" di browser
Ini karena Anthropic API memerlukan header khusus untuk browser access. Header `anthropic-dangerous-direct-browser-access: true` sudah ditambahkan di kode. Jika masih error, pertimbangkan membuat backend proxy sederhana.

### "Error 401 / Invalid API Key"
- Cek apakah API key sudah benar (mulai dengan `sk-ant-`)
- Cek apakah akun Anthropic punya credit/balance
- Pastikan key belum expired/revoked

### Mau ubah konten prompt?
Edit file `src/App.jsx`, cari function `buildPrompt()`. Di situ semua template prompt bisa dimodifikasi.

### Mau tambah jenis jasa baru?
1. Tambah entry di array `JASA_OPTIONS`
2. Tambah case baru di function `buildPrompt()`
3. Push ke GitHub — Vercel auto-deploy

### Berapa biaya per bulan?
- **Vercel hosting:** Gratis (plan hobby)
- **Anthropic API:** ~$0.01-0.05 per generate
- **Estimasi 50 deck/bulan:** ~$0.50-2.50/bulan

---

## Security Notes

- API key disimpan di Vercel Environment Variables (terenkripsi, tidak terekspos di source code)
- Repo GitHub harus di-set **Private**
- Jangan pernah commit file `.env` ke GitHub (sudah ada di `.gitignore`)
- PENTING: Karena API key ada di frontend (via VITE_), key ini bisa dilihat di browser. Untuk production yang lebih secure, pertimbangkan membuat API route di Vercel Serverless Functions sebagai proxy.
