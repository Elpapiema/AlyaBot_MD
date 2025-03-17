/* Codigo hecho por @Fabri115 y mejorado por BrunoSobrino 
 Parchado por @Emma (Violet's Version)*/

import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync } from 'fs'
import path from 'path'

var handler = async (m, { conn, usedPrefix }) => {

if (global.conn.user.jid !== conn.user.jid) {
return conn.reply(m.chat, `Utiliza este comando directamente en el número principal del Bot.`, m)
}
await conn.reply(m.chat, `Iniciando proceso de purga de los archivos de sesión...`, m)
m.react(rwait)

let sessionPath = `./Alya-BotSession/`

try {

if (!existsSync(sessionPath)) {
return await conn.reply(m.chat, ` La carpeta está vacía.`, m)
}
let files = await fs.readdir(sessionPath)
let filesDeleted = 0
for (const file of files) {
if (file !== 'creds.json') {
await fs.unlink(path.join(sessionPath, file))
filesDeleted++;
}
}
if (filesDeleted === 0) {
await conn.reply(m.chat, ` La carpeta esta vacía.`, m)
} else {
m.react(done)
await conn.reply(m.chat, `Se purgaron ${filesDeleted} archivos de sesión`, m)
conn.reply(m.chat, `*¡Kuze! ¿logras verme?*`, m)

}
} catch (err) {
console.error('Error al leer la carpeta o los archivos de sesión:', err);
await conn.reply(m.chat, `${msm} Ocurrió un fallo.`, m)
}

}
handler.help = ['dsowner']
handler.tags = ['owner']
handler.command = ['delai', 'dsowner', 'clearallsession', 'purgar']
handler.rowner = true;

export default handler