# `@bluemtx/storefront-sdk`

Typed client for the **BlueMTX Storefront Public API** (`/api/v1/stores/{slug}/*`).

## Install

```bash
npm install @bluemtx/storefront-sdk
```

Fallback from a [GitHub Release](https://github.com/bluemtx/storefront-kit/releases) tarball:

```bash
npm install https://github.com/bluemtx/storefront-kit/releases/download/v0.2.2/bluemtx-storefront-sdk-0.2.2.tgz
```

Or clone this repo and link the workspace package locally.

## Usage

```js
import { createStorefrontClient } from '@bluemtx/storefront-sdk'

// Production headless (Worker BFF — same origin)
const client = createStorefrontClient({
  baseUrl: '',
  storeSlug: 'your-store',
  getCustomerToken: () => localStorage.getItem('bos.commerce.customer.your-store.token'),
  getAcceptLanguage: () => localStorage.getItem('store.locale') || 'en',
})

// Direct Commerce (local / non-BFF)
const direct = createStorefrontClient({
  baseUrl: 'https://dev.stores.bluemtx.com',
  storeSlug: 'your-store',
})
```

## Rules

- Call only public `/api/v1/stores/{slug}/*` routes.
- Prefer `getStorefrontContract()` over raw flat `/config` fields for new apps.
- Auth/cart use Bearer + opaque session tokens (no cookie credentials required).
- Cross-origin SPAs need `STOREFRONT_CORS_ORIGINS` allowlisted on Commerce, or use a same-origin Worker BFF.

See [docs/getting-started.md](../../docs/getting-started.md) and [docs/public-contract.md](../../docs/public-contract.md).
