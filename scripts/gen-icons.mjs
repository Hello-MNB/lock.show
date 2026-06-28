// Generates clean PLACEHOLDER PWA icons (canon colors) with no image libraries.
// Not the final brand mark — name/design not chosen yet. Run: node scripts/gen-icons.mjs
import { writeFileSync, mkdirSync } from 'node:fs'
import zlib from 'node:zlib'

const crcTable = (() => {
  const t = []
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0 }
  return t
})()
const crc32 = (buf) => { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([len, body, crc])
}
function png(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6
  const stride = size * 4
  const raw = Buffer.alloc((stride + 1) * size)
  for (let y = 0; y < size; y++) { raw[y * (stride + 1)] = 0; rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride) }
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}
// ink bg (#0E0F13) + accent ring (#F0C24B) + accent dot — a calm "proof" badge.
function draw(size, { maskable = false } = {}) {
  const ink = [14, 15, 19, 255], accent = [240, 194, 75, 255], soft = [196, 201, 214, 255]
  const buf = Buffer.alloc(size * size * 4)
  const cx = size / 2 - 0.5, cy = size / 2 - 0.5
  const R = size * (maskable ? 0.30 : 0.36)   // outer ring radius
  const ringW = size * 0.06
  const dot = size * 0.10
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4
    const d = Math.hypot(x - cx, y - cy)
    let col = ink
    if (d < dot) col = accent
    else if (d > R - ringW && d < R) col = accent
    else if (d >= R && d < R + size * 0.012) col = soft
    buf[i] = col[0]; buf[i + 1] = col[1]; buf[i + 2] = col[2]; buf[i + 3] = col[3]
  }
  return buf
}
mkdirSync('public', { recursive: true })
for (const [name, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180], ['favicon-32.png', 32]]) {
  writeFileSync(`public/${name}`, png(size, draw(size)))
}
writeFileSync('public/icon-maskable-512.png', png(512, draw(512, { maskable: true })))
console.log('✓ placeholder icons generated in public/')
