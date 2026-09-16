import { isActiveSubBot, startSubConnection } from '../../lib/subs.js'

export default {
  name: 'sub-bots',
  command: /^(qr|serbot|rentbot|code)$/i,
  help: ['serbot', 'jadibot', 'code'],
  tags: ['jadibot'],
  async run({ sock, msg, commandName, sender, remoteJid }) {
    if (!sender || msg.key.fromMe) return

    const senderNumber = sender.replace(/[^0-9]/g, '')
    if (isActiveSubBot(senderNumber)) {
      await sock.sendMessage(remoteJid, { text: '⚠️ Ya tienes un sub-bot activo.' }, { quoted: msg })
      return
    }

    const mode = commandName === 'code' ? 'code' : 'qr'

    await startSubConnection({
      mainSock: sock,
      senderJid: sender,
      remoteJid,
      quoted: msg,
      mode,
      notify: true
    })
  }
}
