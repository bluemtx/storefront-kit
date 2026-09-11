#!/usr/bin/env node
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, join } from 'node:path'

const key = process.argv[2] || 'my-extension'
const version = process.argv[3] || '1.0.0'
const target = resolve(process.cwd(), key)

if (!/^[a-z0-9][a-z0-9_-]*$/.test(key)) {
  console.error('Extension key must be lowercase alphanumeric (dashes/underscores allowed).')
  process.exit(1)
}

if (existsSync(target)) {
  console.error(`Target already exists: ${target}`)
  process.exit(1)
}

mkdirSync(join(target, 'dist'), { recursive: true })

const entry = `(function () {
  window.addEventListener('bos:storefront-extension-mount', function (event) {
    if (event.detail?.key !== '${key}') return
    try {
      event.detail.el.textContent = '${key} ready'
    } catch (e) {
      console.warn('[${key}]', e)
    }
  })
})()
`

writeFileSync(join(target, 'dist/entry.js'), entry)
const integrity = 'sha384-' + createHash('sha384').update(entry).digest('base64')

const manifest = {
  schema_version: 1,
  key,
  version,
  sdk: { major: 1, min: '1.0.0' },
  entry: {
    url: `https://cdn.example.com/extensions/${key}/${version}/entry.js`,
    integrity,
  },
  slots: ['product.after-description'],
}

writeFileSync(join(target, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
writeFileSync(join(target, 'package.json'), `${JSON.stringify({
  name: key,
  version,
  private: true,
  description: `BlueMTX trusted storefront extension: ${key}`,
}, null, 2)}\n`)

writeFileSync(join(target, 'README.md'), `# ${key}

Trusted BlueMTX storefront extension scaffold (Composition slots).

1. Host \`dist/entry.js\` immutably (versioned URL).
2. Register via Commerce platform (Blue / approved agency publisher only).
3. Assign to a store slot from merchant tools / ops API.

SRI (sha384) for this build: \`${integrity}\`
`)

console.log(`Created extension scaffold at ${target}`)
console.log(`Integrity: ${integrity}`)
