import { sticker } from '../../lib/sticker.js'
import uploadFile from '../../lib/uploadFile.js'
import uploadImage from '../../lib/uploadImage.js'
import { webp2png } from '../../lib/webp2mp4.js'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

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
  if (message.videoMessage) return { type: 'video', message: message.videoMessage }
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

export default {
  name: 'sticker',
  command: ['s', 'sticker'],
  tags: ['sticker'],
  register: true,

  async run({ sock, msg, args, remoteJid, usedPrefix, command }) {

    let stiker = false

    let stick = args.join(" ").split("|")
    let f = stick[0] !== "" ? stick[0] : global.packname
    let g = typeof stick[1] !== "undefined" ? stick[1] : global.author

    try {

      const quotedContext = getQuotedContext(msg)
      const quotedMedia = quotedContext ? extractMediaFromQuoted(quotedContext.quotedMessage) : null
      const directMedia = extractMediaFromMessage(msg.message)
      const media = quotedMedia || directMedia
      const mime = media?.message?.mimetype || media?.message?.mediaType || ''

      if (media && /webp|image|video|sticker/g.test(mime || media.type)) {

        if (/video/g.test(mime || media.type)) {
          if (media?.message?.seconds > 18) {
            return sock.sendMessage(remoteJid, {
              text: '⚠️ ¿Dónde has visto un sticker de 15 segundos? Haz el video más corto (máx 12s).'
            }, { quoted: msg })
          }
        }

        let img = await downloadMedia(media)

        if (!img) {
          return sock.sendMessage(remoteJid, {
            text: `*Y la imagen? 🤔 Responde a una imagen para hacer el sticker.*\nUsa: ${usedPrefix + command}`
          }, { quoted: msg })
        }

        let out

        try {

          stiker = await sticker(img, false, f, g)

        } catch (e) {

          console.error(e)

        } finally {

          if (!stiker) {

            if (/webp/g.test(mime) || media.type === 'sticker') out = await webp2png(img)
            else if (/image/g.test(mime) || media.type === 'image') out = await uploadImage(img)
            else if (/video/g.test(mime) || media.type === 'video') out = await uploadFile(img)

            if (typeof out !== 'string') out = await uploadImage(img)

            stiker = await sticker(false, out, f, g)

          }

        }

      } else if (args[0]) {

        if (isUrl(args[0])) {
          stiker = await sticker(false, args[0], global.packname, global.author)
        } else {

          return sock.sendMessage(remoteJid, {
            text: 'URL inválido'
          }, { quoted: msg })

        }

      }

    } catch (e) {

      console.error(e)

      if (!stiker) stiker = e

    } finally {

      if (Buffer.isBuffer(stiker)) {
        await sock.sendMessage(remoteJid, {
          sticker: stiker
        }, { quoted: msg })
      } else {
        if (stiker instanceof Error) {
          console.error(stiker)
        }
        return sock.sendMessage(remoteJid, {
          text: `*Y la imagen? 🤔 Responde a una imagen para hacer el sticker.*\nUsa: ${usedPrefix + command}`
        }, { quoted: msg })
      }

    }
  }
}

const isUrl = (text) => {
  return text.match(
    new RegExp(
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png)/,
      'gi'
    )
  )
}
