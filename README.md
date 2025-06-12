# Threads Generator AI - Ekstensi Chrome

![Screenshot Aplikasi](https://github.com/DepriPramana/Threads-Generator-AI/blob/main/image1.png) <!-- Ganti dengan URL screenshot aplikasi Anda -->

**Threads Generator AI** adalah sebuah ekstensi Chrome yang dirancang untuk membantu pengguna membuat *thread* (untaian) untuk platform media sosial seperti X (Twitter) atau Threads dengan cepat dan mudah. Dengan memanfaatkan kekuatan model AI generatif Google (Gemini), ekstensi ini dapat menghasilkan serangkaian tulisan yang koheren berdasarkan topik, gaya penulisan, dan batasan karakter yang Anda tentukan.

## Fitur Utama

-   **Generasi Teks Berbasis AI**: Membuat konten thread secara otomatis menggunakan Google Gemini API.
-   **Kustomisasi Gaya Penulisan**: Pilih dari berbagai gaya penulisan seperti Santai, Profesional, Inspiratif, dan lainnya.
-   **Batasan Karakter**: Atur panjang maksimum untuk setiap bagian *thread* agar sesuai dengan platform target.
-   **Manajemen Folder**: Simpan hasil *thread* Anda ke dalam folder-folder kustom untuk pengarsipan yang rapi.
-   **Riwayat Tersimpan**: Lihat kembali, kelola, dan hapus *thread* yang telah Anda simpan sebelumnya.
-   **Mode Gelap (Dark Mode)**: Tampilan antarmuka yang nyaman digunakan pada kondisi minim cahaya.
-   **Penyimpanan Lokal & Aman**: API Key dan semua data Anda disimpan dengan aman di penyimpanan lokal peramban.

## Cara Instalasi

Karena ekstensi ini belum dipublikasikan di Chrome Web Store, Anda perlu memuatnya secara manual dalam mode pengembang.

1.  **Unduh atau Clone Repositori**
    -   Unduh semua file proyek (`manifest.json`, `popup.html`, `popup.js`, `tailwind.css`, dan folder `images`) dan simpan dalam satu folder, misalnya `ai-threads-generator`.

2.  **Dapatkan Google Gemini API Key**
    -   Anda memerlukan API Key untuk menggunakan ekstensi ini.
    -   Kunjungi [Google AI Studio](https://aistudio.google.com/app/apikey) untuk membuat API Key Anda.

3.  **Muat Ekstensi di Chrome**
    -   Buka Google Chrome dan navigasi ke `chrome://extensions`.
    -   Aktifkan **"Developer mode"** (Mode Pengembang) di pojok kanan atas halaman.
    -   Klik tombol **"Load unpacked"** (Muat yang belum dibuka).
    -   Pilih folder `ai-threads-generator` yang berisi semua file proyek.
    -   Ekstensi sekarang akan muncul di daftar ekstensi Anda dan ikonnya akan tampil di toolbar Chrome.

## Cara Penggunaan

1.  **Klik Ikon Ekstensi** di toolbar Chrome untuk membuka popup.
2.  **Simpan API Key**: Pertama kali menggunakan, masukkan Gemini API Key yang telah Anda buat ke kolom yang tersedia dan klik **"Simpan"**. Anda hanya perlu melakukan ini sekali.
3.  **Isi Form**:
    -   **Topik Utama**: Masukkan ide atau topik utama untuk *thread* Anda.
    -   **Gaya Penulisan**: Pilih gaya yang paling sesuai.
    -   **Maksimum Karakter**: (Opsional) Tentukan batas karakter per bagian.
4.  **Buat Folder (Opsional)**: Jika Anda ingin menyimpan hasilnya, buat folder baru terlebih dahulu.
5.  **Buat Thread**: Klik tombol **"Buat Thread"**. AI akan memproses dan menampilkan hasilnya.
6.  **Simpan Hasil**: Setelah hasil muncul, pilih folder tujuan dan klik **"Simpan ke Folder"**.
7.  **Lihat Riwayat**: Untuk melihat *thread* yang tersimpan, cukup pilih nama folder dari menu *dropdown*.

## Struktur File Proyek


/ai-threads-generator  
├── images/  
│ ├── icon16.png  
│ ├── icon48.png  
│ └── icon128.png  
├── manifest.json  
├── popup.html  
├── popup.js  
└── tailwind.css  


-   `manifest.json`: File konfigurasi inti yang mendefinisikan ekstensi dan perizinannya.
-   `popup.html`: Struktur HTML untuk antarmuka pengguna (UI) ekstensi.
-   `popup.js`: Logika JavaScript yang menangani semua fungsionalitas, interaksi pengguna, dan panggilan API.
-   `tailwind.css`: File CSS yang berisi semua kelas utilitas dari Tailwind CSS untuk styling.
-   `images/`: Folder yang berisi ikon-ikon ekstensi untuk berbagai ukuran.

---

Dikembangkan dengan ❤️ dan sedikit bantuan dari AI.
