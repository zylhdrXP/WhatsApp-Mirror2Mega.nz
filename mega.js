const { Storage } = require("megajs");
const fs = require("fs");
const path = require("path");
const { mega: megaConfig } = require("./config");

const UPLOAD_DB = path.join(__dirname, "uploads.json");

let storagePromise = null;

// ===== Helper Database Upload =====
function readUploads() {
  if (!fs.existsSync(UPLOAD_DB)) return [];
  try {
    const raw = fs.readFileSync(UPLOAD_DB, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Gagal membaca uploads.json:", err);
    return [];
  }
}

function saveUploads(data) {
  try {
    fs.writeFileSync(UPLOAD_DB, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Gagal menyimpan uploads.json:", err);
  }
}

// ===== Helper MEGA Storage =====
async function getStorage() {
  if (!storagePromise) {
    storagePromise = (async () => {
      if (!megaConfig.email || !megaConfig.password) {
        throw new Error("Email / password MEGA belum diatur di config.js");
      }

      const storage = await new Storage({
        email: megaConfig.email,
        password: megaConfig.password,
        keepalive: true
      }).ready;

      console.log("✅ Login ke MEGA.nz berhasil sebagai:", storage.name || megaConfig.email);
      return storage;
    })().catch((err) => {
      storagePromise = null;
      throw err;
    });
  }
  return storagePromise;
}

// ===== Operasi ke MEGA =====
async function uploadToMega(filePath, originalName) {
  const storage = await getStorage();

  const stat = fs.statSync(filePath);
  const fileName = originalName || path.basename(filePath);

  console.log("⬆️ Mengunggah ke MEGA:", fileName, stat.size, "bytes");

  const uploadStream = storage.upload(
    {
      name: fileName,
      size: stat.size
    },
    fs.createReadStream(filePath)
  );

  const file = await uploadStream.complete;

  // Dapatkan link publik
  const link = await new Promise((resolve, reject) => {
    file.link((err, url) => {
      if (err) return reject(err);
      resolve(url);
    });
  });

  const now = Date.now();
  const expiresAt = now + 24 * 60 * 60 * 1000;

  const uploads = readUploads();
  const record = {
    id: file.nodeId,
    name: fileName,
    link,
    size: stat.size,
    uploadedAt: now,
    expiresAt
  };
  uploads.push(record);
  saveUploads(uploads);

  scheduleDelete(record);

  console.log("✅ Upload selesai. Link:", link);
  return record;
}

async function deleteFromMega(nodeId) {
  const storage = await getStorage();
  const file = storage.files[nodeId];

  if (!file) {
    console.warn("File tidak ditemukan di MEGA untuk nodeId:", nodeId);
    return;
  }

  await new Promise((resolve, reject) => {
    file.delete((err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  console.log("🗑 File dihapus dari MEGA:", file.name || nodeId);
}

// ===== Timer Auto Delete =====
function scheduleDelete(file) {
  const now = Date.now();
  const remaining = file.expiresAt - now;

  if (remaining <= 0) {
    // Sudah kadaluarsa, hapus langsung
    performDelete(file).catch((err) =>
      console.error(`❌ Gagal hapus kadaluarsa ${file.name}:`, err)
    );
    return;
  }

  setTimeout(() => {
    performDelete(file).catch((err) =>
      console.error(`❌ Gagal hapus terjadwal ${file.name}:`, err)
    );
  }, remaining);

  const minutes = Math.round(remaining / 60000);
  console.log(`⏱ Jadwalkan auto delete untuk ${file.name} dalam ${minutes} menit`);
}

async function performDelete(file) {
  try {
    await deleteFromMega(file.id);
  } finally {
    const uploads = readUploads().filter((f) => f.id !== file.id);
    saveUploads(uploads);
  }
}

// Dipanggil saat bot start ulang
function restoreTimers() {
  const uploads = readUploads();
  if (!uploads.length) {
    console.log("Tidak ada upload tertunda untuk dipulihkan.");
    return;
  }

  console.log(`🔁 Restore ${uploads.length} timer auto delete dari uploads.json`);

  uploads.forEach((file) => {
    scheduleDelete(file);
  });
}

module.exports = { uploadToMega, restoreTimers };
