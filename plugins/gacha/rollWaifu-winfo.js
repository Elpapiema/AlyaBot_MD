import fetch from 'node-fetch'

export default {
  name: 'winfo',
  command: ['winfo'],
  groupOnly: false,
  adminOnly: false,
  ownerOnly: false,

  async run({ sock, msg, remoteJid, args, command }) {

    if (!args[0]) {
      return sock.sendMessage(remoteJid, {
        text: `🔎 Usa el comando así:\n.${command} <nombre del personaje>`
      }, { quoted: msg })
    }

    const personajeBuscado = args.join(' ').toLowerCase()
    const url = 'https://raw.githubusercontent.com/Elpapiema/CharHub-Store/main/image_json/characters.json'

    try {

      const res = await fetch(url)
      if (!res.ok) throw new Error(`Error al obtener datos. Código: ${res.status}`)

      const data = await res.json()

      const personaje = data.find(p =>
        p.name.toLowerCase().includes(personajeBuscado)
      )

      if (!personaje) {
        return sock.sendMessage(remoteJid, {
          text: `❌ No se encontró ningún personaje que coincida con: *${args.join(' ')}*`
        }, { quoted: msg })
      }

      let info = `✨ *Información del Personaje*\n\n`
      info += `📛 *Nombre:* ${personaje.name}\n`

      if (personaje.age) info += `🎂 *Edad:* ${personaje.age}\n`
      if (personaje.source) info += `📺 *Origen:* ${personaje.source}\n`
      if (personaje.relationship) info += `💞 *Relación:* ${personaje.relationship}\n`

      await sock.sendMessage(
        remoteJid,
        {
          image: { url: personaje.img },
          caption: info
        },
        { quoted: msg }
      )

    } catch (e) {

      console.error(e)

      await sock.sendMessage(remoteJid, {
        text: `⚠️ Hubo un error al buscar el personaje. Intenta más tarde.`
      }, { quoted: msg })

    }
  }
}