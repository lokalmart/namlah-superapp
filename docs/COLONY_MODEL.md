# Namlah Koloni Model

## Principle

Koloni is the primary Namlah boundary for data, access, catalog ownership, and configuration. There is no separate community model or community-level queen role.

## Roles

- Semut-ID is the actor identity.
- Role assignments attach a Semut-ID to one koloni and one role.
- Ratu Koloni is the owner/configurator of a koloni; in the Superapp this is role code `admin` with label Ratu Semut.
- The internal Odoo service user is only a technical integration user.

## Parent-Child Rules

- A koloni can request to become a child of another koloni.
- The parent koloni must approve the relation.
- Approved parent-child visibility does not transfer ownership.
- Ratu parent sees child data only when relation status and policy allow it.

## Catalog Rules

- Product listings belong to `koloniCode + owner + listingCode`.
- Two koloni can sell a product with the same display name, and both listings stay separate.
- A future product identity layer may group similar products for search, but it must not replace listing ownership.

## Odoo Field Strategy

- V1 compatibility field: `x_namlah_koloni_code`.
- Planned addon fields: `x_namlah_colony_id`, `x_namlah_parent_colony_id`, `x_namlah_geo_area_id`, `x_namlah_visibility_policy`.
- Do not create a separate community field; keep ownership on koloni fields.
