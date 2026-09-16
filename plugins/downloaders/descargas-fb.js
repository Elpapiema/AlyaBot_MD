import fetch from 'node-fetch'

export default {
  name: 'facebook',
  command: ['fb', 'facebook'],
  groupOnly: false,
  adminOnly: false,
  ownerOnly: false,

  async run({ sock, msg, remoteJid, args, command }) {

    const url = args?.[0]

    if (!url) {
      return sock.sendMessage(remoteJid, {
        text: `*Uso correcto:* .${command} <enlace de Facebook>`
      }, { quoted: msg })
    }

    try {

      const res = await fetch(`https://eliasar-yt-api.vercel.app/api/facebookdl?link=${encodeURIComponent(url)}`)
      if (!res.ok) throw new Error('Error al contactar con la API')

      const json = await res.json()

      if (!json.status || !json.data || !json.data.length) {
        throw new Error('No se pudo obtener el video.')
      }

      const video = json.data[0].url

      await sock.sendMessage(remoteJid, {
        video: { url: video },
        mimetype: 'video/mp4',
        caption: '✅ *Aquí tienes tu video de Facebook*'
      }, { quoted: msg })

    } catch (e) {
      await sock.sendMessage(remoteJid, {
        text: `❌ ${e.message || e}`
      }, { quoted: msg })
    }

  }
}