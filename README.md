<div align="center">
  <img src="https://qu.ax/ZmXOB.png" alt="WhatsApp Mirror Bot Banner" width="250" />
  <h1>🚀 WhatsApp Mirror Bot</h1>
  <p>
    Ubah WhatsApp Anda menjadi alat mirroring file canggih!<br />
    Cukup kirim link download, dan dapatkan file Anda tersimpan aman di <b>MEGA.nz</b> dalam sekejap.
  </p>
  <p>
    <a href="#"><img alt="Node.js" src="https://img.shields.io/badge/Node.js-23.x+-green?style=for-the-badge&logo=node.js" /></a>
    <a href="https://github.com/WhiskeySockets/Baileys"><img alt="Baileys" src="https://img.shields.io/badge/Baileys-Multi--Device-blueviolet?style=for-the-badge&logo=whatsapp" /></a>
    <a href="https://github.com/zylhdrXP/WhatsApp-Mirror2Mega.nz/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/github/license/zylhdrXP/WhatsApp-Mirror2Mega.nz?style=for-the-badge&color=blue" /></a>
    <a href="https://github.com/zylhdrXP/WhatsApp-Mirror2Mega.nz/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/zylhdrXP/WhatsApp-Mirror2Mega.nz?style=for-the-badge&logo=github&color=yellow" /></a>
  </p>
</div>

---

# ✨ Kenapa WhatsApp Mirror Bot?

Punya link download file besar tapi koneksi sedang tidak stabil? Atau butuh cara cepat membuat link publik sementara dari file direct?  
**WhatsApp Mirror Bot** adalah solusi praktis yang menjembatani file dari internet langsung ke cloud storage MEGA.nz Anda, semua melalui perintah sederhana di WhatsApp.

---

## 🚀 Fitur Unggulan

- ✅ **Mirror Cepat ke Cloud:** Unduh file dari direct link dan unggah otomatis ke MEGA.nz tanpa menyimpan di perangkat Anda.
- 🌐 **Dukungan Link Universal:** Kompatibel dengan berbagai sumber direct link seperti SourceForge, GitHub Releases, Google Drive, dan lainnya.
- ⏳ **Tautan Aman & Sementara:** File yang diunggah otomatis terhapus setelah 24 jam, cocok untuk berbagi file sementara dengan aman.
- 📱 **Kontrol Penuh via WhatsApp:** Gunakan command `.mirror <link>` untuk memulai proses. Semudah mengirim pesan!
- ⚡ **Performa Tinggi:** Dibangun di atas Baileys (Multi-Device) dan megajs untuk kecepatan dan stabilitas maksimal.

---

## ⚙️ Cara Kerja Bot

Bot bekerja otomatis dalam 4 langkah sederhana:

```
Anda ➡️ Perintah WhatsApp ➡️ Bot Server 🤖 ➡️ Upload ke MEGA.nz ☁️ ➡️ Link Publik Diterima
```

---

## 🛠️ Instalasi & Persiapan (Hanya 5 Menit!)

1. **Clone Repository**

```bash
git clone https://github.com/zylhdrXP/WhatsApp-Mirror2Mega.nz.git
cd WhatsApp-Mirror2Mega.nz
```

2. **Install Semua Dependency**

```bash
npm install
```

3. **Konfigurasi Akun MEGA.nz**

Edit file `config.js` dan masukkan email serta password akun MEGA Anda:

```js
// config.js
module.exports = {
  mega: {
    email: "EMAIL_AKUN_MEGA_ANDA",
    password: "PASSWORD_AKUN_MEGA_ANDA"
  }
};
```

> ⚠️ Disarankan menggunakan akun MEGA baru khusus untuk bot ini demi keamanan.

4. **Jalankan Bot & Pairing**

```bash
node index.js
```

Bot akan meminta nomor WhatsApp untuk pairing. Gunakan format internasional tanpa tanda `+` atau spasi, contoh: `6281234567890`.

---

## 💻 Cara Menggunakan Bot

Setelah bot aktif dan ter-pairing, buka WhatsApp dan kirim pesan ke nomor bot Anda:

```
.mirror <url_file_direct>
```

**Contoh:**

```
.mirror https://sourceforge.net/projects/scrcpy/files/latest/download
```

Bot akan membalas dengan:

- Notifikasi proses unduh file.
- Notifikasi proses upload ke MEGA.nz.
- Link publik MEGA.nz yang siap dibagikan.

---

<details>
<summary><strong>📂 Struktur Direktori Proyek</strong></summary>

```
/WhatsApp-Mirror2Mega.nz
├── index.js         # Logika utama bot & handler perintah
├── mega.js          # Modul API untuk interaksi dengan MEGA.nz
├── config.js        # File konfigurasi (akun MEGA, dll)
├── mirror.json      # Database JSON sederhana untuk melacak file
├── tempFile/        # Direktori penyimpanan file sementara
├── package.json     # Daftar dependency dan skrip proyek
└── README.md        # Dokumentasi proyek
```

</details>

---

## 🛠️ Troubleshooting

- **Error: EACCES (Permission Denied)**  
  Bot tidak memiliki izin menulis di folder `tempFile`.  
  Solusi:

  ```bash
  mkdir -p tempFile
  chmod -R 777 tempFile
  ```

- **Error: Specify a file size or set allowUploadBuffering**  
  Error ini sudah ditangani otomatis di `mega.js` menggunakan `fs.statSync()` untuk mendapatkan ukuran file sebelum upload.

---

## 💖 Dukung Proyek Ini

Jika proyek ini bermanfaat, berikan bintang (⭐) pada repository GitHub ini. Dukungan Anda sangat berarti!

---

## 📜 Lisensi

Proyek ini dirilis di bawah Lisensi MIT. Bebas digunakan, dimodifikasi, dan didistribusikan.

---

<div align="center">
  Dibuat dengan ❤️ oleh <b>Zylhdr</b><br />
  <a href="https://github.com/zylhdrXP"><b>GitHub</b></a> • <a href="mailto: zylhdr@gmail.com"><b>Email</b></a>
</div>
```

---
