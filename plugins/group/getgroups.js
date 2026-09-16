export default {
  name: 'getgroups',
  command: ['getgroups', 'grupos'],
  tags: ['group'],

  async run({ sock, msg, remoteJid }) {
    const chats = await sock.groupFetchAllParticipating()
    const groupIds = Object.keys(chats || {})

    const message = groupIds.length
      ? `Grupos donde está el bot:\n\n${groupIds.map((id) => `- ${(chats[id]?.subject || 'Sin nombre')}: ${id}`).join('\n')}`
      : 'No encontré grupos registrados.'

    await sock.sendMessage(remoteJid, { text: message }, { quoted: msg })
  }
}
