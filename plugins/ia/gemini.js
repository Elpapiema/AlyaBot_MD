import fetch from 'node-fetch'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

const MAX_IMAGE_SIZE_MB = 5

async function readQuotedImage(msg) {
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
  const imageMessage = quoted?.imageMessage || msg.message?.imageMessage || null
  if (!imageMessage) return null

  const stream = await downloadContentFromMessage(imageMessage, 'image')
  let buffer = Buffer.from([])

  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk])
  }

  return {
    buffer,
    mime: imageMessage.mimetype || 'image/jpeg'
  }
}

export default {
  name: 'gemini',
  command: ['gemini', 'geminis', 'imgia', 'imagina'],
  tags: ['ai'],

  async run({ sock, msg, text, commandName, usedPrefix, remoteJid }) {
    const imageData = await readQuotedImage(msg).catch(() => null)

    if (!text && !imageData) {
      return sock.sendMessage(remoteJid, {
        text: `💡 Envía o responde a una imagen con una pregunta, o escribe un prompt para generar una imagen.\n\nEjemplo:\n${usedPrefix}${commandName} ¿Qué ves en esta imagen?\n${usedPrefix}${commandName} Genera una imagen de un zorro en la luna`
      }, { quoted: msg })
    }

    try {
      let base64Image = null
      let mimeType = null

      if (imageData) {
        const sizeInMB = imageData.buffer.length / (1024 * 1024)
        if (sizeInMB > MAX_IMAGE_SIZE_MB) {
          return sock.sendMessage(remoteJid, {
            text: `⚠️ La imagen es demasiado grande (${sizeInMB.toFixed(2)} MB). Límite: ${MAX_IMAGE_SIZE_MB} MB.`
          }, { quoted: msg })
        }

        base64Image = `data:${imageData.mime};base64,${imageData.buffer.toString('base64')}`
        mimeType = imageData.mime
      }

      const response = await fetch('https://g-mini-ia.vercel.app/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompts: text ? [text] : [],
          imageBase64List: base64Image ? [base64Image] : [],
          mimeTypes: mimeType ? [mimeType] : [],
          temperature: 0.7
        })
      })

      if (!response.ok) throw new Error(`🌐 Error en la API: ${response.status} ${response.statusText}`)

      const data = await response.json()

      if (data?.image && data?.from === 'image-generator') {
        return sock.sendMessage(remoteJid, {
          image: { url: data.image },
          caption: `Claro, aquí tienes tu imagen de "${text}" espero te guste 😸\n\n> Gemini (IA) ✨`
        }, { quoted: msg })
      }

      const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (!answer) throw new Error('❌ No se recibió respuesta válida de la IA.')

      await sock.sendMessage(remoteJid, { text: answer.trim() }, { quoted: msg })
    } catch (error) {
      console.error('[GEMINI]', error)
      await sock.sendMessage(remoteJid, {
        text: '⚠️ Ocurrió un error procesando la imagen o pregunta.'
      }, { quoted: msg })
    }
  }
}
