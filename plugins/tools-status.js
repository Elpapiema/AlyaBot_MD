import os from 'os';
import process from 'process';

let handler = async (m, { conn }) => {
  const used = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const platform = os.platform();
  const arch = os.arch();
  const uptime = process.uptime();
  const cpus = os.cpus();
  const load = os.loadavg();

  const format = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return `${h}h ${m}m ${s}s`;
  };

  // Calcular el porcentaje de uso de CPU (promedio de todos los núcleos)
  const cpuUsagePercent = cpus.map(cpu => {
    const total = Object.values(cpu.times).reduce((acc, tv) => acc + tv, 0);
    const idle = cpu.times.idle;
    return 100 - (100 * idle / total);
  });

  const avgCpuUsage = (cpuUsagePercent.reduce((a, b) => a + b, 0) / cpuUsagePercent.length).toFixed(2);

  const cpuModel = cpus[0].model;
  const cpuSpeed = cpus[0].speed;
  const cores = cpus.length;

  const message = `
🖥️ *Estado del Bot*

🔹 Plataforma: ${platform} ${arch}
🔹 CPU: ${cpuModel}
🔹 Núcleos: ${cores} @ ${cpuSpeed} MHz
🔹 Uso CPU: ${avgCpuUsage}%
🔹 Uptime: ${formatTime(uptime)}

💾 Memoria usada: ${format(used.rss)}
💾 Memoria libre: ${format(freeMem)}
💾 Memoria total: ${format(totalMem)}

⚙️ Carga del sistema:
   • 1 min: ${load[0].toFixed(2)}
   • 5 min: ${load[1].toFixed(2)}
   • 15 min: ${load[2].toFixed(2)}
`.trim();

  m.reply(message);
};

handler.help = ['status', 'estado'];
handler.tags = ['info'];
handler.command =['status', 'estado'];

export default handler;