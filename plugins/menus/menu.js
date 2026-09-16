import { loadPersonalize } from '../../lib/storage.js'

export default {
  name: 'menu',
  command: ['menu'],
  groupOnly: false,
  adminOnly: false,
  ownerOnly: false,

  async run({ sock, msg, remoteJid }) {
    try {
      const data = await loadPersonalize()

      const globalConfig = data.global
      const defaultConfig = data.default

      const botName = globalConfig.botName || defaultConfig.botName
      const currency = globalConfig.currency || defaultConfig.currency
      const videos = globalConfig.videos.length > 0 ? globalConfig.videos : defaultConfig.videos

      const randomVideoUrl = videos[Math.floor(Math.random() * videos.length)]

      const menuMessage = `
╭──〕${botName} 〕
├̟̇❀ 𝑫𝒆𝒔𝒂𝒓𝒓𝒐𝒍𝒍𝒂𝒅𝒐 𝑷𝒐𝒓 : 
├̟̇❀ ${dev}
├̟̇❀ 𝑽𝒆𝒓𝒔𝒊𝒐́𝒏 : ${vs}
╰──────────╼

💬¡Hola ! Soy ${botName}, aquí tienes la lista de comandos ✨
💰 Moneda actual: ¥ ${currency}

Checa nuestro Canal Oficial de WhatsApp en donde se publican actualizaciones:

https://whatsapp.com/channel/0029VbBCHSsJZg41QE3Ibl3O

╭── ⋆⋅🎀⋅⋆ ──╮
│ 🎨 𝙿𝙴𝚁𝚂𝙾𝙽𝙰𝙻𝙸𝚉𝙰𝙲𝙸Ó𝙽 🌸
│ ✧ .setname 🖋️
│ ✧ .setbanner 🖼️
│ ✧ .setmoneda 💰
│ ✧ .viewbanner 📜
│ ✧ .deletebanner 🚮
│ ✧ .resetpreferences 🔄
│ ✧ .setwelcome 🏠
│ ✧ .setbye 👋
│ ✧ .setban 🔨
│ ✧ .resetmsgs (reinicia mensajes personalizados)
╰── ⋆⋅🚀⋅⋆ ──╯

╭── ⋆⋅🎀⋅⋆ ──╮
│ 🎩 𝙰𝙳𝙼𝙸𝙽𝙸𝚂𝚃𝚁𝙰𝙲𝙸Ó𝙽 ⚙️
│ ✧ .ban ➩ .kick 🚫 Expulsa a los usuarios (Solo Admins)
│ ✧ .getplugin 🔌
│ ✧ .getpack 📦
│ ✧ .store 🛒
│ ✧ .status 💻
│ ✧ .ping ⏳
│ ✧ .promote ➩ .daradmin 👑
│ ✧ .demote ➩ .quitaradmin 🛑
│ ✧ .gp ➩ .grupo 🛠️ (abrir/cerrar)
│ ✧ .on / .off 🔌 Activa o desactiva configuraciones 
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
╰── ⋆⋅🚀⋅⋆ ──╯

╭── ⋆⋅🎀⋅⋆ ──╮
│ 📥 𝙳𝙴𝚂𝙲𝙰𝚁𝙶𝙰𝚂 🎵
│ ✧ .play ➩ nombre de la canción 🎶 (audio)
│ ✧ .play2 ➩ nombre de la canción 🎥 (video)
│ ✧ .tt ➩ .tiktok ➩ enlace de TikTok 🎞️
│ ✧ .ttp ➩ .ttph ➩ enlace de tiktok slides 📷
│ ✧ .yt ➩ .ytv ➩ enlace de YouTube 🎥
│ ✧ .yta ➩ enlace de YouTube 🎵
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
╰── ⋆⋅🚀⋅⋆ ──╯

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
│ 🛠️𝚑𝚎𝚛𝚛𝚊𝚖𝚒𝚎𝚗𝚝𝚊𝚜🛠️
│ ✧ .gemini 🌟
╰── ⋆⋅🚀⋅⋆ ──╯

╭── ⋆⋅🎀⋅⋆ ──╮
│ 👑 𝙾𝚆𝙽𝙴𝚁 🛠️
│ ✧ .update 🔄
│ ✧ .dsowner ➩ .purgar 🗑️
│ ✧ .join 🎎
│ ✧ .ono / .offoS
╰── ⋆⋅🚀⋅⋆ ──╯

> ${copy} Hecho con mucho amor por ${dev}
`

      await sock.sendMessage(remoteJid, {
        video: { url: randomVideoUrl },
        gifPlayback: true,
        caption: menuMessage,
        mentions: [msg.key.participant || msg.key.remoteJid]
      }, { quoted: msg })

    } catch (error) {
      await sock.sendMessage(remoteJid, {
        text: `❌ Error al cargar el menú:\n${error.message}`
      }, { quoted: msg })
    }
  }
}
