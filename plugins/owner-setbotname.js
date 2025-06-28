import fs from 'fs';

const filePath = './database/personalize.json';

let handler = async (m, { text }) => {
    if (!text) throw '❌ Debes proporcionar un nombre para el bot.';

    const data = JSON.parse(fs.readFileSync(filePath));

    // Validar si existe el campo global
    if (!data.global) data.global = { botName: null, currency: null, videos: [] };

    // Actualizar el nombre global del bot
    data.global.botName = text;

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    m.reply(`✅ Nombre del bot actualizado a: *${text}*`);
};

handler.help = ['setname <nombre>'];
handler.tags = ['config'];
handler.command = /^setname$/i;

export default handler;