# Odoo Source of Truth for Semut-ID

This prototype treats Semut-ID as a future Odoo portal actor, not only as a frontend login.

## Actor Mapping

- `Semut-ID` maps to `res.partner` as the contact/actor record.
- `Semut-ID` also maps to `res.users` portal with an internal login generated from Semut-ID, for example `smt_sadja_1234@portal.namlah.local`.
- Personal email is optional at first registration and must not be used as a required verification gate.
- Superapp must not store Odoo credentials in the browser.
- API Gateway/service account writes to Odoo while preserving the real actor fields.

## Source of Truth

- Koloni is the Namlah data boundary, access boundary, and configuration unit.
- There is no separate community boundary or community-level queen role. The owner/configurator role is Ratu Koloni, displayed in the Superapp as Ratu Semut.
- A Semut-ID must join one koloni before a role becomes active.
- Koloni can share the same geographic area without sharing data.
- Parent-child koloni visibility only applies after the relation is approved and the koloni policy allows it.
- Koloni missions, proof, survey, delivery, and audit workflow use `project.task`.
- Cashier transactions use `sale.order`.
- Cashier shifts, setup, and audit can still use `project.task`, linked to the sale orders.

## Custom Fields

The first implementation uses `x_namlah_*` custom fields so Namlah Studio can create/import them safely before an Odoo addon exists.

Core task fields:

- `x_namlah_semut_id`
- `x_namlah_actor_partner_id`
- `x_namlah_actor_user_id`
- `x_namlah_role_code`
- `x_namlah_koloni_code`
- `x_namlah_wilayah_code`
- `x_namlah_source_app`
- `x_namlah_template_code`
- `x_namlah_plan_code`
- `x_namlah_mobile_status`
- `x_namlah_proof_status`
- `x_namlah_sop_article_id`
- `x_namlah_sale_order_id`

Core project fields:

- `x_namlah_koloni_code`
- `x_namlah_wilayah_code`
- `x_namlah_template_code`
- `x_namlah_plan_code`

Core sale order fields:

- `x_namlah_semut_id`
- `x_namlah_cashier_partner_id`
- `x_namlah_role_code`
- `x_namlah_koloni_code`
- `x_namlah_wilayah_code`
- `x_namlah_project_id`
- `x_namlah_task_id`
- `x_namlah_outlet_code`
- `x_namlah_source_app`

Planned addon fields after the Studio/custom-field phase:

- `x_namlah_colony_id`
- `x_namlah_parent_colony_id`
- `x_namlah_geo_area_id`
- `x_namlah_visibility_policy`

Stage/SOP fields on `project.task.type`:

- `x_namlah_sop_article_id`
- `x_namlah_sop_step_code`
- `x_namlah_required_proof`
- `x_namlah_checklist_json`
- `x_namlah_mobile_hint`

## SOP Stage Integration

`knowledge.article` stores SOP content, while `project.task.type` stores the stage-specific reference and mobile hint. When a task enters Survey, Validasi, Pickup, Audit Kasir, or Selesai, the Superapp can render the matching checklist and proof requirement.

## Ratu Semut Dashboard

The first Ratu Semut implementation adds a role-gated `Ratu Semut` menu and mock API gateway routes in this Superapp. The routes only write to Odoo when `NAMLAH_BRIDGE_LIVE=true` and `NAMLAH_BRIDGE_WRITES=true`, but they always emit the Odoo envelope shape that the real adapter must preserve:

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

The dashboard uses `project.task` as the mission workflow view and keeps transactions/reports in their native Odoo surfaces: `sale.order`, `project.milestone`, and accounting report lines. Superapp role code `admin` is Ratu Semut; the internal Odoo service user is a technical backend identity, not a Superapp role.

## Catalog Ownership

Catalog listings belong to `koloniCode + UMKM owner/listingCode`. Two koloni may list a product with the same display name and both records remain valid. Later, a separate product identity table may group similar products for search, but it must not replace ownership by koloni and UMKM listing.

## Prototype Boundary

This repo remains a demo frontend plus opt-in gateway contract. It does not call production Odoo unless the bridge env is enabled. When live writes are enabled, `/api/semut/register` upserts `res.partner` and `res.users` portal using the generated Semut-ID portal login without requiring personal email verification.
