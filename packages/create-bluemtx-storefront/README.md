# `create-bluemtx-storefront`

Scaffold a Nuxt 4 headless storefront that talks to the BlueMTX Storefront Public API via `@bluemtx/storefront-sdk`.

## Usage

```bash
# From a release tarball (no npm login)
npx --yes https://github.com/bluemtx/storefront-kit/releases/download/v0.2.2/create-bluemtx-storefront-0.2.2.tgz my-store

# Or from a local clone of this repo
node packages/create-bluemtx-storefront/bin/create-bluemtx-storefront.js my-store
```

Then:

```bash
cd my-store
cp .env.example .env
npm install
npm run dev
```

Override the SDK tarball URL with `BLUEMTX_SDK_TGZ` if you pin a different release.
