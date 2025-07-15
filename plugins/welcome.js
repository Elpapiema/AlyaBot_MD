/*import { WAMessageStubType } from '@whiskeysockets/baileys'; // Asegúrate de importar correctamente
import fetch from 'node-fetch'; // Para obtener imágenes de perfil
import uploadImage from '../lib/uploadImage.js'; // Importar la función de carga de imágenes

export async function before(m, { conn, groupMetadata }) {
  // Verificar si el mensaje es un evento de grupo y si es de tipo bienvenida (27) o despedida (28, 32)
  if (!m.messageStubType || !m.isGroup) return;

  // Obtener la foto de perfil del usuario
  let pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => 'https://telegra.ph/file/2a1d71ab744b55b28f1ae.jpg');
  let img = await (await fetch(pp)).buffer();

  // Subir la imagen a qu.ax
  let uploadedImageUrl;
  try {
    uploadedImageUrl = await uploadImage(img); // Cargar la imagen en qu.ax
  } catch (error) {
    console.error('Error al cargar la imagen en qu.ax:', error);
    uploadedImageUrl = pp; // Si falla, usar la URL original de la imagen
  }

  // Obtener el nombre del usuario
  let usuario = `@${m.messageStubParameters[0].split('@')[0]}`;

  // Obtener metadatos del grupo
  let subject = groupMetadata.subject; // Nombre del grupo
  let descs = groupMetadata.desc || "*Descripción predeterminada del grupo*"; // Descripción del grupo

  // Generar imagen con la API
  let welcomeImageUrl = `https://api.siputzx.my.id/api/canvas/welcomev2?username=${encodeURIComponent(usuario)}&memberCount=6&avatar=${encodeURIComponent(uploadedImageUrl)}&background=https://files.catbox.moe/ei4p4u.jpg`;

  // Mensaje de bienvenida personalizado
  if (m.messageStubType == 27) { // Evento de entrada al grupo
    let textWel = `
┏━━━━━━━━━━━━
┃──〘 *BIENVENIDO/A* 〙──
┃━━━━━━━━━━━━
┃ *Hola ${usuario} 👋 Bienvenido/a a*
┃ *_${subject} ✨_*
┃
┃=> *_En este grupo podrás_*
┃ *_encontrar:_*
┠⊷ *Amistades 🫂*
┠⊷ *Desmadre 💃🕺*
┠⊷ *Relajo 💅*
┠⊷ *Un Bot Sexy 🤖*
┃
┃=> *_Puedes solicitar mi lista de_*
┃ *_comandos con:_*
┠⊷ *#menu*
┃
┃=> *_Aquí tienes la descripción_*
┃ *_del grupo, léela!!_*
┃
${descs}
┃
┃ *_🥳 Disfruta de tu_*
┃ *_estadía en el grupo 🥳_*
┃
┗━━━━━━━━━━━`;

    await conn.sendMessage(m.chat, {
      image: { url: welcomeImageUrl }, // Usar la imagen generada por la API
      caption: textWel,
      mentions: [m.sender, m.messageStubParameters[0]] // Menciona al usuario
    });
  }

  // Mensaje de despedida personalizado
  else if (m.messageStubType == 28 || m.messageStubType == 32) { // Evento de salida del grupo
    let textBye = `
┏━━━━━━━━━━━━
┃──〘 *ADIOS* 〙───
┃━━━━━━━━━━━━
┃ *_☠ Se fue ${usuario}_*
┃ *_Que dios lo bendiga️_*
┃ *_Y lo atropelle un tren 😇_*
┗━━━━━━━━━━`;

    await conn.sendMessage(m.chat, {
      image: { url: welcomeImageUrl }, // Usar la imagen generada por la API
      caption: textBye,
      mentions: [m.sender, m.messageStubParameters[0]] // Menciona al usuario
    });
  }
}*/

//----------------------------------------------------------------------

