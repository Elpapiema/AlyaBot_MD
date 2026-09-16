import fetch from 'node-fetch'

const SERVERS = [
  { name: 'Servidor Masha', baseUrl: global.masha },
  { name: 'Servidor Alya', baseUrl: global.alya },
  { name: 'Servidor Masachika', baseUrl: global.masachika }
]

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5)
}

async function tryServers(servers, endpoint, query, onTry) {
  const shuffled = shuffleArray(servers)

  for (const server of shuffled) {
    try {
      await onTry?.(server)
      const response = await fetch(`${server.baseUrl}${endpoint}${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const json = await response.json()
      if (!json?.file_url) throw new Error('No se recibió URL de descarga')
      return { json, server }
    } catch (error) {
      console.error(`Error en ${server.name}:`, error.message || error)
    }
  }

  throw new Error('❌ Todos los servidores fallaron. Intenta más tarde.')
}

export default {
  name: 'legacy-media',
  command: ['ytmp3', 'yta', 'yt', 'ytv', 'sp', 'spotify'],
  tags: ['download'],

  async run({ sock, msg, text, commandName, remoteJid }) {
    if (!text) {
      const prompt = ['sp', 'spotify'].includes(commandName)
        ? 'Por favor, proporciona un enlace de Spotify.'
        : commandName === 'yt' || commandName === 'ytv'
          ? '❌ Por favor proporciona un enlace válido para descargar el video.'
          : '❌ Por favor proporciona un enlace válido de YouTube.'

      return sock.sendMessage(remoteJid, { text: prompt }, { quoted: msg })
    }

    try {
      if (['sp', 'spotify'].includes(commandName)) {
        const response = await fetch(`https://restapi.apibotwa.biz.id/api/spotify?url=${encodeURIComponent(text)}`)
        const json = await response.json()

        if (json.status !== 200 || !json.data?.response) {
          return sock.sendMessage(remoteJid, {
            text: '❌ Hubo un problema al obtener el enlace de descarga. Intenta de nuevo más tarde.'
          }, { quoted: msg })
        }

        await sock.sendMessage(remoteJid, {
          audio: { url: json.data.response },
          mimetype: 'audio/mp4'
        }, { quoted: msg })
        return
      }

      const endpoint = ['yt', 'ytv'].includes(commandName) ? '/download_video?url=' : '/download_audio?url='
      const tryingText = ['yt', 'ytv'].includes(commandName) ? 'video' : 'audio'
      const { json, server } = await tryServers(SERVERS, endpoint, text, async (currentServer) => {
        await sock.sendMessage(remoteJid, {
          text: `🔄 Intentando descargar ${tryingText} desde ${currentServer.name}...`
        }, { quoted: msg })
      })

      if (['yt', 'ytv'].includes(commandName)) {
        const caption = [
          '✅ Video descargado correctamente.',
          `🎬 Título: ${json.title || 'N/A'}`,
          `⏱ Duración: ${json.duration ? `${json.duration} seg` : 'N/A'}`,
          `👍 Likes: ${json.likes || 'N/A'}`,
          `💬 Comentarios: ${json.comments || 'N/A'}`,
          `👁 Views: ${json.views || 'N/A'}`,
          `📺 Calidad: ${json.quality || 'N/A'}`,
          `📡 Procesado por: ${server.name}`
        ].join('\n')

        return sock.sendMessage(remoteJid, {
          video: { url: json.file_url },
          caption
        }, { quoted: msg })
      }

      await sock.sendMessage(remoteJid, {
        audio: { url: json.file_url },
        mimetype: 'audio/mp4',
        ptt: false
      }, { quoted: msg })

      await sock.sendMessage(remoteJid, {
        text: `✅ Audio descargado correctamente desde ${server.name}.`
      }, { quoted: msg })
    } catch (error) {
      console.error(error)
      await sock.sendMessage(remoteJid, {
        text: error.message || '❌ Ocurrió un error procesando tu solicitud.'
      }, { quoted: msg })
    }
  }
}
