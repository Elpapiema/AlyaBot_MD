import fs from 'fs';

const filePath = './personalize.json';

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
┎───•✧•───⌬

   ✦ Desarrollado por: 𝓔𝓶𝓶𝓪 (𝓥𝓲𝓸𝓵𝓮𝓽'𝓼 𝓥𝓮𝓻𝓼𝓲𝓸𝓷)

   ✦ Versión actual: ${vs}

┖───•✧•

   *Hola!* soy ${botName}, aquí tienes la lista de comandos
   ✦ *La Moneda actual es :* ${currency}

┎───•✧•───⌬
> 𝙿𝚎𝚛𝚜𝚘𝚗𝚊𝚕𝚒𝚣𝚊𝚌𝚒𝚘𝚗   (ノ^o^)ノ  

 ❀ .setname 
 ❀ .setbanner
 ❀ .setmoneda
 ❀ .viewbanner
 ❀ .deletebanner
 ❀ .resetpreferences

┖───•✧•
┎───•✧•───⌬
> 𝚊𝚍𝚖𝚒𝚗𝚒𝚜𝚝𝚛𝚊𝚌𝚒𝚘𝚗   (ノ^o^)ノ 

❀ .ban ➩ .kick _expulsa a los ususarios *Solo para Admins*_

┖───•✧•
┎───•✧•───⌬
> 𝚁𝚊𝚗𝚍𝚘𝚖   (ノ^o^)ノ  

 ❀ .rw ➩ .rollwaifu 
 ❀ .c ➩ .claim
 ❀ .harem
┖───•✧•
┎───•✧•───⌬
> 𝙳𝚎𝚜𝚌𝚊𝚛𝚐𝚊𝚜   (ノ^o^)ノ  

  ❀ .play ➩ _nombre de la cancion ➩_ (audio)
  ❀ .play2 ➩ _nombre de la cancion_ (video)
  ❀ .tt ➩ .tiktok ➩ _link de tiktok_ (vídeo)
  ❀ .sp .Spotify _link de Spotify_

┖───•✧•
┎───•✧•───⌬
> 𝚁𝙿𝙶   (ノ^o^)ノ

 ❀ .w .work
 ❀ .slut

┖───•✧•
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
handler.command = /^(menu)$/i;

export default handler;