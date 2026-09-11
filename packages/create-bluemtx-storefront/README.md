# `create-bluemtx-storefront`

Scaffold a Nuxt 4 headless storefront that talks to the BlueMTX Storefront Public API via `@bluemtx/storefront-sdk`.

## Usage

```bash
npx create-bluemtx-storefront my-store
```

Fallback (GitHub Release tarball):

```bash
npx --yes https://github.com/bluemtx/storefront-kit/releases/download/v0.2.2/create-bluemtx-storefront-0.2.2.tgz my-store
```

From a local clone of this repo:

```bash
node packages/create-bluemtx-storefront/bin/create-bluemtx-storefront.js my-store
```

Then:

```bash
cd my-store
cp .env.example .env
npm install
npm run dev
```

The scaffold depends on `@bluemtx/storefront-sdk` from npm (`^0.2.2`). Override with `BLUEMTX_SDK_TGZ` to pin a GitHub Release tarball instead.
