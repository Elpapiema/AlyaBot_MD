import fetch from 'node-fetch'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = async (m, { text, usedPrefix, command, conn }) => {
  let q = m.quoted || m
  let mime = (q.msg || q).mimetype || ''
  let hasImage = /^image\/(jpe?g|png)$/.test(mime)

  if (!text && !hasImage) {
    return conn.reply(m.chat, `💡 Envía o responde a una imagen con una pregunta, o escribe un prompt para generar una imagen.\n\nEjemplo:\n${usedPrefix + command} ¿Qué ves en esta imagen?\n${usedPrefix + command} Genera una imagen de un zorro en la luna`, m)
  }

  try {
    await m.react('🌟')
    conn.sendPresenceUpdate('composing', m.chat)

    let base64Image = null
    let mimeType = null

    if (hasImage) {
      const stream = await downloadContentFromMessage(q, 'image')
      let buffer = Buffer.from([])
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }

      base64Image = `data:${mime};base64,${buffer.toString('base64')}`
      mimeType = mime
    }

    const body = {
      prompts: text ? [text] : [],
      imageBase64List: base64Image ? [base64Image] : [],
      mimeTypes: mimeType ? [mimeType] : [],
      temperature: 0.7
    }

    const res = await fetch('https://g-mini-ia.vercel.app/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const data = await res.json()


    if (data?.image && data?.from === 'image-generator') {
      return await conn.sendFile(m.chat, data.image, 'imagen.jpg', ` Claro aquí tienes tu imagen de "${text}" espero te guste 😸 \n\n\n> Gemini (IA) ✨`, m)
    }


    const respuesta = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!respuesta) throw '❌ No se recibió respuesta válida de la IA.'

    await m.reply(respuesta.trim())
    await m.react('✅')

  } catch (e) {
    console.error('[ERROR GEMINI]', e)
    await m.react('⚠️')
    await conn.reply(m.chat, '⚠️ Ocurrió un error procesando la imagen o pregunta.', m)
  }
}

handler.command = ['gemini', 'geminis', 'imgia', 'imagina']
handler.help = ['gemini <pregunta o prompt>']
handler.tags = ['ai']
handler.group = false

export default handler

/*import fetch from 'node-fetch'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

const MAX_IMAGE_SIZE_MB = 5

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const q = m.quoted || m
  const mime = (q.msg || q).mimetype || ''
  const isSupportedImage = /^image\/(jpe?g|png|webp|gif)$/.test(mime)

  if (!text && !isSupportedImage) {
    return conn.reply(m.chat, `💡 Envía o responde a una imagen (jpg, png, webp, gif) con una pregunta.\n\nEjemplo:\n${usedPrefix + command} ¿Qué ves en esta imagen?`, m)
  }

  try {
    await m.react('🌟')
    conn.sendPresenceUpdate('composing', m.chat)

    let base64Image = null
    let mimeType = null

    if (isSupportedImage) {
      const stream = await downloadContentFromMessage(q, 'image')
      let buffer = Buffer.from([])

      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }

      // Validar tamaño máximo
      const sizeInMB = buffer.length / (1024 * 1024)
      if (sizeInMB > MAX_IMAGE_SIZE_MB) {
        await m.react('⚠️')
        return conn.reply(m.chat, `⚠️ La imagen es demasiado grande (${sizeInMB.toFixed(2)} MB). Límite: ${MAX_IMAGE_SIZE_MB} MB.`, m)
      }

      base64Image = `data:${mime};base64,${buffer.toString('base64')}`
      mimeType = mime
    }

    const body = {
      prompts: text ? [text] : [],
      imageBase64List: base64Image ? [base64Image] : [],
      mimeTypes: mimeType ? [mimeType] : [],
      temperature: 0.7
    }

    const res = await fetch('https://g-mini-ia.vercel.app/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!res.ok) throw `🌐 Error en la API: ${res.status} ${res.statusText}`

    const data = await res.json()
    const respuesta = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!respuesta) throw '❌ No se recibió respuesta válida de la IA.'

    await m.reply(respuesta.trim())

  } catch (e) {
    console.error('[❌ Gemini Plugin Error]', e)
    await m.react('⚠️')
    await conn.reply(m.chat, '⚠️ Ocurrió un error procesando la imagen o pregunta. Intenta de nuevo más tarde.', m)
  }
}

handler.command = ['gemini', 'geminis']
handler.help = ['gemini <pregunta>']
handler.tags = ['ai']
handler.group = false // ponlo en true si quieres que funcione también en grupos

export default handler

*/