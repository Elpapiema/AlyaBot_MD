import fs from 'fs'

let handler = async (m, { conn, text, args, usedPrefix }) => {

  // Validar texto
  if (!text) throw `
👋 Despedida personalizada

Escribe tu mensaje como quieras cuando alguien salga del grupo.
Puedes usar estas palabras si quieres datos automáticos:

- @user → usuario que salió

- @group → nombre del grupo

⚠️ No es obligatorio usarlas.

Ejemplo:
#setbye Adiós @user 👋 fue un gusto tenerte en: @group 😢`

  // Ruta settings
  const PATH = './database/settings.json'
  let settings = JSON.parse(fs.readFileSync(PATH))

  // Si no existe la sección groups, crearla
  if (!settings.groups) settings.groups = {}

  const id = m.chat

  // Crear grupo si no existe
  if (!settings.groups[id]) settings.groups[id] = {}

  // Guardar msgBye SOLO en groups
  settings.groups[id].msgBye = text

  fs.writeFileSync(PATH, JSON.stringify(settings, null, 2))

  m.reply(`✨ *Mensaje de despedida actualizado*\n\n📌 Ahora usaré este mensaje cuando alguien salga del grupo:\n\n${text}`)
}

handler.help = ['setbye <texto>']
handler.tags = ['group']
handler.command = ['setbye']
handler.group = true // Solo grupos
handler.admin = true // Solo admins

export default handler
