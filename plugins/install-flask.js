import { exec } from 'child_process';

const handler = async (m, { conn }) => {
  m.reply('Instalando Flask, por favor espera...');

  exec('pip install flask', (error, stdout, stderr) => {
    if (error) {
      return m.reply(`❌ Error al instalar Flask:\n${error.message}`);
    }
    if (stderr) {
      return m.reply(`⚠ Advertencia:\n${stderr}`);
    }
    m.reply(`✅ Flask instalado correctamente:\n${stdout}`);
  });
};

handler.command = ['installflask'];

export default handler;