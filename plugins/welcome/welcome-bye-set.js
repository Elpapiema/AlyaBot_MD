import { ensureGroupSettings, saveSettings } from '../../lib/settings.js'

export default {
  name: 'setbye',
  command: ['setbye'],
  groupOnly: true,
  adminOnly: true,
  tags: ['group'],

  async run({ sock, msg, text, remoteJid, usedPrefix, commandName }) {
    if (!text) {
      throw `👋 Despedida personalizada

Escribe tu mensaje como quieras cuando alguien salga del grupo.
Puedes usar estas palabras si quieres datos automáticos:

- @user → usuario que salió
- @group → nombre del grupo

Ejemplo:
${usedPrefix}${commandName} Adiós @user 👋 fue un gusto tenerte en: @group 😢`
    }

    const settings = await ensureGroupSettings(remoteJid)
    settings.groups[remoteJid].msgBye = text
    await saveSettings(settings)

    await sock.sendMessage(
      remoteJid,
      {
        text: `✨ *Mensaje de despedida actualizado*\n\n📌 Ahora usaré este mensaje cuando alguien salga del grupo:\n\n${text}`
      },
      { quoted: msg }
    )
  }
}
