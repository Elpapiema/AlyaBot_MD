import fs from 'fs';

const settingsPath = './database/settings.json';

// Cargar configuración inicial
let settings = {};
if (fs.existsSync(settingsPath)) {
  settings = JSON.parse(fs.readFileSync(settingsPath));
} else {
  settings = {
    global: {
      welcome: true,
      nsfw: false,
      antiprivado: true
    },
    groups: {}
  };
}

// Handler para modificar configuración global (solo owners)
const handler = async (m, { conn, args, isOwner, command }) => {
  if (!isOwner) return m.reply('Solo los owners pueden usar este comando.');

  const option = (args[0] || '').toLowerCase();

  if (!['welcome', 'nsfw', 'antiprivado'].includes(option)) {
    return m.reply(`Opciones disponibles para modificar globalmente: *welcome*, *nsfw*, *antiprivado*`);
  }

  const value = command === 'ono'; // 'ono' activa, 'offo' desactiva

  settings.global[option] = value;

  // Guardar en disco
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

  m.reply(`✅ La opción global *${option}* fue ${value ? 'activada' : 'desactivada'}.`);
};

handler.command = ['ono', 'offo'];
handler.owner = true;

export default handler;
