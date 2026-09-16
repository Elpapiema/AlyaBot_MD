import fetch from 'node-fetch'
import { getCurrencyName, loadUsersDb, saveUsersDb } from '../../lib/storage.js'

// Obtener trabajo aleatorio
const getRandomJob = async () => {
  const url = 'https://raw.githubusercontent.com/Elpapiema/CharHub-Store/refs/heads/main/Random/job.json'
  const response = await fetch(url)
  const data = await response.json()
  const jobs = data.jobs
  return jobs[Math.floor(Math.random() * jobs.length)]
}

const saveEarnings = async (userId, moneyEarned) => {
  const database = await loadUsersDb()
  if (!database[userId]) database[userId] = { money: 0, bank: 0 }
  database[userId].money += moneyEarned
  await saveUsersDb(database)
}

export default {
  name: 'work',
  command: ['w', 'work'],
  groupOnly: false,
  adminOnly: false,
  ownerOnly: false,

  async run({ sock, msg, remoteJid, sender }) {
    try {

      // Sistema de cooldown
      global.workCooldown = global.workCooldown || {}

      const cooldown = 5000 // 5 segundos
      const userId = sender || msg.key?.participant || msg.key?.remoteJid
      if (!userId) {
        return sock.sendMessage(remoteJid, {
          text: '❌ No pude identificar tu usuario. Intenta de nuevo.'
        }, { quoted: msg })
      }

      const last = global.workCooldown[userId] || 0

      if (Date.now() - last < cooldown) {

        const remaining = Math.ceil((cooldown - (Date.now() - last)) / 1000)

        return sock.sendMessage(remoteJid, {
          text: `⏳ Espera ${remaining}s para volver a trabajar.`
        }, { quoted: msg })

      }

      global.workCooldown[userId] = Date.now()
      const job = await getRandomJob()

      const moneyEarned =
        Math.floor(Math.random() * (job.maxMoney - job.minMoney + 1)) +
        job.minMoney

      const currency = await getCurrencyName()

      await saveEarnings(userId, moneyEarned)

      const message = `❀ ${job.description} y ganaste ${moneyEarned} ${currency}.`

      await sock.sendMessage(remoteJid, {
        text: message
      }, { quoted: msg })

    } catch (error) {

      console.error(error)

      await sock.sendMessage(remoteJid, {
        text: '❌ Hubo un error al procesar tu trabajo.'
      }, { quoted: msg })

    }
  }
}
