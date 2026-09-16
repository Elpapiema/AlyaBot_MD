import { ensureGroupSettings, saveSettings } from '../../lib/settings.js'

export default {
  name: 'setwelcome',
  command: ['setwelcome'],
  groupOnly: true,
  adminOnly: true,
  tags: ['group'],

  async run({ sock, msg, text, remoteJid, usedPrefix, commandName }) {
    if (!text) {
      throw `🌸 Bienvenida personalizada

Escribe tu mensaje como quieras.
Puedes usar estas palabras si quieres datos automáticos:

- @user → menciona al usuario
- @group → nombre del grupo
- @desc → descripción del grupo

Ejemplo:
${usedPrefix}${commandName} Hola @user 👋 bienvenido a @group ✨`
    }

    const settings = await ensureGroupSettings(remoteJid)
    settings.groups[remoteJid].msgWelcome = text
    await saveSettings(settings)

    await sock.sendMessage(
      remoteJid,
      {
        text: `✨ *Mensaje de bienvenida actualizado*\n\n📌 Ahora usaré este mensaje cuando alguien entre al grupo:\n\n${text}`
      },
      { quoted: msg }
    )
  }
}
