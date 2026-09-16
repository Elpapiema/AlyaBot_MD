import fetch from 'node-fetch'

export default {
  name: 'getrw',
  command: ['getrw'],
  tags: ['group'],

  async run({ sock, msg, remoteJid }) {
    try {
      const response = await fetch('https://eliasar-yt-api.vercel.app/api/rw')
      if (!response.ok) throw new Error('Error al obtener datos de la API')

      const { character } = await response.json()
      if (!character) throw new Error('No se encontraron datos del personaje')

      const { name, url } = character
      const searchResponse = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(name)}&format=json`)
      if (!searchResponse.ok) throw new Error('Error al buscar datos en internet')

      const searchResult = await searchResponse.json()
      const description = searchResult?.AbstractText || 'Información no disponible'

      const jsonOutput = {
        name,
        age: description.match(/(\d+ años|\d+ años de edad)/i)?.[0] || 'Desconocida',
        relationship: description.includes('soltera') ? 'Soltera' : description.includes('casada') ? 'Casada' : 'Desconocida',
        source: searchResult?.Heading || 'Desconocido',
        img: url
      }

      await sock.sendMessage(remoteJid, {
        text: JSON.stringify(jsonOutput, null, 2)
      }, { quoted: msg })
    } catch (error) {
      console.error(error)
      await sock.sendMessage(remoteJid, {
        text: 'Ocurrió un error al procesar tu solicitud.'
      }, { quoted: msg })
    }
  }
}
