# OneApp — Nilai & Absensi Siswa

Aplikasi web ringan untuk mencatat **nilai**, **absensi**, dan membuat **rekap/laporan siswa**.
Dibangun sebagai HTML statis + Firebase, sehingga bisa **diakses dari laptop mana pun selama
terhubung ke internet** — tidak perlu instalasi, tidak perlu server sendiri.

## 1. Struktur Folder

```
OneApp/
├── index.html              # Halaman utama / menu navigasi
├── input-nilai.html        # Guru: input nilai per kelas & mapel
├── absensi-siswa.html      # Wali kelas: catat kehadiran harian
├── rekap-nilai.html        # Laporan, peringkat, export Excel & cetak PDF
├── assets/
│   └── firebase-config.js  # Konfigurasi Firebase (SATU sumber, dipakai semua halaman)
├── icons/
│   ├── icon-192.png        # Ikon PWA
│   └── icon-512.png
├── manifest.json           # Agar bisa "Install App" / Add to Home Screen
├── sw.js                   # Service worker (cache UI shell, bukan mode offline penuh)
├── database.rules.json     # Aturan keamanan Firebase Realtime Database
├── firebase.json           # Konfigurasi deploy Firebase Hosting
├── .firebaserc             # Project default Firebase CLI
└── .gitignore
```

Aplikasi ini **hanya berisi bagian `nilai-siswa`** dari paket unggahan asli. Folder `guru-presensi`
dan `functions` pada arsip asli adalah aplikasi lain yang tidak terkait dan sengaja tidak disertakan.

## 2. Cara Kerja

Semua data (siswa, nilai, absensi, akun pengguna) disimpan di **Firebase Realtime Database**,
dan login memakai **Firebase Authentication (Email/Password)**. Karena itu:

- ✅ Aplikasi bisa dibuka dari laptop/HP mana pun, cukup lewat browser.
- ✅ Data tersinkron otomatis antar-perangkat secara real-time.
- ⚠️ **Wajib terhubung internet** — ini bukan aplikasi offline. `sw.js` hanya mempercepat
  tampilan UI, bukan menyimpan data saat offline.

## 3. Setup Awal (wajib sebelum dipakai)

### a. Buat project Firebase
1. Buka [Firebase Console](https://console.firebase.google.com) → **Add project**.
2. Aktifkan **Authentication → Sign-in method → Email/Password**.
3. Aktifkan **Realtime Database** (pilih region terdekat, mis. `asia-southeast1`).
4. Buka **Project settings → General → Your apps → Web app (</>)** untuk mendapatkan config.

### b. Isi konfigurasi
Edit **satu file saja**: `assets/firebase-config.js`, ganti seluruh nilai `"GANTI..."`
dengan config dari langkah di atas. Ketiga halaman (`input-nilai`, `absensi-siswa`,
`rekap-nilai`) otomatis memakai config yang sama dari file ini.

Isi juga `.firebaserc` dengan `projectId` Firebase Anda.

### c. Terapkan aturan keamanan database
`database.rules.json` sudah disiapkan agar **hanya pengguna yang login** yang bisa
membaca/menulis data. Tanpa ini, database Anda **terbuka untuk siapa saja** di internet.

Deploy rules lewat Firebase CLI (lihat bagian 4), atau salin-tempel manual ke
**Realtime Database → Rules** di Firebase Console.

### d. Buat akun pengguna (guru/admin)
Tambahkan akun lewat **Authentication → Users → Add user** di Firebase Console,
lalu (opsional) simpan nama tampilan di `users/{uid}/nama` pada Realtime Database
agar muncul di badge nama pengguna.

## 4. Deploy agar Bisa Diakses Online

Opsi termudah: **Firebase Hosting** (gratis untuk trafik kecil–menengah).

```bash
npm install -g firebase-tools
firebase login
cd OneApp
firebase deploy
```

Setelah deploy, aplikasi bisa diakses lewat URL seperti:
`https://GANTI_PROJECT_ID.web.app`

Alternatif lain yang juga kompatibel karena aplikasi ini 100% statis:
Netlify, Vercel, GitHub Pages, atau cPanel hosting biasa — tinggal upload seluruh
isi folder `OneApp/`. Yang penting domain tempat hosting terdaftar di
**Firebase Console → Authentication → Settings → Authorized domains**.

## 5. Instal sebagai Aplikasi (PWA)

Setelah dibuka lewat browser (Chrome/Edge), pengguna bisa klik **"Install App"**
atau **"Add to Home Screen"** agar OneApp muncul seperti aplikasi biasa di
desktop/HP — tetap membutuhkan internet saat dipakai.

## 6. Rencana Pengembangan Lanjutan (disarankan)

- **Role-based access**: bedakan hak akses guru mapel vs wali kelas vs admin
  lewat custom claims Firebase Auth, lalu perketat `database.rules.json`.
- **Validasi server-side**: gunakan Cloud Functions untuk validasi tulis data
  (saat ini validasi hanya di sisi klien).
- **Backup otomatis**: aktifkan export terjadwal Realtime Database ke Cloud Storage.
- **Multi-tahun ajaran**: arsipkan data tahun ajaran lama agar query tetap ringan.

## 7. Troubleshooting Cepat

| Gejala | Kemungkinan Penyebab |
|---|---|
| Layar login terus muncul walau sudah submit | `firebaseConfig` di `assets/firebase-config.js` belum diisi/salah |
| "Login gagal" padahal email/password benar | Sign-in method Email/Password belum diaktifkan di Firebase Console |
| Data tidak muncul / tidak tersimpan | Rules belum dideploy, atau pengguna belum login |
| Aplikasi tidak bisa dibuka di device lain | Belum di-deploy (masih hanya file lokal) — lihat bagian 4 |
