# 🐔 TernakKu — Aplikasi Manajemen Peternakan Ayam

PWA (Progressive Web App) untuk pencatatan dan monitoring peternakan ayam. Bisa diinstall di HP Android seperti aplikasi biasa.

## Fitur
- 📝 Form pencatatan: Kandang, Pakan, Produksi, Kesehatan
- 📊 Grafik produksi telur, pakan, dan biaya (7 hari)
- 📄 Laporan mingguan otomatis
- 💾 Data tersimpan di perangkat (offline ready)
- 📲 Bisa diinstall di home screen Android

## Cara Deploy ke GitHub Pages

1. Buat repository baru di GitHub (misal: `ternakku`)
2. Upload semua file ini ke repository
3. Masuk ke **Settings → Pages**
4. Pilih source: **Deploy from branch → main → / (root)**
5. Klik Save, tunggu beberapa menit
6. Buka URL: `https://[username].github.io/ternakku`

## Cara Install di HP Android

1. Buka URL aplikasi di **Chrome Android**
2. Tunggu banner "Install TernakKu" muncul, lalu tap **Install**
3. Atau tap menu ⋮ → **"Tambahkan ke layar utama"**
4. Aplikasi siap dipakai seperti APK!

## Struktur File
```
├── index.html      ← Aplikasi utama
├── manifest.json   ← Konfigurasi PWA
├── sw.js           ← Service worker (offline)
└── icons/
    ├── icon-192.png
    └── icon-512.png
```
