import fs from 'fs';

const filePath = './database/personalize.json';

let handler = async (m, { conn }) => {
    try {
        const data = JSON.parse(fs.readFileSync(filePath));

        // Cargar datos globales y predeterminados
        const globalConfig = data.global;
        const defaultConfig = data.default;

        const botName = globalConfig.botName || defaultConfig.botName;
        const currency = globalConfig.currency || defaultConfig.currency;
        const videos = globalConfig.videos.length > 0 ? globalConfig.videos : defaultConfig.videos;

        const randomVideoUrl = videos[Math.floor(Math.random() * videos.length)];

        const menuMessage = `
╔═══════════════════🌙
║ ❀•° ${botName} °•❀
║ 💜 𝑫𝒆𝒔𝒂𝒓𝒓𝒐𝒍𝒍𝒂𝒅𝒐 𝒑𝒐𝒓: ${dev}
║ 🎀 𝑽𝒆𝒓𝒔𝒊ó𝒏: ${vs}
╚❀•°🌠°•❀═══════════════════

💬¡Hola ! Soy ${botName}, aquí tienes la lista de comandos ✨
💰 Moneda actual: ¥ ${currency}

╭── ⋆⋅🎀⋅⋆ ──╮
│ 🎨 𝙿𝙴𝚁𝚂𝙾𝙽𝙰𝙻𝙸𝚉𝙰𝙲𝙸Ó𝙽 🌸
│ ✧ .setname 🖋️
│ ✧ .setbanner 🖼️
│ ✧ .setmoneda 💰
│ ✧ .viewbanner 📜
│ ✧ .deletebanner 🚮
│ ✧ .resetpreferences 🔄
╰── ⋆⋅🚀⋅⋆ ──╯

╭── ⋆⋅🎀⋅⋆ ──╮
│ 🎩 𝙰𝙳𝙼𝙸𝙽𝙸𝚂𝚃𝚁𝙰𝙲𝙸Ó𝙽 ⚙️
│ ✧ .ban ➩ .kick 🚫 Expulsa a los usuarios (Solo Admins)
│ ✧ .getplugin 🔌
│ ✧ .getpack 📦
│ ✧ .store 🛒
│ ✧ .status 💻
│ ✧ .ping ⏳
╰── ⋆⋅🚀⋅⋆ ──╯

╭── ⋆⋅🎀⋅⋆ ──╮
│ 🎲 𝚁𝙰𝙽𝙳𝙾𝙼 🎭
│ ✧ .rw ➩ .rollwaifu 💖
│ ✧ .winfo 💖
│ ✧ .c ➩ .claim 📜
│ ✧ .harem 💑
│ ✧ .addrw 📝
│ ✧ .alya ➩ .bot 💖
│ ✧ .kaori 💖
│ ✧ .Gemini 🌟
╰── ⋆⋅🚀⋅⋆ ──╯

╭── ⋆⋅🎀⋅⋆ ──╮
│ 📥 𝙳𝙴𝚂𝙲𝙰𝚁𝙶𝙰𝚂 🎵
│ ✧ .play ➩ nombre de la canción 🎶 (audio)
│ ✧ .play2 ➩ nombre de la canción 🎥 (video)
│ ✧ .tt ➩ .tiktok ➩ enlace de TikTok 🎞️
│ ✧ .sp ➩ .Spotify enlace de Spotify 🎼
│ ✧ .fb ➩ link de facebook 🎥 (video)
╰── ⋆⋅🚀⋅⋆ ──╯

╭── ⋆⋅🎀⋅⋆ ──╮
│ ⚔️ 𝚁𝙿𝙶 🏹
│ ✧ .w ➩ .work 💼
│ ✧ .slut 😈
│ ✧ .robar 💰
│ ✧ .deposit (cantidad) 🏦
│ ✧ .retirar (cantidad) 🏧
│ ✧ .transferir (cantidad) @usuario 🔁
│ ✧ .perfil 🆔
​​╰── ⋆⋅🚀⋅⋆ ──╯

╭── ⋆⋅🎀⋅⋆ ──╮
│ 💕 𝚁𝙴𝙰𝙲𝙲𝙸𝙾𝙽𝙴𝚂 𝙰𝙽𝙸𝙼𝙴 🎭
│ ✧ .abrazar 🤗
│ ✧ .aburrido 😑
│ ✧ .bañarse 🛁
│ ✧ .bleh 😝
│ ✧ .comer 🍙
│ ✧ .dance 💃🕺
│ ✧ .enojado 😡
│ ✧ .feliz 😊
│ ✧ .kiss 😘
│ ✧ .love ❤️
│ ✧ .matar 🔪
│ ✧ .morder 🦷
│ ✧ .nalguear 🍑
│ ✧ .punch 👊
│ ✧ .saludar 👋
│ ✧ .bofetada 🖐️
│ ✧ .dormir 😴
╰── ⋆⋅🚀⋅⋆ ──╯

╭── ⋆⋅🎀⋅⋆ ──╮
│ 👑 𝙾𝚆𝙽𝙴𝚁 🛠️
│ ✧ .update 🔄
│ ✧ .dsowner ➩ .purgar 🗑️
│ ✧ .join 🎎
╰── ⋆⋅🚀⋅⋆ ──╯

> ${copy} Hecho con mucho amor por ${dev}
`;

        await conn.sendMessage(
            m.chat,
            {
                video: { url: randomVideoUrl },
                gifPlayback: true,
                caption: menuMessage,
                mentions: [m.sender]
            }
        );
    } catch (error) {
        conn.reply(m.chat, `❌ Error al cargar el menú: ${error.message}`, m);
    }
};

handler.help = ['menu'];
handler.tags = ['info'];
handler.command = ['menu', 'help'];

export default handler;

/* estilos de menu

┎───•✧•───⌬
┃
┖───•✧•  */