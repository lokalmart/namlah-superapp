# Ratu Semut Dashboard

This document is the working blueprint for using Odoo Project, Sales, Milestones, and accounting reports in the Ratu Semut menu.

## Position

`project.project` and `project.task` are the mission workflow layer for koloni work, role execution, proof collection, onboarding, promotion, delivery, and donation programs. They are not a replacement for Odoo Sales, Inventory, POS, Accounting, or Invoice ledgers.

## Runtime Contract

- Semut-ID remains the real actor identity in Namlah.
- The backend/API gateway writes to Odoo with one internal service user.
- Every write keeps actor fields such as `x_namlah_semut_id`, `x_namlah_role_code`, `x_namlah_koloni_code`, `x_namlah_wilayah_code`, `x_namlah_source_app`, `x_namlah_template_code`, and `x_namlah_plan_code`.
- Frontend apps must not store Odoo credentials or call Odoo directly from the browser.
- Superapp role code `admin` is displayed as Ratu Semut.
- Internal Odoo admin/service user is not a Superapp role.
- Each Role-ID has its own PIN.
- A separate community boundary is not part of the Namlah data model. Koloni is the access boundary and Ratu Koloni is the configurator.
- Semut-ID registration must choose a koloni before the first `member` role is active.
- Parent-child koloni visibility requires an approved relation and policy permission; ownership stays with the child Ratu Koloni.

## Implemented V1 Endpoints

- `POST /api/semut/register`
- `GET /api/colonies`
- `POST /api/colonies`
- `POST /api/colonies/:koloniCode/join`
- `POST /api/colonies/:koloniCode/parent-request`
- `POST /api/colonies/:koloniCode/parent-approval`
- `PATCH /api/colonies/:koloniCode/policy`
- `POST /api/roles/apply`
- `POST /api/umkm/onboard`
- `POST /api/projects/from-template`
- `PATCH /api/tasks/:taskId/status`
- `POST /api/tasks/:taskId/proof`
- `GET /api/dashboard/koloni`
- `GET /api/ratu/dashboard`

These endpoints currently return deterministic demo payloads and Odoo write envelopes. Replace the envelope executor later with the real Odoo adapter without changing the role apps.

## Ratu Semut Views

- `Kanban Misi` uses `project.task`.
- `Sales Order` uses `sale.order`.
- `Milestones` uses `project.milestone`.
- `Balance Sheet` uses accounting report lines.

## Template Set

- `UMKM Onboarding Basic`
- `UMKM Promotion Sprint`
- `Survey Lokasi`
- `Setup Kasir`
- `Kurir Delivery`
- `Program Donasi / Eksekusi Rencana`

## Kanban Flows

UMKM onboarding:

- `Baru Daftar`
- `Lengkapi Profil`
- `Data Produk`
- `Validasi Survey`
- `Siap Jual`
- `Aktif`
- `Perlu Perbaikan`

Promotion:

- `Rencana`
- `Konten Dibuat`
- `Diskon Aktif`
- `Disebar`
- `Review Masuk`
- `Selesai`
- `Evaluasi`

Donation program:

- `Template Tersedia`
- `Dipilih Donatur`
- `Menunggu Dana`
- `Eksekusi`
- `Bukti Terkumpul`
- `Laporan`
- `Selesai`

## Acceptance Checks

- A UMKM owner can trigger onboarding and receive task instances from the template.
- Ratu Semut can view cross-role Kanban summaries.
- Role dashboards only expose role-appropriate tasks unless the active role is Ratu Semut or Koperasi.
- Every API response includes an Odoo envelope that preserves the true Semut-ID actor even though Odoo will be written by the service user.
