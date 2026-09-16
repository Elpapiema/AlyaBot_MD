export default {
  name: 'group-settings',
  command: ['grupo', 'gp'],
  tags: ['group'],
  groupOnly: true,
  adminOnly: true,

  async run({ sock, msg, text, commandName, remoteJid }) {
    if (!text) {
      return sock.sendMessage(remoteJid, {
        text: `✨ Uso:\n\n.${commandName} abrir\n.${commandName} cerrar\n\nAlias: o / c`
      }, { quoted: msg })
    }

    const option = text.toLowerCase()

    if (option === 'abrir' || option === 'o') {
      await sock.groupSettingUpdate(remoteJid, 'not_announcement')
      return sock.sendMessage(remoteJid, {
        text: '✅ El grupo ha sido *abierto*, ahora todos pueden enviar mensajes.'
      }, { quoted: msg })
    }

    if (option === 'cerrar' || option === 'c') {
      await sock.groupSettingUpdate(remoteJid, 'announcement')
      return sock.sendMessage(remoteJid, {
        text: '🔒 El grupo ha sido *cerrado*, solo los administradores pueden enviar mensajes.'
      }, { quoted: msg })
    }

    await sock.sendMessage(remoteJid, {
      text: `⚠️ Parámetro no válido.\n\nUsa:\n.${commandName} abrir / o\n.${commandName} cerrar / c`
    }, { quoted: msg })
  }
}
