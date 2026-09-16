import fetch from 'node-fetch'

export default {
  name: 'tiktok',
  command: ['tt', 'tiktok'],
  groupOnly: false,
  adminOnly: false,
  ownerOnly: false,

  async run({ sock, msg, remoteJid, args, text, command, prefix }) {

    const url = args?.[0] || text

    if (!url) {
      return sock.sendMessage(remoteJid, {
        text: `Ups parece que olvidaste darme el enlace de TikTok.\n\nEjemplo de uso:\n${prefix || '#'}${command} https://www.tiktok.com/@usuario/video/1234567890`
      }, { quoted: msg })
    }

    const servers = [
      { name: 'Server Masha', url: masha },
      { name: 'Server Alya', url: alya },
      { name: 'Server Masachika', url: masachika }
    ]

    const shuffledServers = [...servers].sort(() => Math.random() - 0.5)

    let success = false
    let lastError = ''

    for (const server of shuffledServers) {
      const endpoint = `${server.url}/Tiktok_videodl?url=${encodeURIComponent(url)}`

      try {

        const res = await fetch(endpoint)
        if (!res.ok) throw new Error(`Respuesta inválida (${res.status})`)

        const json = await res.json()
        if (!json.video_url) throw new Error(`El servidor no devolvió un video válido`)

        await sock.sendMessage(remoteJid, {
          video: { url: json.video_url },
          mimetype: 'video/mp4',
          caption: `✅ *Descarga exitosa*\n🎬 Aquí tienes tu video de TikTok\n\n💫 Procesado por: *${server.name}*`
        }, { quoted: msg })

        success = true
        break

      } catch (err) {
        lastError = `❌ Falló ${server.name}: ${err.message || err}`
        console.log(lastError)
      }
    }

    if (!success) {
      await sock.sendMessage(remoteJid, {
        text: `🚫 No se pudo descargar el video desde ninguno de los servidores disponibles.\n\n${lastError}`
      }, { quoted: msg })
    }
  }
}