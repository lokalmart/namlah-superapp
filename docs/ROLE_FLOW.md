# Role Flow

## Semut-ID

Semut-ID adalah akun portal Namlah. Akun dibuat lewat API bridge Odoo, lalu sesi perangkat dibuka ulang dari localStorage dengan PIN 4 digit.

Setiap Semut-ID baru langsung mendapat portal login internal berbasis Semut-ID, misalnya `smt_sadja_1234@portal.namlah.local`. User tidak wajib memberikan email pribadi saat daftar, dan alur awal tidak menunggu verifikasi email. Email bisa ditambahkan nanti sebagai data kontak, bukan sebagai gate pendaftaran awal.

## Role-ID

Setiap akun bisa memiliki beberapa Role-ID. Mengganti role mengubah:

- warna aksen;
- teks beranda;
- data aktivitas prioritas dari Odoo;
- aksi utama;
- tampilan Gudang/Scan/Akun.
- menu bawah yang tersedia.

Setiap Role-ID memiliki PIN 4 digit sendiri. PIN Semut-ID membuka akun utama, lalu PIN role membuka peran yang ingin dipakai.

## Kontrol Posisi User

Setelah login, Superapp menampilkan bar konteks global:

- role aktif;
- koloni aktif;
- tahap SOP aktif;
- source-of-truth Odoo;
- pintasan role yang sudah dimiliki.

Role yang belum dimiliki mengarahkan user ke Akun untuk registrasi role melalui Odoo. Role yang sudah dimiliki bisa dipindah langsung dari bar konteks agar user tidak perlu selalu masuk ke Akun hanya untuk memahami posisi kerja.

## Menu Per Role

Bottom navigation tetap memakai empat slot agar PWA ringan, tetapi labelnya berubah mengikuti role. Contoh: Member melihat Belanja, Surveyor melihat Survey, Kurir melihat Rute/Paket, Kasir melihat POS, UMKM melihat Produk, Ratu melihat Ratu/Audit, dan Koperasi melihat Program.

## Role Awal

- Member
- Surveyor
- Kurir
- Kasir
- UMKM
- Ratu Semut (`admin`)
- Koperasi
