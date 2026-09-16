import fetch from 'node-fetch'

function shuffleArray(array) {
  let arr = array.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default {
  name: 'tiktok_slides',
  command: ['ttp', 'ttsl', 'ttph'],
  groupOnly: false,
  adminOnly: false,
  ownerOnly: false,

  async run({ sock, msg, remoteJid, args }) {

    const url = args?.[0]

    if (!url) {
      return sock.sendMessage(remoteJid, {
        text: '⚠️ Proporciona la URL de una presentación de TikTok.\n\nEjemplo:\n.ttsl https://vt.tiktok.com/ZSBy3kxKw/'
      }, { quoted: msg })
    }

    const servers = [
      { name: 'Servidor Masha', baseUrl: masha },
      { name: 'Servidor Alya', baseUrl: alya },
      { name: 'Servidor Masachika', baseUrl: masachika }
    ]

    async function tryServers(serversList) {
      if (serversList.length === 0) {
        throw new Error('❌ Todos los servidores fallaron. Intenta más tarde.')
      }

      const [currentServer, ...rest] = serversList

      try {

        const apiUrl = `${currentServer.baseUrl}/Tiktok_slidesdl?url=${encodeURIComponent(url)}`
        const res = await fetch(apiUrl)

        if (!res.ok) throw new Error(`HTTP error ${res.status}`)

        const json = await res.json()

        if (!json.slides || !Array.isArray(json.slides) || json.slides.length === 0) {
          throw new Error('No se encontraron slides en la respuesta')
        }

        return { json, server: currentServer }

      } catch (e) {
        console.error(`Error en ${currentServer.name}:`, e.message || e)
        return tryServers(rest)
      }
    }

    try {

      const { json, server } = await tryServers(shuffleArray(servers))

      await sock.sendMessage(remoteJid, {
        image: { url: json.slides[0] },
        caption: `✅ Imágenes extraídas exitosamente.\nTotal: ${json.slides.length}\nProcesado por: ${server.name}`
      }, { quoted: msg })

      for (let i = 1; i < json.slides.length; i++) {
        await sock.sendMessage(remoteJid, {
          image: { url: json.slides[i] }
        }, { quoted: msg })
      }

    } catch (e) {
      console.error(e)

      await sock.sendMessage(remoteJid, {
        text: e.message || '❌ Error al obtener las imágenes.'
      }, { quoted: msg })
    }
  }
}