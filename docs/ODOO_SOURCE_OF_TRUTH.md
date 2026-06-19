# Odoo Source of Truth for Semut-ID

This prototype treats Semut-ID as a future Odoo portal actor, not only as a frontend login.

## Actor Mapping

- `Semut-ID` maps to `res.partner` as the minimum portal actor record.
- `res.users` portal is optional until real Odoo portal access is enabled.
- Superapp must not store Odoo credentials in the browser.
- API Gateway/service account writes to Odoo while preserving the real actor fields.

## Source of Truth

- Community work, missions, proof, survey, delivery, and audit workflow use `project.task`.
- Cashier transactions use `sale.order`.
- Cashier shifts, setup, and audit can still use `project.task`, linked to the sale orders.

## Custom Fields

The first implementation uses `x_namlah_*` custom fields so Namlah Studio can create/import them safely before an Odoo addon exists.

Core task fields:

- `x_namlah_semut_id`
- `x_namlah_actor_partner_id`
- `x_namlah_actor_user_id`
- `x_namlah_role_code`
- `x_namlah_tenant_code`
- `x_namlah_sarang_code`
- `x_namlah_source_app`
- `x_namlah_mobile_status`
- `x_namlah_proof_status`
- `x_namlah_sop_article_id`
- `x_namlah_sale_order_id`

Core sale order fields:

- `x_namlah_semut_id`
- `x_namlah_cashier_partner_id`
- `x_namlah_role_code`
- `x_namlah_tenant_code`
- `x_namlah_project_id`
- `x_namlah_task_id`
- `x_namlah_outlet_code`
- `x_namlah_source_app`

Stage/SOP fields on `project.task.type`:

- `x_namlah_sop_article_id`
- `x_namlah_sop_step_code`
- `x_namlah_required_proof`
- `x_namlah_checklist_json`
- `x_namlah_mobile_hint`

## SOP Stage Integration

`knowledge.article` stores SOP content, while `project.task.type` stores the stage-specific reference and mobile hint. When a task enters Survey, Validasi, Pickup, Audit Kasir, or Selesai, the Superapp can render the matching checklist and proof requirement.

## Prototype Boundary

This repo remains dummy frontend. It does not call Odoo, does not create portal users, and does not write real sale orders/tasks. The goal is to make the future Odoo contract visible and testable in the UX.