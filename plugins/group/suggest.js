const SUGGESTION_GROUP_ID = '120363395553029777@g.us'

export default {
  name: 'suggest',
  command: ['sug'],
  tags: ['info'],

  async run({ sock, msg, text, sender, remoteJid }) {
    if (!text) {
      return sock.sendMessage(remoteJid, {
        text: 'Por favor, escribe una sugerencia. Ejemplo: .sug Agrega más comandos divertidos.'
      }, { quoted: msg })
    }

    const suggestion = `*Nueva sugerencia recibida:*\n\n"${text}"\n\n*Enviada por:* @${sender.split('@')[0]}`

    await sock.sendMessage(SUGGESTION_GROUP_ID, {
      text: suggestion,
      mentions: [sender]
    })

    await sock.sendMessage(remoteJid, {
      text: '¡Gracias por tu sugerencia! Fue enviada correctamente al equipo del Staff.'
    }, { quoted: msg })
  }
}
