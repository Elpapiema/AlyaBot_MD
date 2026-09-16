function getTargetUser(msg, args) {
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid
    || msg.message?.contextInfo?.mentionedJid
    || []
  const quotedSender = msg.message?.extendedTextMessage?.contextInfo?.participant
    || msg.message?.contextInfo?.participant
    || null

  if (mentioned[0]) return mentioned[0]
  if (quotedSender) return quotedSender

  const raw = String(args[0] || '').trim()
  const digits = raw.replace(/[^0-9]/g, '')
  return digits ? `${digits}@s.whatsapp.net` : null
}

export default {
  name: 'group-admin-actions',
  command: ['promote', 'promover', 'daradmin', 'demote', 'quitaradmin', 'degradar', 'kick', 'ban'],
  tags: ['group'],
  groupOnly: true,
  adminOnly: true,

  async run({ sock, msg, args, commandName, remoteJid, groupMetadata }) {
    const target = getTargetUser(msg, args)
    if (!target) {
      return sock.sendMessage(remoteJid, {
        text: '✏️ Menciona, responde o escribe el número del usuario objetivo.'
      }, { quoted: msg })
    }

    const participants = Array.isArray(groupMetadata?.participants) ? groupMetadata.participants : []
    const participant = participants.find((item) => item.id === target)
    const isAdminTarget = Boolean(participant?.admin)

    try {
      if (['promote', 'promover', 'daradmin'].includes(commandName)) {
        if (isAdminTarget) {
          return sock.sendMessage(remoteJid, { text: '🔺 Ese usuario ya es administrador.' }, { quoted: msg })
        }

        await sock.groupParticipantsUpdate(remoteJid, [target], 'promote')
        return sock.sendMessage(remoteJid, {
          text: `✅ Se ha promovido a @${target.split('@')[0]} como administrador.`,
          mentions: [target]
        }, { quoted: msg })
      }

      if (['demote', 'quitaradmin', 'degradar'].includes(commandName)) {
        if (!isAdminTarget) {
          return sock.sendMessage(remoteJid, { text: '⚠️ Ese usuario no es administrador.' }, { quoted: msg })
        }

        await sock.groupParticipantsUpdate(remoteJid, [target], 'demote')
        return sock.sendMessage(remoteJid, {
          text: `🛑 Se ha removido el admin de @${target.split('@')[0]}.`,
          mentions: [target]
        }, { quoted: msg })
      }

      if (!participant) {
        return sock.sendMessage(remoteJid, { text: '❌ El usuario no es miembro del grupo.' }, { quoted: msg })
      }

      if (isAdminTarget) {
        return sock.sendMessage(remoteJid, { text: '❌ No puedes expulsar a un administrador.' }, { quoted: msg })
      }

      await sock.groupParticipantsUpdate(remoteJid, [target], 'remove')
      await sock.sendMessage(remoteJid, {
        text: `✅ El usuario @${target.split('@')[0]} ha sido expulsado del grupo.`,
        mentions: [target]
      }, { quoted: msg })
    } catch (error) {
      console.error(error)
      await sock.sendMessage(remoteJid, {
        text: `❌ Error al ejecutar la acción: ${error.message}`
      }, { quoted: msg })
    }
  }
}
