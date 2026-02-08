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
      antiprivado: true,
      modoadmin: false,
      msgWelcome: '🌸 Hola @user~\n\nBienvenido/a a *『@group』* ✨  \nMe alegra tenerte por aquí.\n\n💬 Escribe *#menu* para ver lo que puedo hacer.\n\n📌 *Lee la descripción del grupo, ¿sí?*  \n> *@desc*\n\n🎀 Disfruta tu estancia… o te jalo las orejas 😘',
      msgBye: '👋 Adiós, @user~\n\nGracias por haber estado en *『@group』*.  \nTe deseamos lo mejor por allá.\n\n🎀 Las puertas quedan abiertas…  \npero no te olvides de nosotros 😘',
      msgBan: '🔨 @user fue expulsado/a\n\nEn *『@group』* hay reglas,  \ny no cumplirlas tiene consecuencias.\n\n🎀 Sin rencores…  \npero aquí se cuida el orden 😌'
    },
    groups: {}
  };
}

const handler = async (m, { conn, args, isAdmin, isBotAdmin, command }) => {
  if (!m.isGroup) return m.reply('Este comando solo funciona en grupos.');
  if (!isAdmin) return m.reply('Solo los administradores pueden usar este comando.');

  const option = (args[0] || '').toLowerCase();

  if (!['welcome', 'nsfw', 'modoadmin'].includes(option)) {
    return m.reply(`Opciones disponibles: *welcome*, *nsfw*, *modoadmin*`);
  }

  const value = command === 'on';

  const groupId = m.chat;

  // Asegurar que existe el objeto del grupo
  if (!settings.groups[groupId]) {
    settings.groups[groupId] = {};
  }

  settings.groups[groupId][option] = value;

  // Guardar en disco
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

  m.reply(`✅ La opción *${option}* fue ${value ? 'activada' : 'desactivada'} para este grupo.`);
};

handler.command = ['on', 'off'];
handler.group = true;
handler.admin = true;

export default handler;




/*import fs from 'fs';

const settingsPath = './settings.json';

let handler = async (m, { conn, usedPrefix, command, args, isOwner }) => {
    const setting = args[0]?.toLowerCase();
    if (!setting) {
        throw `⚠️ Especifica la configuración que deseas cambiar.\n\nUso: *${usedPrefix + command} <welcome/bye/nsfw/arabkick>*`;
    }

    const validSettings = ['welcome', 'bye', 'nsfw', 'arabkick', 'antiprivado'];
    if (!validSettings.includes(setting)) {
        throw `⚠️ Configuración no válida.\n\nOpciones disponibles:\n- welcome\n- bye\n- nsfw\n- arabkick`;
    }

    // Determinar acción (activar/desactivar)
    const action = command === 'on';

    // Cargar settings
    let settings = {};
    if (fs.existsSync(settingsPath)) {
        settings = JSON.parse(fs.readFileSync(settingsPath));
    }

    const key = isOwner ? 'global' : m.chat;
    if (!settings[key]) settings[key] = {};
    settings[key][setting] = action;

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    m.reply(`✅ La configuración *${setting}* ha sido ${action ? 'activada' : 'desactivada'} correctamente ${isOwner ? 'globalmente' : 'para este grupo'}.`);
};

handler.help = ['on <setting>', 'off <setting>'];
handler.tags = ['group', 'config'];
handler.command = ['on', 'off'];
handler.admin = true;
//handler.group = true;

export default handler;*/
