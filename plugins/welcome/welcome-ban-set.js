import { ensureGroupSettings, saveSettings } from '../../lib/settings.js'

export default {
  name: 'setban',
  command: ['setban'],
  groupOnly: true,
  adminOnly: true,
  tags: ['group'],

  async run({ sock, msg, text, remoteJid, usedPrefix, commandName }) {
    if (!text) {
      throw `🚫 Mensaje de expulsión personalizado

Escribe el mensaje que quieras cuando alguien sea expulsado del grupo.
Puedes usar estas palabras si quieres datos automáticos:

@user → usuario expulsado
@group → nombre del grupo

Ejemplo:
${usedPrefix}${commandName} @user fue expulsado de @group 🚫`
    }

    const settings = await ensureGroupSettings(remoteJid)
    settings.groups[remoteJid].msgBan = text
    await saveSettings(settings)

    await sock.sendMessage(
      remoteJid,
      {
        text: `✨ *Mensaje de ban actualizado*\n\n📌 Ahora usaré este mensaje cuando alguien sea expulsado del grupo:\n\n${text}`
      },
      { quoted: msg }
    )
  }
}
