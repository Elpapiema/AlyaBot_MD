export default {
  name: 'owner-join',
  command: ['join'],
  tags: ['owner'],

  async run({ sock, msg, args, isOwner, sender, remoteJid }) {
    const link = args[0]
    if (!link) {
      return sock.sendMessage(remoteJid, {
        text: '*Uso correcto: .join <enlace de invitación del grupo>*'
      }, { quoted: msg })
    }

    const groupInviteRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/
    const code = link.match(groupInviteRegex)?.[1]

    if (!code) {
      return sock.sendMessage(remoteJid, {
        text: '*Enlace inválido. Asegúrate de copiar el enlace completo del grupo.*'
      }, { quoted: msg })
    }

    if (isOwner) {
      await sock.groupAcceptInvite(code)
      return sock.sendMessage(remoteJid, {
        text: '*Me he unido al grupo exitosamente.*'
      }, { quoted: msg })
    }

    const ownerList = Array.isArray(global.owner) ? global.owner : [global.owner]
    const requestText = `*Solicitud de unión a grupo*\n\n*Usuario:* wa.me/${sender.split('@')[0]}\n*Enlace:* ${link}`

    for (const owner of ownerList.flat()) {
      const jid = typeof owner === 'string' ? owner : owner?.[0]
      if (!jid) continue
      const normalized = jid.includes('@') ? jid : `${jid}@s.whatsapp.net`
      await sock.sendMessage(normalized, { text: requestText }, { quoted: msg })
    }

    await sock.sendMessage(remoteJid, {
      text: '*Tu solicitud ha sido enviada a los administradores. Espera su aprobación.*'
    }, { quoted: msg })
  }
}
