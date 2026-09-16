import os from 'node:os'
import process from 'node:process'
import { getStorageModeLabel } from '../../lib/storage.js'

function formatBytes(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (!bytes) return '0 Byte'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / (1024 ** i)).toFixed(2)} ${sizes[i]}`
}

function formatTime(secs) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = Math.floor(secs % 60)
  return `${h}h ${m}m ${s}s`
}

export default {
  name: 'status',
  command: ['status', 'estado'],
  tags: ['info'],

  async run({ sock, msg, remoteJid }) {
    const used = process.memoryUsage()
    const cpus = os.cpus()
    const storageMode = await getStorageModeLabel()
    const avgCpuUsage = (
      cpus
        .map((cpu) => {
          const total = Object.values(cpu.times).reduce((acc, current) => acc + current, 0)
          return 100 - ((100 * cpu.times.idle) / total)
        })
        .reduce((acc, current) => acc + current, 0) / cpus.length
    ).toFixed(2)

    const message = [
      '🖥️ *Estado del Bot*',
      '',
      `🔹 Plataforma: ${os.platform()} ${os.arch()}`,
      `🔹 CPU: ${cpus[0]?.model || 'Desconocida'}`,
      `🔹 Núcleos: ${cpus.length} @ ${cpus[0]?.speed || 0} MHz`,
      `🔹 Uso CPU: ${avgCpuUsage}%`,
      `🔹 Uptime: ${formatTime(process.uptime())}`,
      `🔹 Usando Base de datos: ${storageMode}`,
      '',
      `💾 Memoria usada: ${formatBytes(used.rss)}`,
      `💾 Memoria libre: ${formatBytes(os.freemem())}`,
      `💾 Memoria total: ${formatBytes(os.totalmem())}`,
      '',
      '⚙️ Carga del sistema:',
      `• 1 min: ${os.loadavg()[0].toFixed(2)}`,
      `• 5 min: ${os.loadavg()[1].toFixed(2)}`,
      `• 15 min: ${os.loadavg()[2].toFixed(2)}`
    ].join('\n')

    await sock.sendMessage(remoteJid, { text: message }, { quoted: msg })
  }
}
