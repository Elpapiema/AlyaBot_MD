import fetch from 'node-fetch';
import fs from 'fs';

const SERVERS = [
  { name: 'Servidor Masha', baseUrl: masha},
  { name: 'Servidor Alya', baseUrl: alya },
  { name: 'Servidor Masachika', baseUrl: masachika }
]

// espero que esta madre jale 
function getRandomServer() {
  return SERVERS[Math.floor(Math.random() * SERVERS.length)];
}

function buildCanvasUrl({ profile, text, group }) {
  const server = getRandomServer();

  const params = new URLSearchParams({
    background: 'https://files.catbox.moe/fktr0p.png',
    profile,
    text,
    group,
    font: '4.ttf',
    font2: '3.ttf',
    glitch: 'off'
  });

  return `${server.baseUrl}/canvas?${params.toString()}`;
}

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
  const textWel = settings.groups?.[chatId]?.msgWelcome ?? settings.global?.msgWelcome;
  const textBye = settings.groups?.[chatId]?.msgBye ?? settings.global?.msgBye;
  const textBan = settings.groups?.[chatId]?.msgBan ?? settings.global?.msgBan;

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
  const profileUrl = await conn.profilePictureUrl(userJid, 'image')
  .catch(() => 'https://files.catbox.moe/l723pi.jpg');
  //const pp = await conn.profilePictureUrl(userJid, 'image').catch(() => 'https://files.catbox.moe/xegxay.jpg');
  //const img = await (await fetch(profileUrl)).buffer();

  const subject = groupMetadata.subject;
  const descs = groupMetadata.desc || "Ups parece que este grupo no tiene descripción";

  // Welcome 

  if (m.messageStubType === 27) {
  const msgWelc = textWel
    .replace(/@user/g, usuario)
    .replace(/@group/g, subject)
    .replace(/@desc/g, descs);

  const canvasUrl = buildCanvasUrl({
    profile: profileUrl,
    text: 'Welcome to',
    group: subject
  });

  await conn.sendMessage(chatId, {
    image: { url: canvasUrl },
    caption: msgWelc,
    mentions: [userJid]
  });

  // Despedida
  
} else if (m.messageStubType === 32) {
  const msgBye = textBye
    .replace(/@user/g, usuario)
    .replace(/@group/g, subject);

  const canvasUrl = buildCanvasUrl({
    profile: profileUrl,
    text: 'Goodbye',
    group: subject
  });

  await conn.sendMessage(chatId, {
    image: { url: canvasUrl },
    caption: msgBye,
    mentions: [userJid]
  });
}

  // Ban/Expulsion
  else if (m.messageStubType === 28) {
  const msgBan = textBan
    .replace(/@user/g, usuario)
    .replace(/@group/g, subject);

  const canvasUrl = buildCanvasUrl({
    profile: profileUrl,
    text: 'Banned',
    group: subject
  });

  await conn.sendMessage(chatId, {
    image: { url: canvasUrl },
    caption: msgBan,
    mentions: [userJid]
  });
}
}