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
const { Boom } = require("@hapi/boom");
const { uploadToMega, restoreTimers } = require("./mega");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const tempDir = path.join(__dirname, "tempFile");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

let pairingStarted = false;
let phoneNumber = null;

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        browser: Browsers.ubuntu("Chrome"),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
        },
    });

    sock.ev.on("creds.update", saveCreds);

    // Pairing code flow
    if (!sock.authState.creds.registered && !pairingStarted) {
        pairingStarted = true;
        rl.question("📱 Masukkan nomor WhatsApp (contoh: 6285xxxx): ", async (num) => {
            phoneNumber = num.replace(/[^0-9]/g, "");
            if (phoneNumber.length < 8) {
                console.log(chalk.red("❌ Nomor WhatsApp tidak valid!"));
                process.exit(1);
            }

            try {
                console.log(chalk.blue("\n🔗 Meminta kode pairing..."));
                const code = await sock.requestPairingCode(phoneNumber);
                console.log(
                    chalk.green(`\n✅ Kode pairing Anda: ${code}\n`) +
                    chalk.yellow("⚡ Buka WhatsApp Web/Desktop → Gunakan kode pairing ini!\n")
                );
            } catch (err) {
                console.error(chalk.red("❌ Gagal membuat pairing code:"), err);
                process.exit(1);
            }
        });
    }

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            console.log(chalk.red(`❌ Koneksi terputus (${reason}). Reconnecting...`));
            startBot();
        } else if (connection === "open") {
            console.log(chalk.green("✅ Berhasil terhubung ke WhatsApp!"));
        }
    });

    // Handle pesan masuk
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;

        const from = m.key.remoteJid;
        const type = Object.keys(m.message)[0];
        const body =
            m.message.conversation ||
            m.message[type]?.caption ||
            m.message[type]?.text ||
            "";

        if (body.startsWith(".mirror ")) {
            const url = body.split(" ")[1];
            if (!url) return sock.sendMessage(from, { text: "❌ Masukkan URL!" });

            const fileName = path.basename(url);
            const filePath = path.join(tempDir, fileName);

            await sock.sendMessage(from, { text: "⏳ Sedang mengunduh file..." });

            try {
                // Download file
                const res = await fetch(url);
if (!res.ok) return sock.sendMessage(from, { text: "❌ Gagal mengunduh file!" });

const fileStream = fs.createWriteStream(filePath);
await new Promise((resolve, reject) => {
  res.body.pipe(fileStream);
  res.body.on('error', reject);
  fileStream.on('finish', resolve);
});

await sock.sendMessage(from, { text: "📤 Mengunggah ke MEGA.nz..." });

                // Upload ke MEGA.nz
                const uploaded = await uploadToMega(filePath);

                // Kirim link publik ke WhatsApp
                await sock.sendMessage(from, {
                    text: `✅ *Berhasil Mirror!*\n\n📄 Nama: ${uploaded.fileName}\n🔗 Link: ${uploaded.link}`
                });

                // Hapus file lokal setelah 24 jam
                setTimeout(() => {
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                }, 24 * 60 * 60 * 1000);
            } catch (err) {
                console.error("❌ Error saat mirror:", err);
                await sock.sendMessage(from, { text: "❌ Gagal memproses file!" });
            }
        }
    });
}

startBot();
