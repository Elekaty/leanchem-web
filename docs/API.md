# LeanChem Phase 1 — API Contract

Base URL: `/api/v1`

Envelope:

```json
{ "data": {}, "error": { "code": "ERROR_CODE", "message": "Human-readable string" } }
```

## Auth

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Creates company (`pending`) + user; Argon2id/Bcrypt hash |
| POST | `/auth/login` | Public | Returns `access_token`, `refresh_token`, `user` |
| GET | `/company/status` | Bearer | `{ company_id, tier, verification_status }` |

Tier mapping: anonymous → `tier_1`; `pending` → `tier_2`; `verified` → `tier_3`.

## Catalog

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/products` | Optional | Strips `estimated_price` unless verified JWT |
| GET | `/products/:id` | Optional | Quick View payload + `user_context` |
| POST | `/products/:id/sample-request` | Bearer | Unique per user/product |

Query: `?search=&page=1&limit=20&sort=name_asc`

## Orders

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/orders` | Verified | Creates `request_submitted` order |
| GET | `/orders` | Bearer | Lightweight list + UI timeline |
| GET | `/orders/:id` | Bearer | Full items + documents |

## Documents

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/documents/upload` | Bearer | multipart: `file`, `entity_type`, `entity_id`, `document_type` |

Errors: `ERR_FILE_SIZE`, `ERR_FILE_TYPE` (400).

## RLS

API sets `request.jwt.claim.sub` to `users.id` inside each transaction via `set_config(..., true)`.
End-user policies allow SELECT/INSERT only on own company/user rows. Product catalog is public SELECT.
