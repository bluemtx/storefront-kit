# Headless storefront deployment

**Recommended:** Cloudflare **Workers + Static Assets** (Git → Workers Builds), with a same-origin `/api/*` BFF to the BlueMTX Storefront Public API.

```text
Private customer GitHub repo
        ↓ Workers Builds
    Cloudflare Worker (one project per storefront)
        ├── Static assets (Nuxt / Vue / other)
        └── /api/* BFF → BlueMTX Storefront Public API
                ↓
Platform hostname + optional custom domain
```

## Rules

| Do | Do not |
|---|---|
| One Worker project per custom storefront | Put customer apps inside the BlueMatrix monorepo |
| Git as source of truth | Edit production files over FTP |
| Preview versions + access protection | Rely on obscure URLs alone |
| Same-origin BFF for browser API | Give the Worker admin/ERP credentials |
| Use `@bluemtx/storefront-sdk` | Call undocumented internal routes |

## Runtime

Commerce `storefront_runtime`:

- `composition` — platform Composition Engine
- `theme_pack` — legacy only (do not use for new work)
- `headless` — external Worker; platform redirects shoppers to your deployed URL

Register the deployment with your BlueMTX contact so the store is marked `headless` and linked to the production hostname.

## Local vs production

| Env | `baseUrl` |
|---|---|
| Local Nuxt → Commerce | `https://dev.stores.bluemtx.com` (or your tenant Commerce host) |
| Production Worker | `''` (same-origin BFF) |
