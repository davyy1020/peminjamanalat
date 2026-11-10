/**
 * =========================================================================
 * PECC EVENT RENTALS - BACKEND GOOGLE APPS SCRIPT
 * Terhubung langsung ke Google Spreadsheet & Google Drive
 * =========================================================================
 * 
 * CARA SETUP CEPAT (2 Menit):
 * 1. Buka Google Spreadsheet baru di drive Anda.
 * 2. Beri nama spreadsheet, misal: "Data Peminjaman Alat PECC".
 * 3. Salin ID Spreadsheet dari URL browser Anda:
 *    https://docs.google.com/spreadsheets/d/[INI_ID_SPREADSHEET]/edit
 * 4. Buat folder di Google Drive untuk bukti bayar, salin ID Folder dari URL:
 *    https://drive.google.com/drive/folders/[INI_ID_FOLDER]
 * 5. Tempelkan kedua ID tersebut ke variabel SPREADSHEET_ID & DRIVE_FOLDER_ID di bawah.
 * 6. Klik tombol "Deploy" (Terapkan) -> "New deployment" (Deployment baru).
 * 7. Pilih tipe "Web app" (Aplikasi web).
 *    - Execute as: "Me" (Saya)
 *    - Who has access: "Anyone" (Siapa saja)
 * 8. Salin URL Web App yang dihasilkan, lalu masukkan ke Pengaturan Website.
 * =========================================================================
 */

// === KONFIGURASI ID SPREADSHEET & DRIVE ===
// Kosongkan atau biarkan SPREADSHEET_ID jika script dibuat langsung di dalam Spreadsheet (Extensions -> Apps Script)
var SPREADSHEET_ID = ''; 
var DRIVE_FOLDER_ID = '1fDfHBVySZoH8TdJT6u4uf7-6sgvpzRIL'; // Folder Google Drive Bukti Bayar PECC 

