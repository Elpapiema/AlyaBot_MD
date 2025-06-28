import fs from 'fs';
import path from 'path';

const ecoPath = './database/eco_config.json';
const dbPath = './database/db_users.json';
const personalizePath = './database/personalize.json';

const textoAEmoji = {
  piedra: '🪨',
  papel: '📄',
  tijera: '✂️'
};

const emojiATexto = {
  '🪨': 'piedra',
  '📄': 'papel',
  '✂️': 'tijera'
};

const esJugadaValida = (txt) => {
  txt = txt.toLowerCase();
  return ['piedra', 'papel', 'tijera', '🪨', '📄', '✂️'].includes(txt);
};

const normalizarJugada = (txt) => {
  txt = txt.toLowerCase();
  return emojiATexto[txt] || txt;
};

let handler = async (m, { conn, args }) => {
  if (!m.isGroup) return m.reply('Este comando solo puede usarse en grupos.');
  const mentioned = m.mentionedJid?.[0];
  if (!mentioned) return m.reply('Menciona a un usuario para jugar piedra, papel o tijeras.');

  const gameId = `${m.chat}-${mentioned}`;
  global.pptGames = global.pptGames || {};
  if (global.pptGames[gameId]) return m.reply('Ya hay un juego en curso con este usuario.');

  if (!fs.existsSync(ecoPath)) {
    fs.writeFileSync(ecoPath, JSON.stringify({
      ppt: { reward: 100, penalty: 50 }
    }, null, 2));
  }

  const ecoConfig = JSON.parse(fs.readFileSync(ecoPath));
  const reward = ecoConfig.ppt.reward;
  const penalty = ecoConfig.ppt.penalty;

  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));
  const db = JSON.parse(fs.readFileSync(dbPath));

  // Leer configuración de personalización
  let currency = 'yenes';
  try {
    const personalize = JSON.parse(fs.readFileSync(personalizePath));
    currency = personalize.global.currency || personalize.default.currency || 'yenes';
  } catch (e) {
    console.warn('Error leyendo personalize.json, usando moneda por defecto');
  }

  global.pptGames[gameId] = {
    player1: m.sender,
    player2: mentioned,
    group: m.chat,
    status: 'waiting',
    choices: {},
    reward,
    penalty,
    currency
  };

  await conn.sendMessage(m.sender, { text: 'Responde con \n `ppt piedra`, \n `ppt papel` o \n `ppt tijera`. \n También puedes usar 🪨 📄 ✂️' });
  await conn.sendMessage(mentioned, { text: 'Te han retado a Piedra Papel o Tijera. Responde con \n `ppt piedra`, \n `ppt papel` o \n `ppt tijera`. \n También puedes usar 🪨 📄 ✂️' });

  setTimeout(() => {
    if (global.pptGames[gameId]?.status === 'waiting') {
      delete global.pptGames[gameId];
      conn.sendMessage(m.chat, { text: '⏱️ Juego cancelado por inactividad.' });
    }
  }, 2 * 60 * 1000);
};

handler.before = async (m, { conn }) => {
  if (!m.text?.toLowerCase().startsWith('ppt')) return;
  if (!global.pptGames) return;

  const input = m.text.slice(4).trim().toLowerCase();
  if (!esJugadaValida(input)) return;

  const gameId = Object.keys(global.pptGames).find(id => {
    const g = global.pptGames[id];
    return g.status === 'waiting' && (m.sender === g.player1 || m.sender === g.player2);
  });
  if (!gameId) return;

  const game = global.pptGames[gameId];
  if (game.choices[m.sender]) return conn.reply(m.chat, 'Ya has enviado tu jugada.', m);

  const jugada = normalizarJugada(input);
  game.choices[m.sender] = jugada;

  await conn.reply(m.chat, `✅ Jugada recibida como *${jugada.toUpperCase()}* ${textoAEmoji[jugada] || ''}`, m);

  if (Object.keys(game.choices).length < 2) return;

  game.status = 'done';
  const { player1, player2, group, reward, penalty, currency } = game;
  const c1 = game.choices[player1];
  const c2 = game.choices[player2];

  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));
  const db = JSON.parse(fs.readFileSync(dbPath));

  let result;
  if (c1 === c2) {
    result = '🤝 ¡Empate!';
  } else if (
    (c1 === 'piedra' && c2 === 'tijera') ||
    (c1 === 'papel' && c2 === 'piedra') ||
    (c1 === 'tijera' && c2 === 'papel')
  ) {
    result = `🎉 ¡${await conn.getName(player1)} gana! +${reward} ${currency} \n ${await conn.getName(player2)} pierde -${penalty} ${currency}`;
    db[player1] = db[player1] || { money: 0, bank: 0 };
    db[player1].money += reward;
    db[player2] = db[player2] || { money: 0, bank: 0 };
    db[player2].money = Math.max(0, db[player2].money - penalty);
  } else {
    result = `🎉 ¡${await conn.getName(player2)} gana! +${reward} ${currency} \n ${await conn.getName(player1)} pierde -${penalty} ${currency}`;
    db[player2] = db[player2] || { money: 0, bank: 0 };
    db[player2].money += reward;
    db[player1] = db[player1] || { money: 0, bank: 0 };
    db[player1].money = Math.max(0, db[player1].money - penalty);
  }

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  await conn.sendMessage(group, {
    text: `🎮 *Resultados del juego:*\n\n👤 ${(await conn.getName(player1))}: ${textoAEmoji[c1]} (${c1})\n👤 ${(await conn.getName(player2))}: ${textoAEmoji[c2]} (${c2})\n\n${result}`,
    mentions: [player1, player2]
  });

  delete global.pptGames[gameId];
};

handler.command = /^ppt$/i;
handler.tags = ['game'];
handler.help = ['ppt @usuario'];
handler.group = true;

export default handler;