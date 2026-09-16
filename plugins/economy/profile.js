import { getCurrencyName, loadHarem, loadUsersDb } from '../../lib/storage.js'

const FALLBACK_AVATAR = 'https://files.catbox.moe/vpqhom.webp'

export default {
  name: 'profile',
  command: ['profile', 'perfil', 'bal', 'balance'],
  tags: ['economy'],

  async run({ sock, msg, sender, remoteJid }) {
    const db = await loadUsersDb()
    const harem = await loadHarem()
    const currency = await getCurrencyName()
    const userData = db[sender] || { money: 0, bank: 0 }
    const haremCount = Array.isArray(harem[sender]) ? harem[sender].length : 0

    let profilePicUrl = FALLBACK_AVATAR
    try {
      profilePicUrl = await sock.profilePictureUrl(sender, 'image')
    } catch {}

    const message = [
      '🌟 *Perfil de Usuario* 🌟',
      '',
      `👤 *Usuario:* @${sender.split('@')[0]}`,
      `💰 *Dinero en mano:* ${userData.money || 0} ${currency}`,
      `🏦 *Banco:* ${userData.bank || 0} ${currency}`,
      `💞 *Personajes en harem:* ${haremCount}`
    ].join('\n')

    await sock.sendMessage(remoteJid, {
      image: { url: profilePicUrl },
      caption: message,
      mentions: [sender]
    }, { quoted: msg })
  }
}
