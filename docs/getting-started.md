# Getting started

## Prerequisites

- Node.js 20+
- A BlueMTX Commerce store slug (from your merchant / platform contact)
- Commerce API origin for local/dev (e.g. `https://dev.stores.bluemtx.com`), or empty `baseUrl` when running behind a same-origin Worker BFF

## Scaffold a headless storefront

```bash
npx --yes https://github.com/bluemtx/storefront-kit/releases/download/v0.2.2/create-bluemtx-storefront-0.2.2.tgz my-store
cd my-store
cp .env.example .env
```

Set:

```env
NUXT_PUBLIC_COMMERCE_BASE_URL=https://dev.stores.bluemtx.com
NUXT_PUBLIC_STORE_SLUG=your-store-slug
```

```bash
npm install
npm run dev
```

## Use the SDK in an existing app

```bash
npm install https://github.com/bluemtx/storefront-kit/releases/download/v0.2.2/bluemtx-storefront-sdk-0.2.2.tgz
```

```js
import { createStorefrontClient } from '@bluemtx/storefront-sdk'

const client = createStorefrontClient({
  baseUrl: import.meta.env.VITE_COMMERCE_BASE_URL || '',
  storeSlug: import.meta.env.VITE_STORE_SLUG,
})

const contract = await client.getStorefrontContract()
const catalog = await client.listCatalog({ limit: 24 })
```

## Composition extensions (standard stores)

For slot packages on Composition-powered stores (not full headless apps):

```bash
npx --yes https://github.com/bluemtx/storefront-kit/releases/download/v0.2.2/create-bluemtx-extension-0.2.2.tgz my-extension
```

Host the built `dist/entry.js` at an immutable URL, then register it with BlueMTX (approved publishers only).

## What not to do

- Do not fork the private BlueMatrix monorepo for theme folders
- Do not call BOS ERP / merchant admin APIs from the shopper app
- Do not put secrets (connector keys, Sanctum tokens) in the browser bundle
