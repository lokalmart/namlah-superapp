# Namlah Superapp Design System

## Arah Visual

Koloni modern: mobile-first, hangat, kerja lapangan, dan tetap rapi untuk transaksi. Peta konseptual menjadi panggung utama, sementara setiap role punya aksen warna dan prioritas aksi sendiri.

## Branch Game Ant Art

Branch `codex/game-ant-art` mengeksplorasi arah visual yang lebih game-like:

- map menjadi arena tile koloni;
- pin berubah menjadi node quest/resource;
- role diperlakukan seperti class karakter;
- aktivitas menjadi quest card;
- Gudang Semut menjadi shop inventory;
- Scan Jejak menjadi portal scan;
- maskot ratu semut lebih ekspresif dan cocok untuk onboarding.

Varian ini tetap dummy frontend. Tidak ada backend, Odoo, wallet, pembayaran, atau blockchain nyata.

## Prinsip UI

- Map sebagai first screen setelah login, memakai OpenStreetMap Cirebon sebagai peta dasar nyata dengan overlay pin Namlah.
- Bottom navigation tetap empat item: Map, Gudang, Scan, Akun.
- Role aktif harus terlihat di header dan memengaruhi warna/aksi.
- Bar konteks global wajib menunjukkan role, koloni, tahap SOP, source-of-truth Odoo, dan pintasan role.
- Dashboard Ratu wajib menandai sumber data: `odoo_live`, `demo_local`, atau fallback lokal saat bridge gagal.
- Kontak Ratu Koloni wajib terlihat dari Akun dan panel Ratu.
- Aksi utama memakai icon dan label pendek.
- PIN memakai keypad numerik besar.
- Radius UI maksimal 8px untuk panel, button, dan field.

## Token Awal

- Ink: `#142018`
- Surface: `#fffdf7`
- Field: `#f6f3ea`
- Member: `#1f7a4d`
- Surveyor: `#286fbc`
- Kurir: `#b75f1d`
- Kasir: `#6c4fc2`
- UMKM: `#a53f55`
- Admin: `#27555d`
- Koperasi: `#8a6a1d`
