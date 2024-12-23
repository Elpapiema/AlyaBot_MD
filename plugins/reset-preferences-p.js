import fs from 'fs';

const filePath = './personalize.json';

let handler = async (m) => {
    const data = JSON.parse(fs.readFileSync(filePath));

    // Restablecer la personalización global al estado predeterminado
    data.global = {
        botName: null,
        currency: null,
        videos: []
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    m.reply('✅ Personalización global restablecida.');
};

handler.help = ['resetpreferences'];
handler.tags = ['config'];
handler.command = /^resetpreferences$/i;

export default handler;