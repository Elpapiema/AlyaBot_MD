import fs from 'fs';

const filePath = './personalize.json';

let handler = async (m) => {
    const data = JSON.parse(fs.readFileSync(filePath));

    const videos = data.global?.videos?.length > 0 
        ? data.global.videos 
        : data.default.videos;

    if (!videos.length) {
        m.reply('❌ No hay videos configurados.');
        return;
    }

    const videoList = videos.map((url, index) => `${index + 1}. ${url}`).join('\n');
    m.reply(`🎥 *Videos configurados:*\n\n${videoList}`);
};

handler.help = ['viewbanner'];
handler.tags = ['config'];
handler.command = /^viewbanner$/i;

export default handler;