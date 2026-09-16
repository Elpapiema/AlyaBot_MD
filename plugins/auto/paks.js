/*import fs from 'node:fs'
import path from 'node:path'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

const PACK_DIR = './packs'

function ensureDir() {
  if (!fs.existsSync(PACK_DIR)) {
    fs.mkdirSync(PACK_DIR, { recursive: true })
  }
}

function unwrapMessageContainer(message) {
  let current = message

  while (
    current?.ephemeralMessage?.message
    || current?.viewOnceMessage?.message
    || current?.viewOnceMessageV2?.message
  ) {
    current = current.ephemeralMessage?.message
      || current.viewOnceMessage?.message
      || current.viewOnceMessageV2?.message
  }

  return current || message
}

function extractStickerMedia(message) {
  const source = unwrapMessageContainer(message)
  if (!source || typeof source !== 'object') return null

  if (source.stickerMessage) {
    return {
      type: 'sticker',
      message: source.stickerMessage,
      kind: 'stickerMessage'
    }
  }

  if (source.lottieStickerMessage?.message?.stickerMessage) {
    return {
      type: 'sticker',
      message: source.lottieStickerMessage.message.stickerMessage,
      kind: 'lottieStickerMessage'
    }
  }

  for (const value of Object.values(source)) {
    if (!value || typeof value !== 'object') continue
    const nested = extractStickerMedia(value)
    if (nested) return nested
  }

  return null
}

function sanitizeName(value = '') {
  return String(value || 'unknown').replace(/[^a-z0-9_-]/gi, '_')
}

function resolveStickerFileInfo(media, msg) {
  const mime = String(media?.message?.mimetype || '').toLowerCase()
  const isLottie = mime === 'application/was'
    || mime === 'application/x-tgsticker'
    || media?.message?.isLottie === true

  const ext = isLottie ? 'was' : 'webp'
  const id = sanitizeName(msg?.key?.id || Date.now())
  return {
    ext,
    mime: isLottie ? 'application/was' : 'image/webp',
    baseName: `${id}_${Date.now()}`
  }
}

async function downloadStickerBuffer(media) {
  const stream = await downloadContentFromMessage(media.message, media.type)
  const chunks = []
  for await (const chunk of stream) chunks.push(chunk)
  return Buffer.concat(chunks)
}

function saveJson(filePath, payload) {
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2))
}

export default {
  name: 'paks',

  async all({ msg, sender, remoteJid }) {
    try {
      ensureDir()

      const media = extractStickerMedia(msg?.message)
      if (!media) return

      const file = resolveStickerFileInfo(media, msg)
      const buffer = await downloadStickerBuffer(media)
      const binPath = path.join(PACK_DIR, `${file.baseName}.${file.ext}`)
      const jsonPath = path.join(PACK_DIR, `${file.baseName}.json`)

      fs.writeFileSync(binPath, buffer)

      saveJson(jsonPath, {
        type: 'StickerCapture',
        stickerKind: media.kind,
        chat: remoteJid,
        sender,
        key: msg?.key || null,
        timestamp: msg?.messageTimestamp || null,
        mime: file.mime,
        fileName: path.basename(binPath),
        message: msg?.message || null,
        raw: msg
      })

      console.log(`📦 Sticker capturado: ${path.basename(binPath)}`)
    } catch (error) {
      console.error('❌ Error en paks:', error)
    }
  }
}*/
