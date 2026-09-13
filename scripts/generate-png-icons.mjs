import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

function createPngBuffer(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(width, 0)
  ihdrData.writeUInt32BE(height, 4)
  ihdrData.writeUInt8(8, 8) // bit depth: 8
  ihdrData.writeUInt8(2, 9) // color type: 2 (RGB)
  ihdrData.writeUInt8(0, 10) // compression: 0
  ihdrData.writeUInt8(0, 11) // filter: 0
  ihdrData.writeUInt8(0, 12) // interlace: 0

  const ihdrChunk = makeChunk('IHDR', ihdrData)

  // Raw image data: filter byte (0) + RGB per pixel
  const rowSize = 1 + width * 3
  const rawData = Buffer.alloc(height * rowSize)
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize
    rawData[rowOffset] = 0 // None filter
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 3
      rawData[pixelOffset] = r
      rawData[pixelOffset + 1] = g
      rawData[pixelOffset + 2] = b
    }
  }

  const compressedData = zlib.deflateSync(rawData)
  const idatChunk = makeChunk('IDAT', compressedData)
  const iendChunk = makeChunk('IEND', Buffer.alloc(0))

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk])
}

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) {
      c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
    }
  }
  return (c ^ 0xffffffff) >>> 0
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)

  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(typeAndData), 0)

  return Buffer.concat([len, typeAndData, crcBuf])
}

const iconsDir = path.resolve('public/icons')
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// Indigo #4f46e5 -> (79, 70, 229)
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), createPngBuffer(192, 192, 79, 70, 229))
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), createPngBuffer(512, 512, 79, 70, 229))

console.log('PNG icons generated successfully!')
