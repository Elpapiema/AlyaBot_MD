import { loadPersonalize, savePersonalize } from '../../lib/storage.js'

function getCurrentVideos(data) {
  return data.global?.videos?.length ? data.global.videos : data.default?.videos || []
}

export default {
  name: 'owner-personalize',
  command: ['setname', 'setmoneda', 'setbanner', 'delbanner', 'viewbanner', 'resetpreferences'],
  tags: ['config'],
  ownerOnly: true,

  async run({ sock, msg, text, commandName, remoteJid }) {
    const data = await loadPersonalize()

    if (commandName === 'setname') {
      if (!text) {
        return sock.sendMessage(remoteJid, { text: '❌ Debes proporcionar un nombre para el bot.' }, { quoted: msg })
      }

      data.global.botName = text
      await savePersonalize(data)
      return sock.sendMessage(remoteJid, { text: `✅ Nombre del bot actualizado a: *${text}*` }, { quoted: msg })
    }

    if (commandName === 'setmoneda') {
      if (!text) {
        return sock.sendMessage(remoteJid, { text: '❌ Debes proporcionar un nombre para la moneda.' }, { quoted: msg })
      }

      data.global.currency = text
      await savePersonalize(data)
      return sock.sendMessage(remoteJid, { text: `✅ Moneda global actualizada a: *${text}*` }, { quoted: msg })
    }

    if (commandName === 'setbanner') {
      if (!text) {
        return sock.sendMessage(remoteJid, { text: '❌ Debes proporcionar un enlace de video.' }, { quoted: msg })
      }

      if (!Array.isArray(data.global.videos)) data.global.videos = []
      data.global.videos.push(text)
      await savePersonalize(data)
      return sock.sendMessage(remoteJid, { text: '✅ Video agregado correctamente.' }, { quoted: msg })
    }

    if (commandName === 'delbanner') {
      if (!text) {
        return sock.sendMessage(remoteJid, {
          text: '❌ Debes proporcionar el enlace del video que deseas eliminar.'
        }, { quoted: msg })
      }

      if (!data.global?.videos?.includes(text)) {
        return sock.sendMessage(remoteJid, {
          text: '❌ El video proporcionado no existe en la lista.'
        }, { quoted: msg })
      }

      data.global.videos = data.global.videos.filter((url) => url !== text)
      await savePersonalize(data)
      return sock.sendMessage(remoteJid, { text: '✅ Video eliminado correctamente.' }, { quoted: msg })
    }

    if (commandName === 'viewbanner') {
      const videos = getCurrentVideos(data)
      const videoList = videos.length
        ? videos.map((url, index) => `${index + 1}. ${url}`).join('\n')
        : '❌ No hay videos configurados.'

      return sock.sendMessage(remoteJid, {
        text: videos.length ? `🎥 *Videos configurados:*\n\n${videoList}` : videoList
      }, { quoted: msg })
    }

    data.global = {
      botName: null,
      currency: null,
      videos: []
    }
    await savePersonalize(data)
    await sock.sendMessage(remoteJid, {
      text: '✅ Personalización global restablecida.'
    }, { quoted: msg })
  }
}
