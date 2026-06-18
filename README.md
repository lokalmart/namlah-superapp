# Namlah Superapp

Dummy frontend showcase untuk konsep superapp Namlah. Repo ini berdiri sendiri dari Namlah Studio dan tidak memiliki backend berat.

## Fokus

- Semut-ID dummy dengan PIN 4 digit.
- Beranda fullscreen peta konseptual koloni.
- Role-ID yang mengubah tema, aktivitas, dan aksi utama.
- Gudang Semut untuk ecommerce dummy.
- Scan Jejak untuk barcode/Web3 future flow dummy.
- Account settings untuk role dan identitas lokal.
- PWA-first: manifest, icon, service worker ringan.

## Batas

- Tidak ada koneksi Odoo.
- Tidak ada API gateway.
- Tidak ada blockchain/wallet nyata.
- Semua data akun dan role tersimpan di browser localStorage.

## Validasi

```bash
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
```

## Target Deploy

```text
https://github.com/lokalmart/namlah-superapp
```
