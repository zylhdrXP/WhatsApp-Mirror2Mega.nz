const mega = require("megajs");
const fs = require("fs");
const path = require("path");
const { mega: megaConfig } = require("./config");

const UPLOAD_DB = path.join(__dirname, "uploads.json");

// Fungsi baca database upload
function readUploads() {
    if (!fs.existsSync(UPLOAD_DB)) return [];
    return JSON.parse(fs.readFileSync(UPLOAD_DB, "utf-8"));
}

// Fungsi simpan database upload
function saveUploads(data) {
    fs.writeFileSync(UPLOAD_DB, JSON.stringify(data, null, 2));
}

// Upload file ke MEGA
async function uploadToMega(filePath) {
    return new Promise((resolve, reject) => {
        try {
            if (!fs.existsSync(filePath)) return reject("❌ File tidak ditemukan!");

            const fileName = path.basename(filePath);
            const fileSize = fs.statSync(filePath).size;

            const storage = mega({
                email: megaConfig.email,
                password: megaConfig.password
            });

            storage.on("ready", () => {
                const upload = storage.upload({
                    name: fileName,
                    size: fileSize,
                    allowUploadBuffering: true
                }, fs.createReadStream(filePath));

                upload.on("complete", (file) => {
                    file.link((err, link) => {
                        if (err) return reject(err);

                        const uploads = readUploads();
                        const uploadedAt = Date.now();
                        const fileData = {
                            id: file.nodeId,
                            name: fileName,
                            link,
                            uploadedAt
                        };
                        uploads.push(fileData);
                        saveUploads(uploads);

                        // Set timer otomatis hapus setelah 24 jam
                        setTimeout(async () => {
                            try {
                                console.log(`⏳ Menghapus otomatis: ${fileName}`);
                                await deleteFromMega(file.nodeId);
                                const updated = readUploads().filter(f => f.id !== file.nodeId);
                                saveUploads(updated);
                                console.log(`✅ Berhasil dihapus: ${fileName}`);
                            } catch (err) {
                                console.error(`❌ Gagal hapus ${fileName}: ${err.message || err}`);
                            }
                        }, 24 * 60 * 60 * 1000); // 24 jam

                        resolve({
                            fileName,
                            link
                        });
                    });
                });

                upload.on("error", (err) => reject(err));
            });

            storage.on("error", (err) => reject(err));
        } catch (err) {
            reject(err);
        }
    });
}

// Hapus file dari MEGA
async function deleteFromMega(fileId) {
    return new Promise((resolve, reject) => {
        const storage = mega({
            email: megaConfig.email,
            password: megaConfig.password
        });

        storage.on("ready", () => {
            const file = storage.files[fileId];
            if (!file) return reject(new Error("❌ File tidak ditemukan di MEGA!"));
            file.delete((err) => {
                if (err) return reject(err);
                resolve(true);
            });
        });

        storage.on("error", (err) => reject(err));
    });
}

// Restore timer untuk file yang sudah diunggah sebelumnya
function restoreTimers() {
    const uploads = readUploads();
    const now = Date.now();

    uploads.forEach(file => {
        const remaining = (file.uploadedAt + 24 * 60 * 60 * 1000) - now;
        if (remaining <= 0) {
            // Sudah kadaluarsa, hapus langsung
            deleteFromMega(file.id)
                .then(() => {
                    console.log(`🗑 File kadaluarsa dihapus: ${file.name}`);
                    const updated = readUploads().filter(f => f.id !== file.id);
                    saveUploads(updated);
                })
                .catch(err => console.error(`❌ Gagal hapus ${file.name}: ${err.message || err}`));
        } else {
            // Set ulang timer sisanya
            console.log(`⏳ Set ulang timer untuk ${file.name} (sisa ${(remaining / 1000 / 60).toFixed(1)} menit)`);
            setTimeout(async () => {
                try {
                    await deleteFromMega(file.id);
                    const updated = readUploads().filter(f => f.id !== file.id);
                    saveUploads(updated);
                    console.log(`✅ Berhasil dihapus: ${file.name}`);
                } catch (err) {
                    console.error(`❌ Gagal hapus ${file.name}: ${err.message || err}`);
                }
            }, remaining);
        }
    });
}

module.exports = { uploadToMega, restoreTimers };