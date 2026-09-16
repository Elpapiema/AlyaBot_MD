import { ensureGroupSettings, saveSettings } from '../../lib/settings.js'

export default {
  name: 'bot',
  command: ['bot'],
  groupOnly: true,
  adminOnly: true,
  tags: ['config'],

  async run({ sock, msg, args, remoteJid }) {
    const option = String(args[0] || '').toLowerCase()

    if (!['on', 'off'].includes(option)) {
      await sock.sendMessage(
        remoteJid,
        { text: 'Usa: bot on o bot off' },
        { quoted: msg }
      )
      return
    }

    const settings = await ensureGroupSettings(remoteJid)
    const enabled = option === 'on'
    settings.groups[remoteJid].botEnabled = enabled
    await saveSettings(settings)

    await sock.sendMessage(
      remoteJid,
      { text: `alyabot ${enabled ? 'activada' : 'desactivada'} en este grupo` },
      { quoted: msg }
    )
  }
}
