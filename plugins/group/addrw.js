const STAFF_GROUP_ID = '120363395553029777@g.us'

export default {
  name: 'addrw',
  command: ['addcharacter', 'addrw'],
  tags: ['group'],

  async run({ sock, msg, text, usedPrefix, commandName, remoteJid }) {
    const args = text.split(',').map((part) => part.trim()).filter(Boolean)

    if (args.length < 5) {
      return sock.sendMessage(remoteJid, {
        text: `Uso incorrecto del comando.\nFormato: ${usedPrefix}${commandName} <Nombre>, <Edad>, <Situación sentimental>, <Origen>, <Enlace de imagen>\n\n> Nota: el link debe estar en catbox.moe o qu.ax.`
      }, { quoted: msg })
    }

    const [name, age, relationship, source, img] = args
    if (!/^https?:\/\//i.test(img)) {
      return sock.sendMessage(remoteJid, { text: 'Por favor, proporciona un enlace válido para la imagen.' }, { quoted: msg })
    }

    const characterData = {
      name,
      age: parseInt(age, 10),
      relationship,
      source,
      img
    }

    await sock.sendMessage(STAFF_GROUP_ID, {
      text: `Nuevo personaje añadido:\n\`\`\`${JSON.stringify(characterData, null, 2)}\`\`\``
    })

    await sock.sendMessage(remoteJid, {
      text: `El personaje "${name}" ha sido enviado al grupo del staff para su posterior adición.`
    }, { quoted: msg })
  }
}
