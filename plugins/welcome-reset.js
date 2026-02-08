import fs from 'fs'

let handler = async (m, { conn }) => {

  const PATH = './database/settings.json'
  let settings = JSON.parse(fs.readFileSync(PATH))

  if (!settings.groups) settings.groups = {}

  const id = m.chat

  if (!settings.groups[id]) {
    return m.reply('⚠️ Este grupo no tiene configuraciones personalizadas.')
  }

  // Eliminar mensajes personalizados
  delete settings.groups[id].msgWelcome
  delete settings.groups[id].msgBye
  delete settings.groups[id].msgBan

  fs.writeFileSync(PATH, JSON.stringify(settings, null, 2))

  m.reply('🧹 *Mensajes personalizados eliminados*\n\nAhora usaré los mensajes por defecto.')
}

handler.help = ['resetmsgs']
handler.tags = ['group']
handler.command = ['resetmsgs']
handler.group = true
handler.admin = true

export default handler
