import { getCurrencyName, loadEcoConfig, loadUsersDb, saveUsersDb } from '../../lib/storage.js'

const textoAEmoji = {
  piedra: '🪨',
  papel: '📄',
  tijera: '✂️'
}

const emojiATexto = {
  '🪨': 'piedra',
  '📄': 'papel',
  '✂️': 'tijera'
}

function esJugadaValida(texto = '') {
  return ['piedra', 'papel', 'tijera', '🪨', '📄', '✂️'].includes(String(texto).toLowerCase())
}

function normalizarJugada(texto = '') {
  const normalized = String(texto).toLowerCase()
  return emojiATexto[normalized] || normalized
}

function getMentionedTarget(msg) {
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid
    || msg.message?.contextInfo?.mentionedJid
    || []
  return mentioned[0] || null
}

export default {
  name: 'ppt',
  command: ['ppt'],
  tags: ['game'],
  groupOnly: true,

  async run({ sock, msg, sender, remoteJid }) {
    const mentioned = getMentionedTarget(msg)
    if (!mentioned) {
      return sock.sendMessage(remoteJid, {
        text: 'Menciona a un usuario para jugar piedra, papel o tijeras.'
      }, { quoted: msg })
    }

    const gameId = `${remoteJid}-${mentioned}`
    global.pptGames ||= {}

    if (global.pptGames[gameId]) {
      return sock.sendMessage(remoteJid, {
        text: 'Ya hay un juego en curso con este usuario.'
      }, { quoted: msg })
    }

    const ecoConfig = await loadEcoConfig()
    global.pptGames[gameId] = {
      player1: sender,
      player2: mentioned,
      group: remoteJid,
      status: 'waiting',
      choices: {},
      reward: ecoConfig.ppt.reward,
      penalty: ecoConfig.ppt.penalty,
      currency: await getCurrencyName()
    }

    const inviteText = 'Responde con `ppt piedra`, `ppt papel` o `ppt tijera`.\nTambién puedes usar 🪨 📄 ✂️'
    await sock.sendMessage(sender, { text: inviteText })
    await sock.sendMessage(mentioned, { text: `Te han retado a Piedra Papel o Tijera.\n\n${inviteText}` })

    setTimeout(() => {
      if (global.pptGames?.[gameId]?.status === 'waiting') {
        delete global.pptGames[gameId]
        sock.sendMessage(remoteJid, { text: '⏱️ Juego cancelado por inactividad.' }).catch(console.error)
      }
    }, 2 * 60 * 1000)
  },

  async all({ sock, msg, text, sender, remoteJid }) {
    if (!text?.toLowerCase().startsWith('ppt')) return
    if (!global.pptGames) return

    const input = text.slice(3).trim().toLowerCase()
    if (!esJugadaValida(input)) return

    const gameId = Object.keys(global.pptGames).find((id) => {
      const game = global.pptGames[id]
      return game.status === 'waiting' && (sender === game.player1 || sender === game.player2)
    })
    if (!gameId) return

    const game = global.pptGames[gameId]
    if (game.choices[sender]) {
      return sock.sendMessage(remoteJid, { text: 'Ya has enviado tu jugada.' }, { quoted: msg })
    }

    const jugada = normalizarJugada(input)
    game.choices[sender] = jugada

    await sock.sendMessage(remoteJid, {
      text: `✅ Jugada recibida como *${jugada.toUpperCase()}* ${textoAEmoji[jugada] || ''}`
    }, { quoted: msg })

    if (Object.keys(game.choices).length < 2) return

    game.status = 'done'
    const { player1, player2, reward, penalty, currency } = game
    const c1 = game.choices[player1]
    const c2 = game.choices[player2]
    const db = await loadUsersDb()

    db[player1] ||= { money: 0, bank: 0 }
    db[player2] ||= { money: 0, bank: 0 }

    let result
    if (c1 === c2) {
      result = '🤝 ¡Empate!'
    } else if (
      (c1 === 'piedra' && c2 === 'tijera')
      || (c1 === 'papel' && c2 === 'piedra')
      || (c1 === 'tijera' && c2 === 'papel')
    ) {
      db[player1].money += reward
      db[player2].money = Math.max(0, db[player2].money - penalty)
      result = `🎉 ¡@${player1.split('@')[0]} gana! +${reward} ${currency}\n@${player2.split('@')[0]} pierde -${penalty} ${currency}`
    } else {
      db[player2].money += reward
      db[player1].money = Math.max(0, db[player1].money - penalty)
      result = `🎉 ¡@${player2.split('@')[0]} gana! +${reward} ${currency}\n@${player1.split('@')[0]} pierde -${penalty} ${currency}`
    }

    await saveUsersDb(db)

    await sock.sendMessage(game.group, {
      text: `🎮 *Resultados del juego:*\n\n👤 @${player1.split('@')[0]}: ${textoAEmoji[c1]} (${c1})\n👤 @${player2.split('@')[0]}: ${textoAEmoji[c2]} (${c2})\n\n${result}`,
      mentions: [player1, player2]
    })

    delete global.pptGames[gameId]
  }
}
