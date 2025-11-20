const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  jidNormalizedUser,
  DisconnectReason,
  Browsers
} = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
const pino = require("pino");
const fetch = require("node-fetch");
const qrcode = require("qrcode-terminal");
const chalk = require("chalk");
const readline = require("readline");
const { uploadToMega, restoreTimers } = require("./mega");

const DOWNLOAD_DIR = path.join(__dirname, "downloads");

// Pastikan folder download ada
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    browser: Browsers.ubuntu("Chrome"),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
    }
  });

  // Tampilkan QR di terminal jika belum login
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.clear();
      console.log(chalk.cyan("📱 Scan QR untuk login WhatsApp:"));
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;

      if (reason === DisconnectReason.loggedOut) {
        console.log(chalk.red("❌ Logged out. Hapus folder auth dan login ulang."));
        process.exit(1);
      } else {
        console.log(chalk.yellow("🔁 Koneksi terputus, mencoba reconnect..."));
        startBot().catch((err) => console.error("Error restart bot:", err));
      }
    } else if (connection === "open") {
      console.log(chalk.green("✅ Bot terkoneksi ke WhatsApp!"));
      // Restore timer auto-delete dari database
      restoreTimers();
    }
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    const msg = messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const isFromMe = msg.key.fromMe;

    // Abaikan pesan dari bot sendiri
    if (isFromMe) return;

    // Ambil teks pesan (dari conversation, extendedText atau caption media)
    const messageContent =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption ||
      "";

    const body = messageContent.trim();
    const prefix = ".";
    const isCmd = body.startsWith(prefix);

    if (!isCmd) return;

    const args = body.slice(prefix.length).trim().split(/\s+/);
    const command = args.shift()?.toLowerCase() || "";

    if (command === "ping") {
      return sock.sendMessage(from, { text: "🏓 Pong!" });
    }

    if (command === "mirror") {
      if (args.length === 0) {
        return sock.sendMessage(from, {
          text: "📎 Kirim: *.mirror <url>*\nContoh: *.mirror https://example.com/file.zip*"
        });
      }

      const url = args[0];

      if (!/^https?:\/\//i.test(url)) {
        return sock.sendMessage(from, {
          text: "❌ URL tidak valid. Pastikan diawali dengan http:// atau https://"
        });
      }

      console.log(`📥 Mirror request dari ${from} -> ${url}`);

      // Tentukan nama file dari URL
      const urlPath = new URL(url).pathname;
      let fileName = path.basename(urlPath) || "file.bin";

      // Hindari nama file absurd
      if (!fileName || !fileName.includes(".")) {
        fileName = `file-${Date.now()}.bin`;
      }

      const filePath = path.join(DOWNLOAD_DIR, fileName);

      try {
        await sock.sendMessage(from, { text: "⏳ Mengunduh file, tunggu sebentar..." });

        // Download file
        const res = await fetch(url);
        if (!res.ok) {
          console.error("Gagal mengunduh, status:", res.status);
          return sock.sendMessage(from, { text: "❌ Gagal mengunduh file dari URL!" });
        }

        const fileStream = fs.createWriteStream(filePath);
        await new Promise((resolve, reject) => {
          res.body.pipe(fileStream);
          res.body.on("error", reject);
          fileStream.on("finish", resolve);
        });

        await sock.sendMessage(from, { text: "📤 Mengunggah ke MEGA.nz..." });

        // Upload ke MEGA
        const result = await uploadToMega(filePath, fileName);

        const caption =
          "✅ *Berhasil mirror ke MEGA.nz!*\n\n" +
          `📁 *Nama*: ${result.name}\n` +
          `🔗 *Link*: ${result.link}\n` +
          "⏱ *Auto delete*: 24 jam\n\n" +
          "_File lokal akan dihapus otomatis setelah 24 jam._";

        await sock.sendMessage(from, { text: caption });

        // Hapus file lokal setelah 24 jam
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
              console.log("🧹 File lokal dihapus:", filePath);
            } catch (err) {
              console.error("Gagal hapus file lokal:", err);
            }
          }
        }, 24 * 60 * 60 * 1000);
      } catch (err) {
        console.error("❌ Error saat mirror:", err);
        await sock.sendMessage(from, { text: "❌ Gagal memproses file!" });
      }
    }
  });
}

startBot().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
