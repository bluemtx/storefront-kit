#!/usr/bin/env node
import { cpSync, mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const targetName = process.argv[2] || 'bluemtx-storefront'
const target = resolve(process.cwd(), targetName)
const starter = resolve(__dirname, '../template')
const sdkRelease =
  process.env.BLUEMTX_SDK_TGZ
  || 'https://github.com/bluemtx/storefront-kit/releases/download/v0.2.2/bluemtx-storefront-sdk-0.2.2.tgz'

if (existsSync(target)) {
  console.error(`Target already exists: ${target}`)
  process.exit(1)
}

if (!existsSync(starter)) {
  console.error(`Starter template missing at ${starter}`)
  process.exit(1)
}

mkdirSync(target, { recursive: true })
cpSync(starter, target, { recursive: true })

const pkgPath = join(target, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
pkg.name = targetName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase() || 'bluemtx-storefront'
pkg.private = true
pkg.dependencies = {
  ...(pkg.dependencies || {}),
  '@bluemtx/storefront-sdk': sdkRelease,
}
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)

writeFileSync(
  join(target, '.gitignore'),
  ['node_modules', '.nuxt', '.output', 'dist', '.env', '.env.*', '!.env.example'].join('\n') + '\n',
)

writeFileSync(
  join(target, '.env.example'),
  [
    '# Commerce API origin (empty = same-origin Worker BFF)',
    'NUXT_PUBLIC_COMMERCE_BASE_URL=https://dev.stores.bluemtx.com',
    'NUXT_PUBLIC_STORE_SLUG=your-store-slug',
    '',
  ].join('\n'),
)

console.log(`Created BlueMTX Nuxt storefront starter at ${target}`)
console.log('Next:')
console.log(`  cd ${targetName}`)
console.log('  cp .env.example .env   # set store slug + Commerce URL')
console.log('  npm install')
console.log('  npm run dev')
