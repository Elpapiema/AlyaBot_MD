import { exec } from 'child_process';

const handler = async (m, { text }) => {
  if (!text) return m.reply('Por favor, ingresa un comando para ejecutar.');

  exec(text, (err, stdout, stderr) => {
    if (err) return m.reply(`Error:\n${err.message}`);
    if (stderr) return m.reply(`Stderr:\n${stderr}`);
    m.reply(`Resultado:\n${stdout}`);
  });
};

handler.command = /^\$/; // Detecta comandos que inicien con '$'
handler.owner = true; // Solo el owner puede usar este comando

export default handler;