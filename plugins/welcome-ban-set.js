import fs from 'fs'

let handler = async (m, { conn, text, args, usedPrefix }) => {

  // Validar texto
  if (!text) throw `
🚫 Mensaje de expulsión personalizado

Escribe el mensaje que quieras cuando alguien sea expulsado del grupo.
Puedes usar estas palabras si quieres datos automáticos:

@user → usuario expulsado

@group → nombre del grupo

⚠️ No es obligatorio usarlas.

Ejemplo:
#setban @user fue expulsado de @group 🚫`

  // Ruta settings
  const PATH = './database/settings.json'
  let settings = JSON.parse(fs.readFileSync(PATH))

  // Si no existe la sección groups, crearla
  if (!settings.groups) settings.groups = {}

  const id = m.chat

  // Crear grupo si no existe
  if (!settings.groups[id]) settings.groups[id] = {}

  // Guardar msgBan SOLO en groups
  settings.groups[id].msgBan = text

  fs.writeFileSync(PATH, JSON.stringify(settings, null, 2))

  m.reply(`✨ *Mensaje de ban actualizado*\n\n📌 Ahora usaré este mensaje cuando alguien sea baneado del grupo:\n\n${text}`)
}

handler.help = ['setban <texto>']
handler.tags = ['group']
handler.command = ['setban']
handler.group = true // Solo grupos
handler.admin = true // Solo admins

export default handler
