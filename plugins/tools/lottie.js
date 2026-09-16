import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promises as fs } from 'node:fs'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import { buildLottieSticker } from '../../lib/lottie.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const lottieBaseFolder = path.resolve(__dirname, '../../lib/exemple')

function getQuotedContext(msg) {
  const message = msg?.message || {}
  const candidates = [
    message.extendedTextMessage,
    message.imageMessage,
    message.videoMessage,
    message.documentMessage,
    message.buttonsResponseMessage,
    message.listResponseMessage
  ]

  for (const node of candidates) {
    const ctx = node?.contextInfo
    if (ctx?.quotedMessage) return ctx
  }

  return null
}

function extractMediaFromMessage(message) {
  if (!message) return null
  if (message.imageMessage) return { type: 'image', message: message.imageMessage }
  if (message.stickerMessage) return { type: 'sticker', message: message.stickerMessage }
  if (message.documentMessage) return { type: 'document', message: message.documentMessage }
  return null
}

function extractMediaFromQuoted(quotedMessage) {
  if (!quotedMessage) return null
  const keys = Object.keys(quotedMessage)
  if (!keys.length) return null
  const rawType = keys[0]
  const message = quotedMessage[rawType]
  const type = rawType.replace(/Message$/, '')
  return { type, message }
}

async function downloadMedia(media) {
  const stream = await downloadContentFromMessage(media.message, media.type)
  const chunks = []
  for await (const chunk of stream) chunks.push(chunk)
  return Buffer.concat(chunks)
}

function resolveMime(media) {
  const mime = media?.message?.mimetype || media?.message?.mediaType || ''
  if (/image\/(png|jpeg|jpg|webp)/i.test(mime)) return mime
  if (media?.type === 'image' || media?.type === 'sticker') return mime || 'image/webp'
  return null
}

export default {
  name: 'lottie',
  command: ['lottie'],
  tags: ['sticker'],

  async run({ sock, msg, remoteJid, usedPrefix, command }) {
    let outputPath = null

    try {
      const quotedContext = getQuotedContext(msg)
      const quotedMedia = quotedContext ? extractMediaFromQuoted(quotedContext.quotedMessage) : null
      const directMedia = extractMediaFromMessage(msg.message)
      const media = quotedMedia || directMedia
      const mime = resolveMime(media)

      if (!media || !mime) {
        return sock.sendMessage(remoteJid, {
          text: `Responde a una imagen o sticker para convertirlo con Lottie.\nUsa: ${usedPrefix + command}`
        }, { quoted: msg })
      }

      const buffer = await downloadMedia(media)
      outputPath = path.join(os.tmpdir(), `alya-lottie-${Date.now()}-${crypto.randomUUID()}.was`)

      await buildLottieSticker({
        baseFolder: lottieBaseFolder,
        buffer,
        mime,
        output: outputPath
      })

      const stickerBuffer = await fs.readFile(outputPath)
      await sock.sendMessage(remoteJid, {
        sticker: stickerBuffer,
        mimetype: 'application/was'
      }, { quoted: msg })
    } catch (error) {
      console.error(error)
      await sock.sendMessage(remoteJid, {
        text: `❌ No pude generar el lottie.\n${error.message}`
      }, { quoted: msg })
    } finally {
      if (outputPath) {
        await fs.unlink(outputPath).catch(() => {})
      }
    }
  }
}
