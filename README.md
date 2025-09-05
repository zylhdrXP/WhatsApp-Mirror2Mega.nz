<div align="center">
<img src="https://i.ibb.co/L5T1bFp/undraw-Cloud-hosting-715-A.png" alt="WhatsApp Mirror Bot Banner" width="250"/>
<h1 align="center">🚀 WhatsApp Mirror Bot</h1>
<p align="center">
Ubah WhatsApp Anda menjadi alat mirroring file canggih! <br />
Cukup kirim link download, dan dapatkan file Anda tersimpan aman di <b>MEGA.nz</b> dalam sekejap.
</p>
<p align="center">
<a href="#"><img alt="Node.js" src="https://img.shields.io/badge/Node.js-16.x+-green?style=for-the-badge&logo=node.js"></a>
<a href="https://github.com/WhiskeySockets/Baileys"><img alt="Baileys" src="https://img.shields.io/badge/Baileys-Multi--Device-blueviolet?style=for-the-badge&logo=whatsapp"></a>
<a href="https://github.com/username/bot-mirror/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/github/license/username/bot-mirror?style=for-the-badge&color=blue"></a>
<a href="https://github.com/username/bot-mirror/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/username/bot-mirror?style=for-the-badge&logo=github&color=yellow"></a>
</p>
</div>
✨ Kenapa Bot Ini Keren?
Punya link download file besar tapi koneksi sedang tidak stabil? Atau butuh cara cepat untuk membuat link publik sementara dari file direct? WhatsApp Mirror Bot adalah solusinya. Bot ini dirancang untuk menjembatani file dari internet langsung ke cloud storage MEGA.nz Anda, semua melalui perintah sederhana di WhatsApp.
Fitur Unggulan
 * ✅ Mirror Cepat ke Cloud: Unduh file dari direct link dan unggah otomatis ke MEGA.nz tanpa menyimpan di perangkat Anda.
 * 🌐 Dukungan Link Universal: Kompatibel dengan berbagai sumber direct link, termasuk SourceForge, GitHub Releases, Google Drive, dan banyak lagi.
 * ⏳ Tautan Aman & Sementara: Setiap file yang diunggah akan otomatis terhapus setelah 24 jam, cocok untuk berbagi file sementara dengan aman.
 * 📱 Kontrol Penuh via WhatsApp: Cukup gunakan command .mirror <link> untuk memulai proses. Semudah mengirim pesan!
 * ⚡ Performa Tinggi: Dibangun di atas Baileys (Multi-Device) dan megajs untuk memastikan kecepatan dan stabilitas maksimal.
⚙️ Alur Kerja Bot
Sangat simpel! Bot bekerja dalam 4 langkah otomatis:
Anda ➡️ Perintah WhatsApp ➡️ Bot Server 🤖 ➡️ Upload ke MEGA.nz ☁️ ➡️ Link Publik Diterima
🚀 Instalasi & Persiapan (Hanya 5 Menit!)
Ikuti langkah-langkah di bawah ini untuk menjalankan bot Anda sendiri.
1️⃣ Clone Repository
Buka terminal Anda dan jalankan perintah ini:
git clone https://github.com/username/bot-mirror.git
cd bot-mirror

2️⃣ Install Semua Dependency
Bot ini membutuhkan beberapa library Node.js. Install semuanya dengan satu perintah:
npm install

3️⃣ Konfigurasi Akun MEGA.nz
Buka file config.js dan masukkan email serta password akun MEGA Anda.
// config.js
module.exports = {
  mega: {
    email: "EMAIL_AKUN_MEGA_ANDA",
    password: "PASSWORD_AKUN_MEGA_ANDA"
  }
}

> ⚠️ PENTING: Untuk keamanan, sangat disarankan menggunakan akun MEGA baru yang didedikasikan khusus untuk bot ini.
> 
4️⃣ Jalankan Bot & Pairing
Saatnya menghidupkan bot!
node index.js

Bot akan meminta Anda memasukkan nomor WhatsApp untuk di-pairing. Gunakan format internasional tanpa tanda + atau spasi (contoh: 6281234567890).
💻 Cara Menggunakan Bot
Setelah bot aktif, buka WhatsApp dan kirim pesan ke nomor bot Anda.
Kirim perintah:
.mirror <url_file_direct>

Contoh Praktis:
.mirror https://sourceforge.net/projects/scrcpy/files/latest/download

Bot akan merespons dengan:
 * Notifikasi bahwa file sedang diunduh.
 * Notifikasi bahwa file sedang diunggah ke MEGA.nz.
 * Link publik MEGA.nz yang bisa langsung Anda bagikan.
<details>
<summary><strong>📂 Lihat Struktur Direktori Proyek</strong></summary>
/bot-mirror
├── index.js         # Logika utama bot & handler perintah
├── mega.js          # Modul API untuk interaksi dengan MEGA.nz
├── config.js        # File konfigurasi (akun MEGA, dll)
├── mirror.json      # Database JSON sederhana untuk melacak file
├── tempFile/        # Direktori penyimpanan file sementara
├── package.json     # Daftar dependency dan skrip proyek
└── README.md        # Anda sedang membacanya :)

</details>
🛠️ Butuh Bantuan? (Troubleshooting)
 * Error: EACCES (Permission Denied)
   Ini terjadi karena bot tidak memiliki izin untuk menulis di folder tempFile. Solusi:
   mkdir -p tempFile
chmod -R 777 tempFile

 * Error: Specify a file size or set allowUploadBuffering
   Jangan khawatir, error ini sudah ditangani secara otomatis di dalam kode mega.js menggunakan fs.statSync() untuk mendapatkan ukuran file sebelum diunggah.
💖 Dukung Proyek Ini
Jika Anda merasa proyek ini bermanfaat, tunjukkan dukungan Anda dengan memberikan Bintang (Star) ⭐ pada repository GitHub ini. Dukungan Anda sangat berarti!
📜 Lisensi
Proyek ini dirilis di bawah Lisensi MIT. Anda bebas memodifikasi, mendistribusikan, dan menggunakan kode ini untuk tujuan apa pun.
<div align="center">
Dibuat dengan ❤️ oleh <b>Ziyau Latif Alhaidar</b>
<br/>
<a href="https://github.com/username"><b>GitHub</b></a> • <a href="mailto:your.email@example.com"><b>Email</b></a>
</div>
