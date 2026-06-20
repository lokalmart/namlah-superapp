# Namlah Superapp

Dummy frontend showcase untuk konsep superapp Namlah. Repo ini berdiri sendiri dari Namlah Studio dan tidak memiliki backend berat.

## Fokus

- Semut-ID dummy dengan PIN 4 digit.
- Semut-ID baru wajib memilih koloni awal sebelum role `member` aktif.
- Beranda fullscreen peta konseptual koloni.
- Role-ID yang mengubah tema, aktivitas, dan aksi utama.
- Gudang Semut untuk ecommerce dummy.
- Menu Ratu Semut untuk Kanban misi, sales order, milestones, balance sheet, dan Odoo bridge contract.
- Scan Jejak untuk barcode/Web3 future flow dummy.
- Account settings untuk role dan identitas lokal.
- PWA-first: manifest, icon, service worker ringan.

## Batas

- Koneksi Odoo live bersifat opt-in melalui `NAMLAH_BRIDGE_LIVE=true`.
- Write ke Odoo tetap terkunci sampai `NAMLAH_BRIDGE_WRITES=true`.
- Koloni adalah boundary data dan akses. Tidak ada boundary komunitas terpisah dalam kontrak Superapp/Odoo.
- Tidak ada blockchain/wallet nyata.
- Semua data akun, role, dan PIN role demo tersimpan di browser localStorage.

## API Contract

```text
GET /api/odoo/health
GET /api/odoo/schema-audit
POST /api/semut/register
GET /api/colonies
POST /api/colonies
POST /api/colonies/:koloniCode/join
POST /api/colonies/:koloniCode/parent-request
POST /api/colonies/:koloniCode/parent-approval
PATCH /api/colonies/:koloniCode/policy
POST /api/roles/apply
POST /api/umkm/onboard
POST /api/projects/from-template
PATCH /api/tasks/:taskId/status
POST /api/tasks/:taskId/proof
GET /api/dashboard/koloni
GET /api/ratu/dashboard
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
