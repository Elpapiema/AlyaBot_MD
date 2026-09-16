import fetch from 'node-fetch'
import { getCurrencyName } from '../../lib/storage.js'

const charactersUrl = 'https://raw.githubusercontent.com/Elpapiema/CharHub-Store/refs/heads/main/image_json/characters.json'

async function loadCharacters() {
  const res = await fetch(charactersUrl)
  if (!res.ok) throw new Error('No se pudo cargar characters.json')
  return res.json()
}

export default {
  name: 'rollwaifu',
  command: ['rw', 'rollwaifu'],
  groupOnly: false,
  adminOnly: false,
  ownerOnly: false,

  async run({ sock, msg, remoteJid }) {
    try {
      const currency = await getCurrencyName()

      const characters = await loadCharacters()
      const randomCharacter = characters[Math.floor(Math.random() * characters.length)]

      const message = `
✨ *Nombre*: ${randomCharacter.name}
🎂 *Edad*: ${randomCharacter.age} años
💖 *Estado Sentimental*: ${randomCharacter.relationship}
📚 *Origen*: ${randomCharacter.source}
💵 *Costo*: ${randomCharacter.buy} ${currency}
`.trim()

      const sentMsg = await sock.sendMessage(
        remoteJid,
        {
          image: { url: randomCharacter.img },
          caption: message
        },
        { quoted: msg }
      )

      if (!global.lastCharacter) global.lastCharacter = {}

      global.lastCharacter[sentMsg.key.id] = {
        ...randomCharacter,
        time: Date.now()
      }

    } catch (e) {

      await sock.sendMessage(remoteJid, {
        text: `❌ Error: ${e.message}`
      }, { quoted: msg })

    }
  }
}

/*import { promises as fs } from 'fs'
import fetch from 'node-fetch'

const charactersUrl = 'https://raw.githubusercontent.com/Elpapiema/CharHub-Store/refs/heads/main/image_json/characters.json'
const filePath = './database/personalize.json'

// Cargar personajes desde GitHub
async function loadCharacters() {
  try {
    const res = await fetch(charactersUrl)
    return await res.json()
  } catch {
    throw new Error('No se pudo cargar el archivo characters.json desde GitHub.')
  }
}

export default {
  name: 'rollwaifu',
  command: ['rw', 'rollwaifu'],
  groupOnly: false,
  adminOnly: false,
  ownerOnly: false,

  async run({ sock, msg, remoteJid }) {
    try {

      // cargar configuración
      const data = JSON.parse(await fs.readFile(filePath))
      const globalConfig = data.global || {}
      const defaultConfig = data.default || {}

      const currency = globalConfig.currency || defaultConfig.currency || '$'

      // cargar personajes
      const characters = await loadCharacters()
      const randomCharacter = characters[Math.floor(Math.random() * characters.length)]

      const message = `
✨ *Nombre*: ${randomCharacter.name}
🎂 *Edad*: ${randomCharacter.age} años
💖 *Estado Sentimental*: ${randomCharacter.relationship}
📚 *Origen*: ${randomCharacter.source}
💵 *Costo*: ${randomCharacter.buy} ${currency}
`.trim()

      // enviar imagen
      const sentMsg = await sock.sendMessage(
        remoteJid,
        {
          image: { url: randomCharacter.img },
          caption: message
        },
        { quoted: msg }
      )

      // guardar último personaje generado
      if (!global.lastCharacter) global.lastCharacter = {}
      global.lastCharacter[sentMsg.key.id] = randomCharacter

    } catch (error) {

      await sock.sendMessage(remoteJid, {
        text: `❌ Error al cargar el personaje: ${error.message}`
      }, { quoted: msg })

    }
  }
}*/
