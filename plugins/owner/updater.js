import { exec } from 'child_process'
import util from 'util'

const execAsync = util.promisify(exec)

export default {
  name: 'update',
  command: ['update'],
  groupOnly: false,
  adminOnly: false,
  ownerOnly: true,

  async run({ sock, msg, remoteJid }) {
    try {
      await sock.sendMessage(remoteJid, {
        text: '🔄 Actualizando repositorio...'
      }, { quoted: msg })

      const { stdout, stderr } = await execAsync('git pull')

      let output = stdout || stderr || 'Sin cambios.'

      if (output.length > 4000) {
        output = output.slice(0, 4000)
      }

      await sock.sendMessage(remoteJid, {
        text: `✅ *Actualización completada*\n\n${output}`
      }, { quoted: msg })

    } catch (error) {
      await sock.sendMessage(remoteJid, {
        text: `❌ Error al actualizar:\n${error.message}`
      }, { quoted: msg })
    }
  }
}