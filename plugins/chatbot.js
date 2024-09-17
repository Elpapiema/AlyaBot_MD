// by https://github.com/elrebelde21

import '../plugins/_content.js'
let handler = m => m
handler.all = async function (m) {
let chat = global.db.data.chats[m.chat]
let name = conn.getName(m.sender)
if (chat.isBanned) return
if (m.isBot || m.sender.includes(`bot`) || m.sender.incudes(`bot`)) {
return true;
}
let vn = 'https://qu.ax/Ocxm.mp3'
let bot = `${pickRandom([`*¡𝑬𝒚! 𝑨𝒒𝒖í 𝒆𝒔𝒕𝒐𝒚. 𝒀𝒐 𝒑𝒖𝒆𝒅𝒐 𝒂𝒚𝒖𝒅𝒂𝒓 👉👈 𝑯𝒆𝒚! 𝑰'𝒎 𝒉𝒆𝒓𝒆. 𝑰 𝒄𝒂𝒏 𝒉𝒆𝒍𝒑 🙌*`, `Aqui estoy | Here I am 😼`, `*Hola Aqui estoy yo puedo ayudar? | Hello, here I am, can I help? 😸*`])}`.trim()
let txt = `*` 

if (/^infohost|hosting|host|corin|corinplus$/i.test(m.text)) {
 await conn.sendMessage(m.chat, { text: txt,
contextInfo:{
forwardedNewsletterMessageInfo: { 
newsletterJid: '120363310525923571@newsletter', 
serverMessageId: '', 
newsletterName: 'AlyaBot & RaphtaliaBot' }, 
forwardingScore: 9999999,
isForwarded: true, 
"externalAdReply": {
"showAdAttribution": true,
"containsAutoReply": true,
title: `*`,
body: `*`,
"previewType": "PHOTO",
thumbnailUrl: '*', 
sourceUrl: accountsgb}}},
{ quoted: fkontak})
} 
 
if (/^bot$/i.test(m.text)) {
await conn.reply(m.chat, bot, m, fakeChannel)
await conn.sendPresenceUpdate('recording', m.chat)    
await conn.sendFile(m.chat, vn, 'bot.mp3', null, m, true, { type: 'audioMessage', ptt: true, sendEphemeral: true, quoted: m })   
}

if (/^e$/i.test(m.text) ) { //sin prefijo 
let teks = `${pickRandom([`Que bueno sabe la letra E`, `eeeeee`])}`.trim()
conn.reply(m.chat, teks, m, { mentions: { mentionedJid: [m.sender] }})}

/*if (/^Mande porno|porno|paja$/i.test(m.text) ) { //sin prefijo 
let teks = `${pickRandom([`no puedo esta contra las política del grupo.😸`, `_uff miren un pajero_`, `_pagame y paso mi pack😏🥵_`, `_que_`, `_que quiere pija dice 🤣_`, `_pasa el pack de tu hermana😏_`, `_mire un gilipolla_`, `_siuuu sexo sexo sexo😈_`, '_callate putito_'])}`.trim()
conn.reply(m.chat, teks, m, { mentions: { mentionedJid: [m.sender] }})}*/

if (/^reglas|normas|Reglas$/i.test(m.text) ) { //sin prefijo 
conn.reply(m.chat, `*╭┅〘 ⚠️ 𝗢𝗯𝗲𝗱𝗲𝗰𝗲 𝗹𝗮𝘀 𝗿𝗲𝗴𝗹𝗮𝘀 ⚠️ 〙*
➽❌ 𝐏𝐫𝐨𝐡𝐢𝐛𝐢𝐝𝐨 𝐥𝐥𝐚𝐦𝐚𝐫 𝐚𝐥 𝐁𝐨𝐭
➽❌ 𝐏𝐫𝐨𝐡𝐢𝐛𝐢𝐝𝐨 𝐒𝐩𝐚𝐦 𝐚𝐥 𝐁𝐨𝐭
➽❌ 𝐍𝐨 𝐚𝐠𝐫𝐞𝐠𝐚𝐫 𝐚𝐥 𝐁𝐨𝐭
➽❌ 𝐑𝐞𝐬𝐩𝐞𝐭𝐚 𝐥𝐨𝐬 𝐭𝐞𝐫𝐦𝐢𝐧𝐨𝐬 𝐲 𝐜𝐨𝐧𝐝𝐢𝐜𝐢𝐨𝐧𝐞𝐬
*╰═┅ৡৢ͜͡✦═╡ 𝙂𝙖𝙩𝙖 𝘿𝙞𝙤𝙨 ╞═┅ৡৢ͜͡✦═╯*`, fkontak, m)}

if (/^Quiero un bot|como obtengo un bot?|Quiero un bot?|quiero un bot|solicitud|solicitó bot|solicito bot|Necesito un bot|necesito un bot$/i.test(m.text) ) {
conn.reply(m.chat,  `\`*\`

*

> *𝙂𝙧𝙖𝙘𝙞𝙖𝙨 𝙥𝙤𝙧 𝙨𝙪𝙨 𝙥𝙧𝙚𝙛𝙚𝙧𝙚𝙣𝙘𝙞𝙖𝙨 𝙚𝙣 ${gt} 🐈💞*`, fkontak, {contextInfo: {externalAdReply :{ mediaUrl: null, mediaType: 1, description: null, title: `Hola ${name} 👋`, body: wm, previewType: 0, thumbnail: gataImg, sourceUrl: accountsgb }}})}
 
if (/^¿Qué es un Bot?|¿Qué es Bot?|Qué es Bot|qué es Bot|QUÉ ES UN BOT|¿QUÉ ES UN BOT?|¿qué es un Bot?|qué es un Bot|que es un Bot|Qué es un Bot?|Que es un Bot? $/i.test(m.text) ) {
conn.reply(m.chat, `\`✨ ¿𝐐𝐮𝐞́ 𝐞𝐬 𝐮𝐧 𝐁𝐨𝐭 𝐝𝐞 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩? ✨\`

🍃 _Un Bot es una inteligencia programada que permite realizar actividades dependiendo de lo que solicite. En temas de WhatsApp, es posible crear stickers, descargar música, vídeos, crear logos, buscar imágenes, interactuar en modo de conversación,  participar en juegos dentro de chats etc..._

🍃 *_Para ver el menú de comandos puedes usar:_*
#menu

🐈 * 🐈`, m)}  
return !0 
}
export default handler

function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]
}
