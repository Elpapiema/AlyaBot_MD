import fs from 'node:fs'
import path from 'node:path'

const filePath = path.join(process.cwd(), 'plugins', 'nsfw-menu.js')

function ensureNsfwMenu() {
  if (fs.existsSync(filePath)) return

  const content = `export default {
  name: 'menunsfw',
  command: ['menunsfw'],
  tags: ['nsfw'],

  async run({ sock, msg, remoteJid }) {
    await sock.sendMessage(remoteJid, {
      text: 'Los comandos NSFW no están instalados. Usa #getpack Paquete +18 para instalar.'
    }, { quoted: msg })
  }
}
`

  fs.writeFileSync(filePath, content, 'utf8')
  console.log('✅ Archivo "nsfw-menu.js" creado correctamente.')
}

ensureNsfwMenu()

export default ensureNsfwMenu
