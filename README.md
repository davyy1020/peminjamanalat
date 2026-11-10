# 📦 PECC Event Rentals — Sistem Peminjaman Alat Event

Website peminjaman alat inventaris resmi **PECC (Politeknik Negeri Semarang)** dengan fitur **Live Booking Real-Time**, **Shopee UX**, tema **Neo-brutalism Form**, dan **terhubung langsung ke Google Spreadsheet & Google Drive**.

---

## 🔗 Panduan Menghubungkan ke Google Spreadsheet & Drive (Hanya 2 Menit!)

Sistem ini sudah dilengkapi file backend [`Code.gs`](file:///c:/Users/Davy/Documents/pecc/peminjaman-alat/Code.gs) yang siap digunakan.

### Langkah-langkah:
1. **Buka Google Spreadsheet Baru**:
   - Buat spreadsheet kosong di [Google Sheets](https://sheets.new) dengan nama misal: `Data Peminjaman Alat PECC`.
2. **Buka Apps Script**:
   - Di menu atas Spreadsheet, klik **Ekstensi (Extensions)** &rarr; **Apps Script**.
3. **Salin Script**:
   - Hapus kode default di editor, lalu salin seluruh isi file [`Code.gs`](file:///c:/Users/Davy/Documents/pecc/peminjaman-alat/Code.gs) ke dalamnya.
   - *(Opsional)* Jika ingin file bukti bayar masuk ke folder Drive khusus:
     - Buat folder di Google Drive, salin ID Folder dari URL (karakter setelah `/folders/`).
     - Tempelkan ke baris `var DRIVE_FOLDER_ID = 'ID_FOLDER_ANDA';`.
4. **Deploy sebagai Web App**:
   - Klik tombol biru **Deploy (Terapkan)** di pojok kanan atas &rarr; pilih **New deployment (Deployment baru)**.
   - Klik ikon gerigi (Select type) &rarr; pilih **Web app (Aplikasi web)**.
   - Atur konfigurasi:
     - **Description**: `PECC Event Rentals API`
     - **Execute as**: `Me (email Anda)`
     - **Who has access**: `Anyone (Siapa saja)` &larr; *(Penting! Wajib dipilih agar formulir website bisa mengirim data)*
   - Klik **Deploy**, beri izin akun Google (*Review Permissions &rarr; Advanced &rarr; Go to Untitled project*).
5. **Salin URL Web App**:
   - Salin **Web App URL** yang berakhiran `/exec` (misal: `https://script.google.com/macros/s/AKfycb.../exec`).
6. **Hubungkan di Website**:
   - Buka website, klik menu **⚙️ Admin** (password default: `admin` / `admin123`).
   - Tempelkan URL tersebut ke kolom **Google Apps Script Web App URL** &rarr; klik **💾 Simpan URL**.
   - Klik **🔄 Tarik Data (Sync)** untuk verifikasi.

🎉 **Selesai!** Setiap ada mahasiswa/organisasi yang melakukan peminjaman:
- Baris baru otomatis masuk ke tab sheet `Peminjaman` di Google Spreadsheet Anda.
- Bukti transfer otomatis tersimpan rapi di Google Drive dengan link langsung yang bisa diakses di Spreadsheet.
- Status pengembalian alat di spreadsheet otomatis sinkron dengan website.

---

## 🌟 Fitur Utama

1. **Sinkronisasi Langsung ke Google Spreadsheet & Drive:**
   - Pencatatan peminjaman otomatis real-time.
   - Upload bukti transfer langsung ke Google Drive.
   - Perubahan status pengembalian alat otomatis ter-update di sheet.

2. **Cek Ketersediaan Real-Time per Tanggal Acara:**
   - Input tanggal mulai & tanggal selesai.
   - Menghitung stok fisik yang tersisa berdasarkan jadwal booking peminjam lain.
   - Mencegah *double booking* atau peminjaman melebihi stok yang ada.

3. **Shopee-Style Marketplace Experience:**
   - Katalog 9 alat resmi dari flyer PECC.
   - Search bar pencarian cepat & filter kategori.
   - Quick view detail alat, ulasan bintang, dan kalender ketersediaan.
   - Floating Cart Bar di bagian bawah mobile & desktop.

4. **Formulir Peminjaman & Nota Resmi:**
   - Form data penanggung jawab, NIM, instansi, dan nama acara.
   - Pembayaran QRIS dengan modal zoom.
   - Bukti reservasi / Nota resmi dengan kode unik (`#NOTA-XXXX`) yang siap dicetak ke PDF.
   - 1-Klik konfirmasi ke WhatsApp Admin (**Davy: 0882-1544-4940**).

---

## 📂 Struktur File

```
peminjaman-alat/
├── Code.gs               # Backend Google Apps Script (Spreadsheet & Drive)
├── index.html            # File aplikasi utama (modular)
├── index_compiled.html   # File aplikasi mandiri (single-file standalone)
├── admin.html            # Pintasan panel admin
├── style.css             # Desain Neobrutalism formal & Shopee UX
├── app.js                # Availability engine, cart & Google Sheets sync
├── flyer.jpg             # Flyer sumber asli
├── pecc_logo.jpg         # Logo resmi PECC
├── qris.png              # Barcode QRIS pembayaran
└── images/               # Foto produk yang sudah di-crop dari flyer
```
