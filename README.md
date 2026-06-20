# Namlah Superapp

Namlah Superapp adalah PWA Semut-ID untuk role koloni yang menulis data bisnis ke Odoo. Repo ini berdiri sendiri dari Namlah Studio, tetapi tidak lagi memiliki mekanisme data bisnis lokal.

## Fokus

- Semut-ID portal dengan PIN 4 digit untuk sesi perangkat.
- User baru langsung mendapat portal login internal berbasis Semut-ID; email bersifat opsional dan tidak menjadi syarat verifikasi awal.
- Semut-ID baru wajib memilih koloni awal sebelum role `member` aktif.
- Beranda fullscreen memakai OpenStreetMap sebagai peta dasar nyata.
- Role-ID mengubah struktur menu dan aksi utama sesuai posisi kerja user.
- Kasir membuat `sale.order` real yang terhubung ke project dan task kasir.
- Ratu Semut membaca Kanban misi, sale order, milestones, balance sheet, dan audit dari Odoo live.
- Scan Jejak menjadi pintu bukti task, barcode, dan proof workflow.
- Account settings menampilkan Semut-ID, portal actor, role, dan kontak Ratu Koloni.
- PWA-first: manifest, icon, service worker ringan.

## Batas Real-Only

- Koneksi Odoo wajib untuk registrasi portal, role, project template, transaksi kasir, dashboard Ratu, dan proof task.
- Write ke Odoo tetap terkunci sampai `NAMLAH_BRIDGE_WRITES=true`.
- Saat Odoo belum aktif, API mengembalikan error eksplisit dan tidak membuat data pengganti.
- Koloni adalah boundary data dan akses. Tidak ada boundary komunitas terpisah dalam kontrak Superapp/Odoo.
- Tidak ada blockchain/wallet nyata.
- Browser local storage hanya menyimpan sesi perangkat dan PIN setelah API Odoo menerima aksi terkait.

## API Contract

```text
GET /api/odoo/health
GET /api/odoo/schema-audit
POST /api/semut/register
POST /api/cashier/orders
POST /api/roles/apply
POST /api/umkm/onboard
POST /api/projects/from-template
PATCH /api/tasks/:taskId/status
POST /api/tasks/:taskId/proof
GET /api/dashboard/koloni
GET /api/ratu/dashboard
```

Endpoint koloni berikut sudah real-only, tetapi masih menunggu adapter model koloni Odoo:

```text
GET /api/colonies
POST /api/colonies
POST /api/colonies/:koloniCode/join
POST /api/colonies/:koloniCode/parent-request
POST /api/colonies/:koloniCode/parent-approval
PATCH /api/colonies/:koloniCode/policy
```

## Odoo Bridge

Tahap aman untuk koneksi real:

```text
1. Isi ODOO_URL, ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD, ODOO_API_MODE.
2. Cek GET /api/odoo/health.
3. Cek GET /api/odoo/schema-audit sampai field wajib siap.
4. Aktifkan NAMLAH_BRIDGE_LIVE=true untuk live read Ratu Semut.
5. Aktifkan NAMLAH_BRIDGE_WRITES=true hanya setelah schema audit hijau.
```

Mode API awal mendukung `xmlrpc` karena pola ini sudah dipakai Namlah Studio. `json2` disiapkan sebagai adapter mode untuk Odoo 19+.

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
