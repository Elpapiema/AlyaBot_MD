import fetch from 'node-fetch'

const SERVERS = [
  { name: 'Servidor Masha', baseUrl: masha },
  { name: 'Servidor Alya', baseUrl: alya },
  { name: 'Servidor Masachika', baseUrl: masachika }
]

// Mezclar servidores
function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5)
}

// Intentar servidores
async function tryServers(servers, endpoint, queryParam) {
  const shuffled = shuffleArray(servers)

  for (const server of shuffled) {
    try {
      const url = `${server.baseUrl}${endpoint}${encodeURIComponent(queryParam)}`
      const res = await fetch(url)

      if (!res.ok) throw new Error(`Error HTTP ${res.status}`)

      const json = await res.json()
      if (!json || Object.keys(json).length === 0) throw new Error('Respuesta vacía')

      return { json, server: server.name }

    } catch (err) {
      console.error(`❌ ${server.name} falló:`, err.message || err)
      continue
    }
  }

  throw new Error('❌ Todos los servidores fallaron. Intenta más tarde.')
}

export default {
  name: 'play2',
  command: ['play2', 'mp4', 'ytmp4', 'playmp4'],
  groupOnly: false,
  adminOnly: false,
  ownerOnly: false,

  async run({ sock, msg, remoteJid, text }) {

    if (!text) {
      return sock.sendMessage(remoteJid, {
        text: '🔍 Ingresa el nombre del video.\nEjemplo: *.play2 Usewa Ado*'
      }, { quoted: msg })
    }

    try {

      const { json: searchJson, server: searchServer } =
        await tryServers(SERVERS, '/search_youtube?query=', text)

      if (!searchJson.results?.length) {
        return sock.sendMessage(remoteJid, {
          text: '⚠️ No se encontraron resultados para tu búsqueda.'
        }, { quoted: msg })
      }

      const video = searchJson.results[0]

      const thumb =
        video.thumbnails.find(t => t.width === 720)?.url ||
        video.thumbnails[0]?.url

      const videoTitle = video.title
      const videoUrl = video.url
      const duration = Math.floor(video.duration)

      const msgInfo = `
╭─⃝🌸⃝─⃝❀⃝─〔 彡 AlyaBot 彡 〕─⃝❀⃝─⃝🌸⃝─╮
│
│  (๑>◡<๑)✨ ¡Aquí tienes tu Video~!
│
│━━━━━━━━━━━━━━━━━━━━━━━
│💿 Título: ${videoTitle} 🌸
│⏱️ Duración: ${duration}s
│👀 Vistas: ${video.views.toLocaleString()}
│🎤 Autor: ${video.channel}
│🔗 Link: ${videoUrl}
│📡 Servidor: ${searchServer}-nyan~ 🐾
╰─⃝🌸⃝─〔 Enviando con amor 〕─⃝🌸⃝─╯
`.trim()

      await sock.sendMessage(remoteJid, {
        image: { url: thumb },
        caption: msgInfo
      }, { quoted: msg })

      let downloadJson

      try {
        const { json } =
          await tryServers(SERVERS, '/download_video?url=', videoUrl)
        downloadJson = json
      } catch {
        console.error('⚠️ Endpoint principal falló, usando respaldo...')
        const { json } =
          await tryServers(SERVERS, '/download_videoV2?url=', videoUrl)
        downloadJson = json
      }

      if (!downloadJson?.file_url) {
        return sock.sendMessage(remoteJid, {
          text: '❌ No se pudo descargar el video.'
        }, { quoted: msg })
      }

      await sock.sendMessage(remoteJid, {
        video: { url: downloadJson.file_url },
        mimetype: 'video/mp4',
        fileName: `${downloadJson.title || videoTitle}.mp4`
      }, { quoted: msg })

    } catch (e) {
      console.error(e)

      await sock.sendMessage(remoteJid, {
        text: '❌ Error al procesar tu solicitud.'
      }, { quoted: msg })
    }
  }
}