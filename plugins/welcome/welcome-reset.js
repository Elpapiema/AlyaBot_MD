import { loadSettings, saveSettings } from '../../lib/settings.js'

export default {
  name: 'resetmsgs',
  command: ['resetmsgs'],
  groupOnly: true,
  adminOnly: true,
  tags: ['group'],

  async run({ sock, msg, remoteJid }) {
    const settings = await loadSettings()

    if (!settings.groups[remoteJid]) {
      await sock.sendMessage(
        remoteJid,
        { text: '⚠️ Este grupo no tiene configuraciones personalizadas.' },
        { quoted: msg }
      )
      return
    }

    delete settings.groups[remoteJid].msgWelcome
    delete settings.groups[remoteJid].msgBye
    delete settings.groups[remoteJid].msgBan

    await saveSettings(settings)

    await sock.sendMessage(
      remoteJid,
      { text: '🧹 *Mensajes personalizados eliminados*\n\nAhora usaré los mensajes por defecto.' },
      { quoted: msg }
    )
  }
}
