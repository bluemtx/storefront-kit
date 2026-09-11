# BlueMTX Storefront Kit

**Public developer kit** for customizing BlueMTX Commerce storefronts — for agencies and headless apps.

| Package | Purpose |
|---|---|
| [`@bluemtx/storefront-sdk`](./packages/storefront-sdk) | Client for the Storefront Public API |
| [`create-bluemtx-storefront`](./packages/create-bluemtx-storefront) | Scaffold a Nuxt 4 headless storefront |
| [`create-bluemtx-extension`](./packages/create-bluemtx-extension) | Scaffold a trusted Composition slot extension |
| [`starters/bluemtx-nuxt-storefront`](./starters/bluemtx-nuxt-storefront) | Reference Nuxt starter (also embedded in the create CLI) |

The BlueMatrix ERP / Commerce platform monorepo stays **private**. This kit is the supported public surface for storefront customization.

## Quick start (headless storefront)

```bash
npx create-bluemtx-storefront my-store
cd my-store
cp .env.example .env   # set NUXT_PUBLIC_STORE_SLUG + Commerce URL
npm install
npm run dev
```

Fallback (GitHub Release tarball):

```bash
npx --yes https://github.com/bluemtx/storefront-kit/releases/download/v0.2.2/create-bluemtx-storefront-0.2.2.tgz my-store
```

## Install the SDK only

```bash
npm install @bluemtx/storefront-sdk
```

Fallback:

```bash
npm install https://github.com/bluemtx/storefront-kit/releases/download/v0.2.2/bluemtx-storefront-sdk-0.2.2.tgz
```

## Customization model

Prefer this order (do **not** add legacy theme packs):

1. **Brand** — logo, colors, fonts, custom CSS (merchant Brand System)
2. **Composition** — page templates + blocks (standard stores)
3. **Trusted extensions** — approved slot packages (`create-bluemtx-extension`)
4. **Headless** — external app on Cloudflare Workers + this SDK

## Releases / CI

Tag pushes (`v*`) pack `.tgz` assets, upload a GitHub Release, and publish to [npmjs](https://www.npmjs.com/).

**Preferred:** [Trusted Publisher (OIDC)](https://docs.npmjs.com/trusted-publishers) on each package → GitHub Actions → org `bluemtx`, repo `storefront-kit`, workflow `release.yml` (allow `npm publish`). The workflow already sets `id-token: write`.

**Fallback:** repo secret **`OIDC Trusted Publisher only (no NPM_TOKEN in the publish step).

## Docs

- [Getting started](./docs/getting-started.md)
- [Public API contract](./docs/public-contract.md)
- [Headless deployment](./docs/headless-deployment.md)

## License

MIT — see [LICENSE](./LICENSE).

Product: [BlueMTX.com](https://bluemtx.com) · Help: [help.bluemtx.com](https://help.bluemtx.com)
