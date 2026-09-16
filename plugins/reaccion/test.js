import axios from 'axios'

const actionCatalog = {
  abrazar: {
    file: 'abrazar.json',
    emoji: '🤗',
    text: 'esta dando un fuerte abrazo a',
    text2: 'se esta abrazando con ... Mejor omitamos eso'
  },
  besar: {
    file: 'kiss.json',
    emoji: '💋',
    text: 'le esta dando un beso a',
    text2: 'se esta besando con ... Mejor omitamos eso'
  },
  golpear: {
    file: 'punch.json',
    emoji: '💥',
    text: 'esta golpeando a',
    text2: 'se esta golpeando con ... Mejor omitamos eso'
  },
  bofetada: {
    file: 'slap.json',
    emoji: '🖐️',
    text: 'le dio una bofetada a',
    text2: 'se dio una bofetada a si mismo... eso fue raro'
  },
  morder: {
    file: 'morder.json',
    emoji: '🦷',
    text: 'mordio a',
    text2: 'anda con ganas de morder a alguien... Mejor no'
  },
  comer: {
    file: 'comer.json',
    emoji: '😋',
    text: 'esta comiendo con',
    text2: 'se puso a comer solo... provechito'
  },
  nalguear: {
    file: 'nalguear.json',
    emoji: '🍑',
    text: 'nalgueo a',
    text2: 'intento nalguearse a si mismo... omitamos eso'
  },
  enamorar: {
    file: 'love.json',
    emoji: '❤️',
    text: 'esta enamorado de',
    text2: 'anda enamorado del aire... que tierno'
  },
  matar: {
    file: 'matar.json',
    emoji: '🔪',
    text: 'mato a',
    text2: 'se intento matar a si mismo... mejor no'
  },
  saludar: {
    file: 'saludar.json',
    emoji: '👋',
    text: 'esta saludando a',
    text2: 'esta saludando a todos como si nada'
  },
  dormir: {
    file: 'sleep.json',
    emoji: '😴',
    text: 'esta durmiendo junto a',
    text2: 'se quedo dormido solito'
  },
  aburrido: {
    file: 'aburrido.json',
    emoji: '😒',
    text: 'esta aburrido de',
    text2: 'esta aburrido de la vida... alguien abracelo'
  },
  bailar: {
    file: 'dance.json',
    emoji: '🕺',
    text: 'esta bailando con',
    text2: 'se puso a bailar solo'
  },
  feliz: {
    file: 'feliz.json',
    emoji: '😄',
    text: 'esta feliz de ver a',
    text2: 'anda muy feliz hoy'
  },
  enojado: {
    file: 'enojado.json',
    emoji: '😡',
    text: 'esta enojado con',
    text2: 'anda enojado consigo mismo'
  },
  bleh: {
    file: 'bleh.json',
    emoji: '😛',
    text: 'le saco la lengua a',
    text2: 'le saco la lengua al aire'
  },
  banar: {
    file: 'bañarse.json',
    emoji: '🛀',
    text: 'esta bañando a',
    text2: 'se fue a bañar solito'
  }
}

const aliases = {
  abrazar: 'abrazar',
  besar: 'besar',
  kiss: 'besar',
  beso: 'besar',
  golpear: 'golpear',
  punch: 'golpear',
  pegar: 'golpear',
  slap: 'bofetada',
  bofetada: 'bofetada',
  bite: 'morder',
  morder: 'morder',
  eat: 'comer',
  comer: 'comer',
  nalguear: 'nalguear',
  love: 'enamorar',
  matar: 'matar',
  kill: 'matar',
  saludar: 'saludar',
  hola: 'saludar',
  sleep: 'dormir',
  dormir: 'dormir',
  bored: 'aburrido',
  aburrido: 'aburrido',
  dance: 'bailar',
  bailar: 'bailar',
  feliz: 'feliz',
  happy: 'feliz',
  enojado: 'enojado',
  angry: 'enojado',
  bleh: 'bleh',
  bathe: 'banar',
  bañar: 'banar',
  banar: 'banar'
}

function toMentionTag(jid = '') {
  const base = String(jid || '').split('@')[0] || 'alguien'
  return `@${base}`
}

function getTargetUser(msg) {
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid
    || msg.message?.contextInfo?.mentionedJid
    || []
  const quotedSender = msg.message?.extendedTextMessage?.contextInfo?.participant
    || msg.message?.contextInfo?.participant
    || null

  if (mentioned[0]) return mentioned[0]
  if (quotedSender) return quotedSender
  return null
}

export default {
  name: 'actions',
  command: Object.keys(aliases),
  tags: ['fun'],
  groupOnly: true,

  async run({ sock, msg, remoteJid, sender, commandName }) {
    const actionKey = aliases[commandName]
    const action = actionCatalog[actionKey]
    if (!action) return

    const who = getTargetUser(msg)
    const senderTag = toMentionTag(sender)
    const whoTag = who ? toMentionTag(who) : null

    const caption = whoTag
      ? `\`${senderTag}\` ${action.text} \`${whoTag}\``
      : `\`${senderTag}\` ${action.text2}`

    try {
      await sock.sendMessage(remoteJid, {
        react: {
          text: action.emoji,
          key: msg.key
        }
      })

      const url = `https://raw.githubusercontent.com/Elpapiema/CharHub-Store/refs/heads/main/video_json/SFW/${action.file}`
      const res = await axios.get(url)
      const videos = Array.isArray(res.data?.videos) ? res.data.videos : []

      if (!videos.length) {
        throw new Error('No se encontraron videos para esta accion.')
      }

      const video = videos[Math.floor(Math.random() * videos.length)]

      await sock.sendMessage(remoteJid, {
        video: { url: video },
        gifPlayback: true,
        caption,
        mentions: who ? [sender, who] : [sender]
      }, { quoted: msg })
    } catch (error) {
      console.error(error)
      await sock.sendMessage(remoteJid, {
        text: '❌ Error al obtener el video.'
      }, { quoted: msg })
    }
  }
}