/*import { WAMessageStubType } from '@whiskeysockets/baileys'; // Asegúrate de importar correctamente
import fetch from 'node-fetch'; // Para obtener imágenes de perfil

export async function before(m, { conn, groupMetadata }) {
  // Verificar si el mensaje es un evento de grupo y si es de tipo bienvenida (27) o despedida (28, 32)
  if (!m.messageStubType || !m.isGroup) return;

  // Obtener la foto de perfil del usuario
  let pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => 'https://files.catbox.moe/xegxay.jpg');
  let img = await (await fetch(pp)).buffer();

  // Obtener el nombre del usuario
  let usuario = `@${m.messageStubParameters[0].split('@')[0]}`;

  // Obtener metadatos del grupo
  let subject = groupMetadata.subject; // Nombre del grupo
  let descs = groupMetadata.desc || "*Descripción predeterminada del grupo*"; // Descripción del grupo

  // Mensaje de bienvenida personalizado
  if (m.messageStubType == 27) { // Evento de entrada al grupo
    let textWel = `
┏━━━━━❖━━━✦━━━❖━━━━━┓
┃ 💠 𝑩𝑰𝑬𝑵𝑽𝑬𝑵𝑰𝑫𝑶/𝑨 💠
┗━━━━━❖━━━✦━━━❖━━━━━┛

🌸 Hola ${usuario}~
✨ Bienvenido/a a *『${subject}』*

🫶 Aquí solo hay:
– Amistades lindas  
– Caos bonito  
– Un bot adorable... *o sea, yo~ 💁‍♀️*

💬 Escribe *#menu* si quieres ver lo que sé hacer~

📌 *Lee la descripción del grupo, ¿vale?*
> *${descs}*

🎀 Disfruta tu estancia, o te jalo las orejas 😘
`;

    await conn.sendMessage(m.chat, {
      image: img, // Envía la foto de perfil del usuario
      caption: textWel,
      mentions: [m.sender, m.messageStubParameters[0]] // Menciona al usuario
    });
  }

  // Mensaje de despedida personalizado
  else if (m.messageStubType == 32 ) { // Evento de salida del grupo
    let textBye = `
┏━━━━━❖━━━✦━━━❖━━━━━┓
┃ 💔 𝑨𝑫𝑰𝑶́𝑺... 𝒐 𝒏𝒐 💔
┗━━━━━❖━━━✦━━━❖━━━━━┛

😢 Se nos fue ${usuario}...

🕊️ Que el destino lo cuide...  
🚆 O que lo atropelle un tren, quién sabe 😇

✨ El grupo brillará menos sin ti... pero solo un poquito~
`;

    await conn.sendMessage(m.chat, {
      image: img, // Envía la foto de perfil del usuario
      caption: textBye,
      mentions: [m.sender, m.messageStubParameters[0]] // Menciona al usuario
    });
  }
  else if (m.messageStubType == 28 ) { // Evento de expulsión del grupo
    let textBan = `
┏━━━━━❖━━━✦━━━❖━━━━━┓
┃ 💅 𝑬𝑿𝑷𝑼𝑳𝑺𝑨𝑫𝑶 💥
┗━━━━━❖━━━✦━━━❖━━━━━┛

${usuario} fue *expulsado/a del grupo* 🧹

🥀 Que le vaya bonito...  
🚪 Y que no vuelva, gracias~

✨ Menos drama, más paz ☕
`;
    await conn.sendMessage(m.chat, {
      image: img, // Envía la foto de perfil del usuario
      caption: textBan,
      mentions: [m.sender, m.messageStubParameters[0]] // Menciona al usuario
    });

  }
}*/

//------------------------------------------------------------------

/*import fetch from 'node-fetch';
import fs from 'fs';

const settingsPath = './database/settings.json';
let settings = {};
if (fs.existsSync(settingsPath)) {
  settings = JSON.parse(fs.readFileSync(settingsPath));
}

export async function before(m, { conn, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return;

  const chatId = m.chat;

  // Verificar configuración `welcome`
  const groupConfig = settings.groups?.[chatId];
  const isWelcomeEnabled = groupConfig?.welcome ?? settings.global?.welcome ?? false;

  if (!isWelcomeEnabled) return;

  const userJid = m.messageStubParameters?.[0];
  if (!userJid) return;

  const usuario = `@${userJid.split('@')[0]}`;
  const pp = await conn.profilePictureUrl(userJid, 'image').catch(() => 'https://files.catbox.moe/xegxay.jpg');
  const img = await (await fetch(pp)).buffer();

  const subject = groupMetadata.subject;
  const descs = groupMetadata.desc || "*Descripción predeterminada del grupo*";

  if (m.messageStubType === 27) {
    const textWel = `
┏━━━━━❖━━━✦━━━❖━━━━━┓
┃ 💠 𝑩𝑰𝑬𝑵𝑽𝑬𝑵𝑰𝑫𝑶/𝑨 💠
┗━━━━━❖━━━✦━━━❖━━━━━┛

🌸 Hola ${usuario}~
✨ Bienvenido/a a *『${subject}』*

🫶 Aquí solo hay:
– Amistades lindas  
– Caos bonito  
– Un bot adorable... *o sea, yo~ 💁‍♀️*

💬 Escribe *#menu* si quieres ver lo que sé hacer~

📌 *Lee la descripción del grupo, ¿vale?*
> *${descs}*

🎀 Disfruta tu estancia, o te jalo las orejas 😘
`;
    await conn.sendMessage(chatId, {
      image: img,
      caption: textWel,
      mentions: [userJid]
    });

  } else if (m.messageStubType === 32) {
    const textBye = `
┏━━━━━❖━━━✦━━━❖━━━━━┓
┃ 💔 𝑨𝑫𝑰𝑶́𝑺... 𝒐 𝒏𝒐 💔
┗━━━━━❖━━━✦━━━❖━━━━━┛

😢 Se nos fue ${usuario}...

🕊️ Que el destino lo cuide...  
🚆 O que lo atropelle un tren, quién sabe 😇

✨ El grupo brillará menos sin ti... pero solo un poquito~
`;
    await conn.sendMessage(chatId, {
      image: img,
      caption: textBye,
      mentions: [userJid]
    });

  } else if (m.messageStubType === 28) {
    const textBan = `
┏━━━━━❖━━━✦━━━❖━━━━━┓
┃ 💅 𝑬𝑿𝑷𝑼𝑳𝑺𝑨𝑫𝑶 💥
┗━━━━━❖━━━✦━━━❖━━━━━┛

${usuario} fue *expulsado/a del grupo* 🧹

🥀 Que le vaya bonito...  
🚪 Y que no vuelva, gracias~

✨ Menos drama, más paz ☕
`;
    await conn.sendMessage(chatId, {
      image: img,
      caption: textBan,
      mentions: [userJid]
    });
  }
}*/

