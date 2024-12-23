import fs from 'fs';

const filePath = './personalize.json';

let handler = async (m, { text }) => {
    if (!text) throw '❌ Debes proporcionar un enlace de video.';

    const data = JSON.parse(fs.readFileSync(filePath));

    // Validar si existe el campo global
    if (!data.global) data.global = { botName: null, currency: null, videos: [] };

    // Agregar el video al array
    data.global.videos.push(text);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    m.reply('✅ Video agregado correctamente.');
};

handler.help = ['setbanner <link>'];
handler.tags = ['config'];
handler.command = /^setbanner$/i;

export default handler;