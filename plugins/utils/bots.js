function formatDuration(startAt) {
  if (!startAt) return 'desconocido'

  const elapsedMs = Math.max(0, Date.now() - startAt)
  const totalSeconds = Math.floor(elapsedMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const parts = []
  if (hours) parts.push(`${hours}h`)
  if (minutes || hours) parts.push(`${minutes}m`)
  parts.push(`${seconds}s`)
  return parts.join(' ')
}

function getSubEntries() {
  if (!Array.isArray(global.conns)) return []

  return global.conns.map((subSock, index) => {
    const rawId = subSock?.user?.id || subSock?.user?.jid || subSock?.__subNumber || 'desconocido'
    const subId = String(rawId).split(':')[0]
    const phone = subId.split('@')[0]
    const startedAt = Number(subSock?.__connectedAt || 0) || null

    return {
      index: index + 1,
      id: subId,
      phone,
      startedAt,
      activeTime: formatDuration(startedAt),
      link: phone && phone !== 'desconocido' ? `https://wa.me/${phone}` : 'No disponible'
    }
  })
}

export default {
  name: 'bots',
  command: ['bots'],
  tags: ['utils'],

  async run({ sock, remoteJid, msg, args }) {
    const subs = getSubEntries()
    const wantList = args.some((arg) => String(arg).toLowerCase() === '-list')

    if (!wantList) {
      const text = [
        '*Subs activos*',
        '',
        `Cantidad: ${subs.length}`,
        '',
        'Usa `bots -list` para ver el detalle.'
      ].join('\n')

      await sock.sendMessage(remoteJid, { text }, { quoted: msg })
      return
    }

    if (!subs.length) {
      await sock.sendMessage(
        remoteJid,
        { text: '*Subs activos*\n\nCantidad: 0\nNo hay sub-bots conectados ahora mismo.' },
        { quoted: msg }
      )
      return
    }

    const lines = ['*Subs activos*', '', `Cantidad: ${subs.length}`, '']
    for (const sub of subs) {
      lines.push(`${sub.index}. Sub activo: ${sub.phone}`)
      lines.push(`Tiempo activo: ${sub.activeTime}`)
      lines.push(`Chat: ${sub.link}`)
      lines.push('')
    }

    await sock.sendMessage(remoteJid, { text: lines.join('\n').trim() }, { quoted: msg })
  }
}
