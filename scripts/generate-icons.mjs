import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = path.join(root, 'src/assets/branding/sumba-mascot-source.png')
const iconsDir = path.join(root, 'public/icons')
const bg = { r: 10, g: 10, b: 10, alpha: 1 }

async function iconWithPadding(size, innerScale) {
  const inner = Math.round(size * innerScale)
  const resized = await sharp(source)
    .resize(inner, inner, { fit: 'contain', background: bg })
    .png()
    .toBuffer()
  const offset = Math.round((size - inner) / 2)
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: bg,
    },
  })
    .composite([{ input: resized, left: offset, top: offset }])
    .png()
}

await mkdir(iconsDir, { recursive: true })

await (await iconWithPadding(192, 0.88)).toFile(path.join(iconsDir, 'icon-192.png'))
await (await iconWithPadding(512, 0.88)).toFile(path.join(iconsDir, 'icon-512.png'))
await (await iconWithPadding(512, 0.72)).toFile(
  path.join(iconsDir, 'icon-maskable-512.png'),
)

await sharp(source)
  .resize(32, 32, { fit: 'contain', background: bg })
  .png()
  .toFile(path.join(root, 'public/favicon-32.png'))

await sharp(source)
  .resize(180, 180, { fit: 'contain', background: bg })
  .png()
  .toFile(path.join(root, 'public/apple-touch-icon.png'))

await sharp(source)
  .resize(32, 32, { fit: 'contain', background: bg })
  .toFile(path.join(root, 'public/favicon.ico'))

console.log('Icons written to public/icons, favicon.ico, apple-touch-icon.png')
