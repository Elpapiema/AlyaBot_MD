
let handler = async (m, { conn, text, command }) => {
  if (!m.isGroup) throw '❌ Este comando solo funciona en grupos'
//  if (!m.isAdmin) throw '⚠️ Solo los administradores pueden usar este comando'
  if (!text) throw `✨ Uso:\n\n*${command} abrir*\n*${command} cerrar*\n\nAlias: o / c`

  let option = text.toLowerCase()

  if (option === 'abrir' || option === 'o') {
    await conn.groupSettingUpdate(m.chat, 'not_announcement')
    m.reply('✅ El grupo ha sido *abierto*, ahora todos pueden enviar mensajes.')
  } else if (option === 'cerrar' || option === 'c') {
    await conn.groupSettingUpdate(m.chat, 'announcement')
    m.reply('🔒 El grupo ha sido *cerrado*, solo los administradores pueden enviar mensajes.')
  } else {
    throw `⚠️ Parámetro no válido.\n\nUsa:\n*${command} abrir / o*\n*${command} cerrar / c*`
  }
}

handler.command = /^(grupo|gp)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true;


export default handler