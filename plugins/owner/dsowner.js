import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

export default {
  name: 'dsowner',
  command: ['delai', 'dsowner', 'clearallsession', 'purgar'],
  tags: ['owner'],
  ownerOnly: true,

  async run({ sock, msg, remoteJid }) {
    const sessionPath = path.resolve('./Alya-BotSession')

    await sock.sendMessage(remoteJid, {
      text: 'Iniciando proceso de purga de los archivos de sesión...'
    }, { quoted: msg })

    try {
      if (!existsSync(sessionPath)) {
        return sock.sendMessage(remoteJid, { text: 'La carpeta está vacía.' }, { quoted: msg })
      }

      const files = await fs.readdir(sessionPath)
      let filesDeleted = 0

      for (const file of files) {
        if (file === 'creds.json') continue
        await fs.unlink(path.join(sessionPath, file))
        filesDeleted += 1
      }

      const text = filesDeleted === 0
        ? 'La carpeta está vacía.'
        : `Se purgaron ${filesDeleted} archivos de sesión.\n\n*¡Kuze! ¿logras verme?*`

      await sock.sendMessage(remoteJid, { text }, { quoted: msg })
    } catch (error) {
      console.error(error)
      await sock.sendMessage(remoteJid, {
        text: `Ocurrió un fallo.\n${error.message}`
      }, { quoted: msg })
    }
  }
}
