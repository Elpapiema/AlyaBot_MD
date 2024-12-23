import fs from 'fs';

const filePath = './personalize.json';

let handler = async (m, { text }) => {
    if (!text) throw '❌ Debes proporcionar el enlace del video que deseas eliminar.';

    const data = JSON.parse(fs.readFileSync(filePath));

    if (!data.global || !data.global.videos || !data.global.videos.includes(text)) {
        m.reply('❌ El video proporcionado no existe en la lista.');
        return;
    }

    // Eliminar el video de la lista global
    data.global.videos = data.global.videos.filter((url) => url !== text);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    m.reply('✅ Video eliminado correctamente.');
};

handler.help = ['delbanner <link del video>'];
handler.tags = ['config'];
handler.command = /^delbanner$/i;

export default handler;