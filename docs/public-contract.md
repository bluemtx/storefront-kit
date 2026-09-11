# Storefront public contract

Versioned shopper-facing configuration and DTO boundary for BlueMTX Commerce.

## Endpoint

```http
GET /api/v1/stores/{slug}/config
```

Response `data` keeps **legacy flat keys** for older SPAs and adds a nested **`storefront`** envelope (`schema_version` 1) for headless clients and `@bluemtx/storefront-sdk`.

Shopper writes (cart, auth, checkout, wishlist, account) use sibling public routes under `/api/v1/stores/{slug}/*`.

## Envelope shape

```json
{
  "schema_version": 1,
  "store": {},
  "brand": {},
  "locale": {},
  "currencies": [],
  "navigation": {},
  "capabilities": {},
  "composition": {
    "homepage": {},
    "store_layout": {}
  },
  "pages": {},
  "extensions": []
}
```

Prefer `client.getStorefrontContract()` in new apps.

## SDK surface (`0.2.2`)

| Area | Methods |
|---|---|
| Config | `getConfig`, `getStorefrontContract` |
| Catalog | `listCatalog`, `listCatalogFacets`, `getProduct`, collections |
| Content | `listPages`, `getPage` |
| Cart / wishlist | get/add/update/remove |
| Auth + account | login/register/logout, profile, addresses, orders |
| Checkout | `getCheckoutOptions`, `checkout`, guest order, payment-session, track |

### Base URL

| Mode | `baseUrl` | Resulting root |
|---|---|---|
| Same-origin Worker BFF | `''` | `/api/v1/stores/{slug}` |
| Direct Commerce | `https://…` | `{origin}/api/v1/stores/{slug}` |

Prefer same-origin BFF in production headless deployments.

## Cross-origin / BFF

- Auth/cart: Bearer + opaque session tokens (`supports_credentials: false`)
- With Worker BFF, the SPA should not need CORS to Commerce
- Keep Commerce `STOREFRONT_CORS_ORIGINS` only for legitimate non-BFF clients

## Non-goals

- Do not expect raw store settings or Eloquent shapes
- Do not call BOS ERP internals from the storefront
