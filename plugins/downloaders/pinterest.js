import fetch from 'node-fetch'

export default {
  name: 'pinterest',
  command: ['pin', 'pinterest'],
  groupOnly: false,
  adminOnly: false,
  ownerOnly: false,

  async run({ sock, msg, remoteJid, args, text, command, prefix }) {

    const search = args?.join(' ') || text

    if (!search) {
      return sock.sendMessage(remoteJid, {
        text: `Ups, parece que olvidaste escribir qué deseas buscar.\n\nEjemplo de uso:\n${prefix || '#'}${command} Alya icons`
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
      const endpoint = `${server.url}/pinterest?search=${encodeURIComponent(search)}`

      try {

        const res = await fetch(endpoint)
        if (!res.ok) throw new Error(`Respuesta inválida (${res.status})`)

        const json = await res.json()

        if (!json.status || !json.results?.length) {
          throw new Error('No se encontraron resultados')
        }

        const images = json.results
          .filter(item => item.image)
          .slice(0, 5)

        if (!images.length) {
          throw new Error('No se encontraron imágenes válidas')
        }

        for (let i = 0; i < images.length; i++) {
          await sock.sendMessage(remoteJid, {
            image: { url: images[i].image },
            caption: i === 0
              ? `🖼️ *Resultados de:* ${json.query}\n\n💫 Procesado por: *${server.name}*`
              : undefined
          }, { quoted: i === 0 ? msg : undefined })
        }

        success = true
        break

      } catch (err) {
        lastError = `❌ Falló ${server.name}: ${err.message || err}`
        console.log(lastError)
      }
    }

    if (!success) {
      await sock.sendMessage(remoteJid, {
        text: `🚫 No se pudieron obtener resultados desde ninguno de los servidores disponibles.\n\n${lastError}`
      }, { quoted: msg })
    }
  }
}