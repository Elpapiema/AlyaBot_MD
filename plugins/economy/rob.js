import fetch from 'node-fetch'
import { getCurrencyName, loadUsersDb, saveUsersDb } from '../../lib/storage.js'

const eventsUrl = 'https://raw.githubusercontent.com/Elpapiema/CharHub-Store/refs/heads/main/Random/rob-events.json'

async function fetchEvents() {
  try {
    const response = await fetch(eventsUrl)
    if (!response.ok) throw new Error('No se pudo obtener el JSON.')
    return response.json()
  } catch (error) {
    console.error('Error al obtener eventos de robo:', error)
    return { successful: [], failed: [] }
  }
}

function getMentionedTarget(msg, args) {
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid
    || msg.message?.contextInfo?.mentionedJid
    || []
  if (mentioned[0]) return mentioned[0]

  const raw = String(args[0] || '').trim()
  const digits = raw.replace(/[^0-9]/g, '')
  return digits ? `${digits}@s.whatsapp.net` : null
}

export default {
  name: 'rob',
  command: ['rob', 'robar', 'crime'],
  tags: ['economy'],

  async run({ sock, msg, args, sender, remoteJid }) {
    const db = await loadUsersDb()
    const currency = await getCurrencyName()
    const targetId = getMentionedTarget(msg, args)

    db[sender] ||= { money: 0, bank: 0 }
    const userData = db[sender]

    if (targetId) {
      if (!db[targetId]) {
        return sock.sendMessage(remoteJid, {
          text: '❌ El usuario mencionado no está registrado en la base de datos.'
        }, { quoted: msg })
      }

      const targetData = db[targetId]
      if ((targetData.money || 0) <= 0) {
        return sock.sendMessage(remoteJid, {
          text: `❌ @${targetId.split('@')[0]} no tiene dinero en mano para robar.`,
          mentions: [targetId]
        }, { quoted: msg })
      }

      const success = Math.random() < 0.3
      let amount = Math.floor(Math.random() * 200) + 50

      if (success) {
        amount = Math.min(amount, targetData.money)
        targetData.money -= amount
        userData.money += amount
        await saveUsersDb(db)

        return sock.sendMessage(remoteJid, {
          text: `✅ ¡Lograste robar *${amount} ${currency}* a @${targetId.split('@')[0]}!`,
          mentions: [targetId]
        }, { quoted: msg })
      }

      const lostAmount = Math.floor(amount / 2)
      userData.money = Math.max(0, userData.money - lostAmount)
      await saveUsersDb(db)

      return sock.sendMessage(remoteJid, {
        text: `❌ Fallaste en el robo y perdiste *${lostAmount} ${currency}* en el intento.`
      }, { quoted: msg })
    }

    const events = await fetchEvents()
    const isSuccess = Math.random() < 0.5
    const eventList = isSuccess ? events.successful || [] : events.failed || []
    const event = eventList[Math.floor(Math.random() * eventList.length)]

    if (!event) {
      return sock.sendMessage(remoteJid, {
        text: '❌ No se pudieron obtener eventos de robo.'
      }, { quoted: msg })
    }

    let amount = Math.abs(Number(event.amount) || 0)

    if (isSuccess) {
      userData.money += amount
    } else {
      amount = Math.min(amount, userData.money)
      userData.money = Math.max(0, userData.money - amount)
    }

    await saveUsersDb(db)

    await sock.sendMessage(remoteJid, {
      text: String(event.message || '').replace('{amount}', `${amount} ${currency}`)
    }, { quoted: msg })
  }
}
