import fetch from 'node-fetch'
import { getCurrencyName, loadUsersDb, saveUsersDb } from '../../lib/storage.js'

async function getRandomJob() {
  const response = await fetch('https://raw.githubusercontent.com/Elpapiema/CharHub-Store/refs/heads/main/Random/slut.json')
  const data = await response.json()
  const jobs = Array.isArray(data.jobs) ? data.jobs : []
  if (!jobs.length) throw new Error('No hay trabajos disponibles.')
  return jobs[Math.floor(Math.random() * jobs.length)]
}

export default {
  name: 'slut',
  command: ['slut'],
  tags: ['economy'],

  async run({ sock, msg, sender, remoteJid }) {
    try {
      const job = await getRandomJob()
      const moneyEarned = Math.floor(Math.random() * (job.maxMoney - job.minMoney + 1)) + job.minMoney
      const currency = await getCurrencyName()
      const database = await loadUsersDb()

      if (!database[sender]) database[sender] = { money: 0, bank: 0 }
      database[sender].money += moneyEarned
      await saveUsersDb(database)

      await sock.sendMessage(remoteJid, {
        text: `❀ ${job.description} ${moneyEarned} ${currency}.`
      }, { quoted: msg })
    } catch (error) {
      console.error(error)
      await sock.sendMessage(remoteJid, {
        text: '❌ Hubo un error al procesar el comando.\n\nError de sintaxis en slut.json.'
      }, { quoted: msg })
    }
  }
}
