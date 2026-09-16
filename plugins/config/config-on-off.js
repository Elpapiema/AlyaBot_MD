import { ensureGroupSettings, saveSettings } from '../../lib/settings.js'

export default {
  name: 'config-on-off',
  command: ['on', 'off'],
  groupOnly: true,
  adminOnly: true,

  async run({ sock, msg, args, commandName, remoteJid }) {
    const option = (args[0] || '').toLowerCase()

    if (!['welcome', 'nsfw', 'modoadmin'].includes(option)) {
      await sock.sendMessage(
        remoteJid,
        { text: 'Opciones disponibles: *welcome*, *nsfw*, *modoadmin*' },
        { quoted: msg }
      )
      return
    }

    const value = commandName === 'on'
    const settings = await ensureGroupSettings(remoteJid)
    settings.groups[remoteJid][option] = value
    await saveSettings(settings)

    await sock.sendMessage(
      remoteJid,
      { text: `✅ La opción *${option}* fue ${value ? 'activada' : 'desactivada'} para este grupo.` },
      { quoted: msg }
    )
  }
}
