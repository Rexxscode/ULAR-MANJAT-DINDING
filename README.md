# 🎲 Ular Manjat Dinding

Game board Ular Tangga (Snake and Ladder) berbasis web yang dibangun dengan React dan Vite.

## 🚀 Fitur

- **Multiplayer Lokal** - Main bareng teman (2-4 pemain)
- **AI Opponent** - Bisa main lawan komputer dengan 3 level kesulitan (Mudah, Medium, Sulit)
- **Sound Effects** - Efek suara interaktif untuk setiap aksi
- **Animasi Smooth** - Gerakan pemain dan efek visual yang menarik
- **Responsif** - Tampilan optimal di desktop dan mobile
- **Auto Save** - Pengaturan tersimpan otomatis dengan LocalStorage

## 🛠️ Teknologi

- **React 19** - UI Framework
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **Web Audio API** - Sound effects

## 📦 Installasi

```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev

# Build untuk production
npm run build

# Preview production build
npm run preview
```

## 🎮 Cara Main

1. **Mulai Game** - Klik tombol "+" untuk menambah pemain (max 4)
2. **Atur Nama** - Ketik nama untuk setiap pemain
3. **Aktifkan AI** - Klik tombol 🤖 untuk menjadikan pemain sebagai AI
4. **Lempar Dadu** - Klik tombol "LEMPAR DADU" untuk bermain
5. **Menang** - Siapa yang pertama mencapai kotak 100 menang!

### Aturan Game
- Setiap pemain memulai di kotak 1
- Lempar dadu untuk menentukan jumlah langkah
- **Tangga** - Jika berhenti di awal tangga, naik ke atas
- **Ular** - Jika berhenti di kepala ular, turun ke bawah
- **DadU 6** - Dapat giliran tambahan
- Jika melebihi kotak 100, memantul kembali

## 🎨 Konfigurasi

Klik tombol ⚙️ untuk mengakses pengaturan:
- **Suara** - Aktifkan/nonaktifkan efek suara
- **Animasi** - Aktifkan/nonaktifkan animasi
- **AI Difficulty** - Tingkat kesulitan AI

## 📁 Struktur Project

```
dpplg_game/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom hooks (useSound, useLocalStorage)
│   ├── utils/          # Utility functions (gameUtils, aiHelper)
│   ├── constants/     # Game constants
│   └── App.jsx         # Main component
├── public/             # Static assets
├── index.html         # Entry HTML
└── package.json       # Dependencies
```

## 📝 Lisensi

MIT License