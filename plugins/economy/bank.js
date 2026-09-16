import { getCurrencyName, loadUsersDb, saveUsersDb } from '../../lib/storage.js'

function getTargetUser(msg, args) {
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid
    || msg.message?.contextInfo?.mentionedJid
    || []
  const quotedSender = msg.message?.extendedTextMessage?.contextInfo?.participant
    || msg.message?.contextInfo?.participant
    || null

  if (mentioned[0]) return mentioned[0]
  if (quotedSender) return quotedSender

  const raw = String(args[1] || '').trim()
  if (!raw) return null
  const digits = raw.replace(/[^0-9]/g, '')
  return digits ? `${digits}@s.whatsapp.net` : null
}

export default {
  name: 'banking',
  command: ['deposit', 'depositar', 'd', 'retirar', 'transferir'],
  tags: ['economy'],

  async run({ sock, msg, text, args, commandName, sender, remoteJid }) {
    const db = await loadUsersDb()
    const currency = await getCurrencyName()

    if (!db[sender]) db[sender] = { money: 0, bank: 0 }

    if (['deposit', 'depositar', 'd'].includes(commandName)) {
      if (!text) {
        return sock.sendMessage(remoteJid, {
          text: '❌ Uso incorrecto. Usa:\n.deposit <cantidad>\n.deposit all'
        }, { quoted: msg })
      }

      const userMoney = db[sender].money || 0
      const amount = text.toLowerCase() === 'all' ? userMoney : parseInt(text, 10)

      if (!Number.isInteger(amount) || amount <= 0) {
        return sock.sendMessage(remoteJid, { text: '❌ Ingresa una cantidad válida.' }, { quoted: msg })
      }

      if (amount > userMoney) {
        return sock.sendMessage(remoteJid, {
          text: `❌ No tienes suficiente ${currency} para depositar esa cantidad.`
        }, { quoted: msg })
      }

      db[sender].money = userMoney - amount
      db[sender].bank = (db[sender].bank || 0) + amount
      await saveUsersDb(db)

      return sock.sendMessage(remoteJid, {
        text: `✅ Has depositado ${amount} ${currency} en el banco.\n\n💰 ${currency} restante: ${db[sender].money}\n🏦 Saldo en el banco: ${db[sender].bank}`
      }, { quoted: msg })
    }

    if (commandName === 'retirar') {
      if (!text) {
        return sock.sendMessage(remoteJid, {
          text: '❌ Uso incorrecto. Usa:\n.retirar <cantidad>\n.retirar all'
        }, { quoted: msg })
      }

      const userBank = db[sender].bank || 0
      const amount = text.toLowerCase() === 'all' ? userBank : parseInt(text, 10)

      if (!Number.isInteger(amount) || amount <= 0) {
        return sock.sendMessage(remoteJid, { text: '❌ Ingresa una cantidad válida.' }, { quoted: msg })
      }

      if (amount > userBank) {
        return sock.sendMessage(remoteJid, {
          text: '❌ No tienes suficiente saldo en el banco para retirar esa cantidad.'
        }, { quoted: msg })
      }

      db[sender].bank = userBank - amount
      db[sender].money = (db[sender].money || 0) + amount
      await saveUsersDb(db)

      return sock.sendMessage(remoteJid, {
        text: `✅ Has retirado ${amount} ${currency} de tu banco.\n\n💰 ${currency} disponible: ${db[sender].money}\n🏦 Saldo restante en el banco: ${db[sender].bank}`
      }, { quoted: msg })
    }

    const amount = parseInt(args[0], 10)
    const target = getTargetUser(msg, args)

    if (!Number.isInteger(amount) || amount <= 0) {
      return sock.sendMessage(remoteJid, {
        text: '❌ Por favor, ingresa una cantidad válida para transferir.'
      }, { quoted: msg })
    }

    if (!target) {
      return sock.sendMessage(remoteJid, {
        text: '❌ Debes mencionar, responder o escribir el número del usuario al que deseas transferir.'
      }, { quoted: msg })
    }

    if (target === sender) {
      return sock.sendMessage(remoteJid, { text: '❌ No puedes transferirte a ti mismo.' }, { quoted: msg })
    }

    if ((db[sender].bank || 0) < amount) {
      return sock.sendMessage(remoteJid, {
        text: '❌ No tienes suficiente dinero en tu banco para realizar esta transferencia.'
      }, { quoted: msg })
    }

    if (!db[target]) db[target] = { money: 0, bank: 0 }

    db[sender].bank -= amount
    db[target].bank = (db[target].bank || 0) + amount
    await saveUsersDb(db)

    await sock.sendMessage(remoteJid, {
      text: `✅ Has transferido *${amount} ${currency}* a @${target.split('@')[0]} dentro de su banco.`,
      mentions: [target]
    }, { quoted: msg })
  }
}
