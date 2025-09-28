let handler = async (m, { conn, args, isOwner }) => {
  const link = args[0]
  if (!link) throw '*Uso correcto: .join <enlace de invitación del grupo>*'

  const groupInviteRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/
  const code = link.match(groupInviteRegex)?.[1]

  if (!code) throw '*Enlace inválido. Asegúrate de copiar el enlace completo del grupo.*'

  if (isOwner) {
    await conn.groupAcceptInvite(code)
    m.reply('*Me he unido al grupo exitosamente.*')
  } else {
    let text = `*Solicitud de unión a grupo*\n\n` +
               `*Usuario:* wa.me/${m.sender.split('@')[0]}\n` +
               `*Enlace:* ${link}`

    for (let owner of global.owner) {
      let jid = typeof owner === 'string' ? owner : owner[0]
      await conn.sendMessage(jid + '@s.whatsapp.net', { text }, { quoted: m })
    }

    m.reply('*Tu solicitud ha sido enviada a los administradores. Espera su aprobación.*')
  }
}

handler.help = ['join <link>']
handler.tags = ['owner']
handler.command = ['join']
handler.owner = true
export default handler