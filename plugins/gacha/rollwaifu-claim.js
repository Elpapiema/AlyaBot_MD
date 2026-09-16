import { getCurrencyName, loadHarem, loadUsersDb, saveHarem, saveUsersDb } from '../../lib/storage.js'

export default {
  name: 'claim',
  command: ['claim', 'c', 'reclamar'],
  groupOnly: false,
  adminOnly: false,
  ownerOnly: false,

  async run({ sock, msg, remoteJid, sender }) {
    try {
      const contextInfo =
        msg.message?.extendedTextMessage?.contextInfo
        || msg.message?.imageMessage?.contextInfo
        || msg.message?.videoMessage?.contextInfo
        || msg.message?.documentMessage?.contextInfo
        || msg.message?.buttonsResponseMessage?.contextInfo
        || msg.message?.listResponseMessage?.contextInfo
        || null

      const quotedId = contextInfo?.stanzaId

      const character = global.lastCharacter?.[quotedId]

      if (!quotedId) {
        return sock.sendMessage(remoteJid, {
          text: 'Debes responder al mensaje del personaje.'
        }, { quoted: msg })
      }

      if (!character) {
        return sock.sendMessage(remoteJid, {
          text: 'Ese mensaje no contiene un personaje válido.'
        }, { quoted: msg })
      }

      const expireTime = 2 * 60 * 1000

      if (Date.now() - character.time > expireTime) {

        delete global.lastCharacter[quotedId]

        return sock.sendMessage(remoteJid, {
          text: '⏳ Este personaje expiró. Usa .rw para generar uno nuevo.'
        }, { quoted: msg })
      }

      const currency = await getCurrencyName()
      const harem = await loadHarem()
      const usersDb = await loadUsersDb()

      if (!usersDb[sender]) {
        usersDb[sender] = { money: 0, bank: 0 }
      }

      const userMoney = usersDb[sender].money || 0
      const userBank = usersDb[sender].bank || 0
      const cost = parseInt(character.buy) || 0

      if (userMoney + userBank < cost) {

        return sock.sendMessage(remoteJid, {
          text: `❌ No tienes suficiente dinero para reclamar a ${character.name}.\n\nNecesitas ${cost} ${currency}.`
        }, { quoted: msg })

      }

      if (userMoney >= cost) {
        usersDb[sender].money -= cost
      } else {
        const remaining = cost - userMoney
        usersDb[sender].money = 0
        usersDb[sender].bank -= remaining
      }

      if (!harem[sender]) harem[sender] = []

      if (harem[sender].some(c => c.name === character.name)) {

        return sock.sendMessage(remoteJid, {
          text: `❗ Ya tienes a ${character.name} en tu harem.`
        }, { quoted: msg })

      }

      harem[sender].push(character)

      await saveHarem(harem)
      await saveUsersDb(usersDb)

      delete global.lastCharacter[quotedId]

      await sock.sendMessage(remoteJid, {
        text: `✅ Has reclamado a ${character.name}.\n\n💸 Se descontaron ${cost} ${currency}.`
      }, { quoted: msg })

    } catch (error) {

      await sock.sendMessage(remoteJid, {
        text: `❌ Error: ${error.message}`
      }, { quoted: msg })

    }
  }
}

/*import { promises as fs } from 'fs'

const haremFilePath = './database/harem.json'
const usersDbPath = './database/db_users.json'
const perzonaliPath = './database/personalize.json'

async function loadJSON(path, defaultValue = {}) {
  try {
    const data = await fs.readFile(path, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(path, JSON.stringify(defaultValue, null, 2))
      return defaultValue
    } else {
      throw new Error(`Error al cargar el archivo ${path}`)
    }
  }
}

async function saveJSON(path, data) {
  try {
    await fs.writeFile(path, JSON.stringify(data, null, 2), 'utf-8')
  } catch {
    throw new Error(`Error al guardar el archivo ${path}`)
  }
}

export default {
  name: 'claim',
  command: ['claim', 'c', 'reclamar'],
  groupOnly: false,
  adminOnly: false,
  ownerOnly: false,

  async run({ sock, msg, remoteJid }) {
    try {

      const dataP = JSON.parse(await fs.readFile(perzonaliPath))
      const globalConfig = dataP.global || {}
      const defaultConfig = dataP.default || {}

      const currency = globalConfig.currency || defaultConfig.currency || '$'

      let character

      if (msg.quoted) {

        const quoted = msg.quoted
        const quotedSender = quoted.sender || quoted.participant || ''
        const botJid = sock.user.id

        const isFromBot =
          quotedSender === botJid ||
          quotedSender === botJid.replace(/:[0-9]+/, '') ||
          quotedSender.endsWith('@lid') ||
          quoted.id?.startsWith('BAE5') ||
          quoted.id?.startsWith('3EB0')

        if (!isFromBot) {
          return sock.sendMessage(remoteJid, {
            text: 'El mensaje al que estás respondiendo no contiene un personaje válido para reclamar.'
          }, { quoted: msg })
        }

        character = global.lastCharacter?.[quoted.id]

        if (!character) {
          return sock.sendMessage(remoteJid, {
            text: 'No se pudo encontrar el personaje correspondiente. Asegúrate de responder al mensaje correcto.'
          }, { quoted: msg })
        }

      } else {

        return sock.sendMessage(remoteJid, {
          text: 'Ups, debes responder a un mensaje con un personaje para reclamarlo.'
        }, { quoted: msg })

      }

      const harem = await loadJSON(haremFilePath)
      const usersDb = await loadJSON(usersDbPath)

      if (!usersDb[msg.sender]) {
        usersDb[msg.sender] = { money: 0, bank: 0 }
      }

      const userMoney = usersDb[msg.sender].money || 0
      const userBank = usersDb[msg.sender].bank || 0
      const cost = parseInt(character.buy) || 0

      if (userMoney + userBank < cost) {

        return sock.sendMessage(remoteJid, {
          text: `❌ No tienes suficiente dinero para reclamar a ${character.name}.\n\nNecesitas ${cost} ${currency} en total.\n\nUsa #work para ganar dinero.`
        }, { quoted: msg })

      }

      if (userMoney >= cost) {
        usersDb[msg.sender].money -= cost
      } else {
        const remaining = cost - userMoney
        usersDb[msg.sender].money = 0
        usersDb[msg.sender].bank -= remaining
      }

      if (!harem[msg.sender]) harem[msg.sender] = []

      if (harem[msg.sender].some(c => c.name === character.name)) {

        return sock.sendMessage(remoteJid, {
          text: `❗ Ya has reclamado a ${character.name}.`
        }, { quoted: msg })

      }

      harem[msg.sender].push(character)

      await saveJSON(haremFilePath, harem)
      await saveJSON(usersDbPath, usersDb)

      await sock.sendMessage(remoteJid, {
        text: `✅ Has reclamado a ${character.name} con éxito.\n\nSe descontaron ${cost} ${currency}.\n\nSaldo actual:\n💰 Dinero en mano: ${usersDb[msg.sender].money} ${currency}\n🏦 Dinero en el Banco: ${usersDb[msg.sender].bank} ${currency}`
      }, { quoted: msg })

    } catch (error) {

      await sock.sendMessage(remoteJid, {
        text: `❌ Error al reclamar el personaje: ${error.message}`
      }, { quoted: msg })

    }
  }
}*/
