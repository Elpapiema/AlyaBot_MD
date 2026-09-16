export default {
  name: 'group-tag',
  command: ['tag', 'notificar', 'notify'],
  tags: ['group'],
  groupOnly: true,
  adminOnly: true,

  async run({ sock, msg, text, remoteJid, groupMetadata }) {
    const users = (groupMetadata?.participants || []).map((participant) => participant.id)
    const quoted = msg.message?.extendedTextMessage?.contextInfo
      ? msg
      : null
    const caption = text || 'Hola!!'

    await sock.sendMessage(remoteJid, {
      text: caption,
      mentions: users
    }, { quoted })
  }
}
