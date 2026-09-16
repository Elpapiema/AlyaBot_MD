import { downloadContentFromMessage } from '@whiskeysockets/baileys'

function unwrapMessageContainer(message) {
  let current = message

  while (current?.ephemeralMessage?.message || current?.viewOnceMessage?.message || current?.viewOnceMessageV2?.message) {
    current = current.ephemeralMessage?.message
      || current.viewOnceMessage?.message
      || current.viewOnceMessageV2?.message
  }

  return current || message
}

function findQuotedContext(node) {
  if (!node || typeof node !== 'object') return null
  if (node?.contextInfo?.quotedMessage) return node.contextInfo

  for (const value of Object.values(node)) {
    const found = findQuotedContext(value)
    if (found) return found
  }

  return null
}

function getQuotedContext(msg) {
  return findQuotedContext(unwrapMessageContainer(msg?.message || {}))
}

function extractMediaFromMessage(message) {
  const source = unwrapMessageContainer(message)
  if (!source) return null
  if (source.stickerMessage) return { type: 'sticker', message: source.stickerMessage }
  if (source.documentMessage) return { type: 'document', message: source.documentMessage }
  return null
}

function extractMediaFromQuoted(quotedMessage) {
  const source = unwrapMessageContainer(quotedMessage)
  if (!source) return null
  const keys = Object.keys(source)
  if (!keys.length) return null
  const rawType = keys[0]
  const message = source[rawType]
  const type = rawType.replace(/Message$/, '')
  return { type, message }
}

async function downloadMedia(media) {
  const stream = await downloadContentFromMessage(media.message, media.type)
  const chunks = []
  for await (const chunk of stream) chunks.push(chunk)
  return Buffer.concat(chunks)
}

function resolveCapturedFile(media) {
  const mime = String(media?.message?.mimetype || media?.message?.mediaType || '').toLowerCase()

  if (mime === 'application/was' || mime === 'application/x-tgsticker') {
    return { mimetype: 'application/was', fileName: `captured-${Date.now()}.was` }
  }

  return { mimetype: 'image/webp', fileName: `captured-${Date.now()}.webp` }
}

export default {
  name: 'capture',
  command: ['capture'],
  tags: ['tools'],

  async run({ sock, msg, remoteJid, usedPrefix, command }) {
    try {
      const quotedContext = getQuotedContext(msg)
      const quotedMedia = quotedContext ? extractMediaFromQuoted(quotedContext.quotedMessage) : null
      const directMedia = extractMediaFromMessage(msg.message)
      const media = quotedMedia || directMedia

      if (!media || !['sticker', 'document'].includes(media.type)) {
        return sock.sendMessage(remoteJid, {
          text: `Responde a cualquier sticker y usa ${usedPrefix + command}.`
        }, { quoted: msg })
      }

      const buffer = await downloadMedia(media)
      const file = resolveCapturedFile(media)
      await sock.sendMessage(remoteJid, {
        document: buffer,
        mimetype: file.mimetype,
        fileName: file.fileName
      }, { quoted: msg })
    } catch (error) {
      console.error(error)
      await sock.sendMessage(remoteJid, {
        text: `❌ No pude capturar el sticker.\n${error.message}`
      }, { quoted: msg })
    }
  }
}