import fetch from 'node-fetch';
import fs from 'fs';

const settingsPath = './database/settings.json';
// Almacenamos los estados previos por grupo
const welcomeStatusCache = {};

export async function before(m, { conn, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return;

  const chatId = m.chat;

  // Leer configuración en tiempo real
  let settings = {};
  if (fs.existsSync(settingsPath)) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath));
    } catch (e) {
      console.error('[ERROR] No se pudo leer settings.json:', e);
      return;
    }
  }

  // Obtener estado actual de "welcome" (grupo > global > false)
  const groupConfig = settings.groups?.[chatId];
  const currentWelcome = groupConfig?.welcome ?? settings.global?.welcome ?? false;

  // Verificar cambios respecto al estado anterior
  const prevWelcome = welcomeStatusCache[chatId];
  if (prevWelcome !== currentWelcome) {
    welcomeStatusCache[chatId] = currentWelcome;
    if (currentWelcome) {
      console.log(`✅ Bienvenida activada para el grupo ${chatId}`);
    } else {
      console.log(`❌ Bienvenida desactivada para el grupo ${chatId}`);
    }
  }

  // Si está desactivado, no seguir
  if (!currentWelcome) return;

  const userJid = m.messageStubParameters?.[0];
  if (!userJid) return;

  const usuario = `@${userJid.split('@')[0]}`;
  const pp = await conn.profilePictureUrl(userJid, 'image').catch(() => 'https://files.catbox.moe/xegxay.jpg');
  const img = await (await fetch(pp)).buffer();

  const subject = groupMetadata.subject;
  const descs = groupMetadata.desc || "*Descripción predeterminada del grupo*";

  if (m.messageStubType === 27) {
    const textWel = `
┏━━━━━❖━━━✦━━━❖━━━━━┓
┃ 💠 𝑩𝑰𝑬𝑵𝑽𝑬𝑵𝑰𝑫𝑶/𝑨 💠
┗━━━━━❖━━━✦━━━❖━━━━━┛

🌸 Hola ${usuario}~
✨ Bienvenido/a a *『${subject}』*

🫶 Aquí solo hay:
– Amistades lindas  
– Caos bonito  
– Un bot adorable... *o sea, yo~ 💁‍♀️*

💬 Escribe *#menu* si quieres ver lo que sé hacer~

📌 *Lee la descripción del grupo, ¿vale?*
> *${descs}*

🎀 Disfruta tu estancia, o te jalo las orejas 😘
`;
    await conn.sendMessage(chatId, {
      image: img,
      caption: textWel,
      mentions: [userJid]
    });

  } else if (m.messageStubType === 32) {
    const textBye = `
┏━━━━━❖━━━✦━━━❖━━━━━┓
┃ 💔 𝑨𝑫𝑰𝑶́𝑺... 𝒐 𝒏𝒐 💔
┗━━━━━❖━━━✦━━━❖━━━━━┛

😢 Se nos fue ${usuario}...

🕊️ Que el destino lo cuide...  
🚆 O que lo atropelle un tren, quién sabe 😇

✨ El grupo brillará menos sin ti... pero solo un poquito~
`;
    await conn.sendMessage(chatId, {
      image: img,
      caption: textBye,
      mentions: [userJid]
    });

  } else if (m.messageStubType === 28) {
    const textBan = `
┏━━━━━❖━━━✦━━━❖━━━━━┓
┃ 💅 𝑬𝑿𝑷𝑼𝑳𝑺𝑨𝑫𝑶 💥
┗━━━━━❖━━━✦━━━❖━━━━━┛

${usuario} fue *expulsado/a del grupo* 🧹

🥀 Que le vaya bonito...  
🚪 Y que no vuelva, gracias~

✨ Menos drama, más paz ☕
`;
    await conn.sendMessage(chatId, {
      image: img,
      caption: textBan,
      mentions: [userJid]
    });
  }
}