// Helper untuk mengambil Spreadsheet
function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== '') {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

// Inisialisasi Sheet jika belum ada
function getOrCreateSheet(sheetName, headers, headerColor) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  if (sheet.getLastRow() === 0 && headers && headers.length > 0) {
    sheet.appendRow(headers);
    var range = sheet.getRange(1, 1, 1, headers.length);
    range.setFontWeight('bold');
    range.setBackground(headerColor || '#1d4ed8');
    range.setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Endpoint GET: Mengambil data peminjaman & katalog untuk ketersediaan real-time
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';
  
  // 1. Ambil data peminjaman dan/atau alat untuk API
  if (action === 'getLoans' || action === 'getAll' || action === 'getItems') {
    try {
      var result = {};
      
      // Ambil Data Peminjaman
      if (action === 'getLoans' || action === 'getAll') {
        var loanSheet = getOrCreateSheet('Peminjaman', [
          'Timestamp', 'ID Nota', 'Nama Peminjam', 'NIM', 'Jurusan/Organisasi',
          'No WhatsApp', 'Nama Acara', 'Tanggal Pinjam', 'Tanggal Kembali',
          'Durasi (Hari)', 'Daftar Alat', 'Total Biaya (Rp)', 'Status', 'Link Bukti Bayar'
        ], '#1d4ed8');
        
        var loanData = loanSheet.getDataRange().getValues();
        var loans = [];
        for (var i = 1; i < loanData.length; i++) {
          var row = loanData[i];
          if (!row || !row[1]) continue;
          
          loans.push({
            id: String(row[1]),
            borrowerName: String(row[2] || ''),
            borrowerNIM: String(row[3] || ''),
            borrowerOrg: String(row[4] || ''),
            borrowerPhone: String(row[5] || ''),
            eventName: String(row[6] || ''),
            borrowDate: formatDateYMD(row[7]),
            returnDate: formatDateYMD(row[8]),
            days: Number(row[9]) || 1,
            itemsSummary: String(row[10] || ''),
            totalPrice: Number(row[11]) || 0,
            status: String(row[12] || 'active').toLowerCase().indexOf('kembali') !== -1 ? 'returned' : 'active',
            proofUrl: String(row[13] || '')
          });
        }
        result.loans = loans;
      }
      
      // Ambil Data Master Alat
      if (action === 'getItems' || action === 'getAll') {
        var itemSheet = getOrCreateSheet('Inventaris_Alat', [
          'ID Alat', 'Nama Alat', 'Kategori', 'Tarif/Hari (Rp)', 'Total Stok', 'Deskripsi'
        ], '#ff5722');
        
        var itemData = itemSheet.getDataRange().getValues();
        var items = [];
        for (var j = 1; j < itemData.length; j++) {
          var r = itemData[j];
          if (!r || !r[0]) continue;
          items.push({
            id: String(r[0]),
            name: String(r[1] || ''),
            category: String(r[2] || 'sound'),
            price: Number(r[3]) || 0,
            stock: Number(r[4]) || 1,
            desc: String(r[5] || '')
          });
        }
        result.items = items;
      }
      
      result.status = 'success';
      return ContentService.createTextOutput(JSON.stringify(result))
          .setMimeType(ContentService.MimeType.JSON);
          
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: err.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // 2. Jika dibuka langsung di browser
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    message: 'Backend Google Spreadsheet PECC Rentals aktif!',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Endpoint POST: Menerima peminjaman baru dan memperbarui status
 */
function doPost(e) {
  try {
    var raw = e.postData.contents;
    var data = JSON.parse(raw);
    
    // Action 1: Submit Peminjaman Baru
    if (!data.action || data.action === 'submitLoan') {
      var resSubmit = processLoanSubmission(data);
      return ContentService.createTextOutput(JSON.stringify(resSubmit))
          .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Action 2: Tandai Barang Dikembalikan
    if (data.action === 'markReturned') {
      var resReturn = processMarkReturned(data.loanId);
      return ContentService.createTextOutput(JSON.stringify(resReturn))
          .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Aksi tidak dikenali'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Memproses penyimpanan formulir peminjaman ke Google Spreadsheet & Google Drive
 */
function processLoanSubmission(data) {
  var sheet = getOrCreateSheet('Peminjaman', [
    'Timestamp', 'ID Nota', 'Nama Peminjam', 'NIM', 'Jurusan/Organisasi',
    'No WhatsApp', 'Nama Acara', 'Tanggal Pinjam', 'Tanggal Kembali',
    'Durasi (Hari)', 'Daftar Alat', 'Total Biaya (Rp)', 'Status', 'Link Bukti Bayar'
  ], '#1d4ed8');
  
  // 1. Simpan Bukti Pembayaran ke Google Drive jika ada
  var linkBukti = 'Tidak ada file bukti';
  if (data.proof && data.proof.indexOf('data:') === 0) {
    linkBukti = saveBase64ToDrive(data.proof, data.proofName || 'BuktiBayar', data.borrowerName || 'Peminjam');
  }
  
  // 2. Format rincian alat
  var itemSummary = '';
  if (Array.isArray(data.items)) {
    itemSummary = data.items.map(function(i) {
      return i.name + ' (x' + i.qty + ' unit)';
    }).join(', ');
  } else {
    itemSummary = String(data.items || '');
  }
  
  // 3. Masukkan ke baris baru Spreadsheet
  sheet.appendRow([
    new Date(),
    data.id || ('NOTA-' + Date.now().toString(36).toUpperCase()),
    data.borrowerName || '',
    data.borrowerNIM || '',
    data.borrowerOrg || '',
    data.borrowerPhone || '',
    data.eventName || '',
    data.borrowDate || '',
    data.returnDate || '',
    Number(data.days) || 1,
    itemSummary,
    Number(data.totalPrice) || 0,
    'Dipinjam',
    linkBukti
  ]);
  
  return {
    status: 'success',
    message: 'Data peminjaman berhasil dicatat ke Google Spreadsheet!',
    notaId: data.id,
    proofUrl: linkBukti
  };
}

/**
 * Memperbarui status peminjaman menjadi "Sudah Kembali" di Spreadsheet
 */
function processMarkReturned(loanId) {
  var sheet = getOrCreateSheet('Peminjaman');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]) === String(loanId)) {
      // Kolom 13 (Index 12) adalah Status
      sheet.getRange(i + 1, 13).setValue('Sudah Kembali');
      return { status: 'success', message: 'Status di Google Spreadsheet diupdate menjadi Sudah Kembali!' };
    }
  }
  return { status: 'error', message: 'ID Nota tidak ditemukan di Spreadsheet' };
}

/**
 * Helper untuk menyimpan Base64 file ke folder Google Drive
 */
function saveBase64ToDrive(base64DataUrl, fileName, borrowerName) {
  try {
    var folder;
    if (DRIVE_FOLDER_ID && DRIVE_FOLDER_ID.trim() !== '') {
      try {
        folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
      } catch (e) {
        folder = DriveApp.getRootFolder();
      }
    } else {
      folder = DriveApp.getRootFolder();
    }
    
    var parts = base64DataUrl.split(',');
    var mime = parts[0].match(/:(.*?);/)[1] || 'image/jpeg';
    var decoded = Utilities.base64Decode(parts[1]);
    
    var safeName = 'BuktiBayar_' + borrowerName.replace(/[^a-zA-Z0-9]/g, '_') + '_' + (fileName || 'transfer.jpg');
    var blob = Utilities.newBlob(decoded, mime, safeName);
    var file = folder.createFile(blob);
    
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (errSharing) {}
    
    return file.getUrl();
  } catch (err) {
    return 'Gagal simpan ke Drive: ' + err.toString();
  }
}

/**
 * Helper Format Tanggal YYYY-MM-DD
 */
function formatDateYMD(val) {
  if (!val) return '';
  if (val instanceof Date) {
    var y = val.getFullYear();
    var m = ('0' + (val.getMonth() + 1)).slice(-2);
    var d = ('0' + val.getDate()).slice(-2);
    return y + '-' + m + '-' + d;
  }
  return String(val).slice(0, 10);
}

