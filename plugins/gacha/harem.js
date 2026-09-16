import { loadHarem } from '../../lib/storage.js'

function buildUserKeyVariants(value = '') {
  const raw = String(value || '').trim()
  if (!raw) return []

  const bare = raw.split('@')[0]
  const digits = raw.replace(/[^0-9]/g, '')
  return Array.from(new Set([raw, bare, digits].filter(Boolean)))
}

export default {
  name: 'harem',
  command: ['harem'],
  groupOnly: false,
  adminOnly: false,
  ownerOnly: false,

  async run({ sock, msg, remoteJid, sender }) {
    try {
      const harem = await loadHarem()
      const variants = buildUserKeyVariants(sender || msg.sender || msg.key?.participant || msg.key?.remoteJid)
      const userId = variants.find((key) => Array.isArray(harem[key])) || variants[0]
      const userHarem = userId ? harem[userId] : null

      if (!userHarem || userHarem.length === 0) {
        return sock.sendMessage(remoteJid, {
          text: 'No tienes personajes reclamados en tu harem.'
        }, { quoted: msg })
      }

      let message = '✨ *Personajes en tu Harem:*\n\n'

      userHarem.forEach((character, index) => {
        message += `${index + 1}. ${character.name}\n`
        message += `   💖 Situación Sentimental: ${character.relationship}\n`
        message += `   📚 Origen: ${character.source}\n\n`
      })

      await sock.sendMessage(
        remoteJid,
        {
          image: { url: 'https://files.catbox.moe/bnjw8e.jpg' },
          caption: message
        },
        { quoted: msg }
      )

    } catch (error) {

      await sock.sendMessage(remoteJid, {
        text: `❌ Error al cargar el harem: ${error.message}`
      }, { quoted: msg })

    }
  }
}
