import fetch from 'node-fetch';

let handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`🔎 Usa el comando así:\n${usedPrefix + command} <nombre del personaje>`);
  }

  const personajeBuscado = args.join(' ').toLowerCase();
  const url = 'https://raw.githubusercontent.com/Elpapiema/Adiciones-para-AlyaBot-RaphtaliaBot-/main/image_json/characters.json';

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error al obtener datos. Código: ${res.status}`);
    const data = await res.json();

    const personaje = data.find(p => p.name.toLowerCase().includes(personajeBuscado));

    if (!personaje) {
      return m.reply(`❌ No se encontró ningún personaje que coincida con: *${args.join(' ')}*`);
    }

    let info = `✨ *Información del Personaje*\n\n`;
    info += `📛 *Nombre:* ${personaje.name}\n`;
    if (personaje.age) info += `🎂 *Edad:* ${personaje.age}\n`;
    if (personaje.source) info += `📺 *Origen:* ${personaje.source}\n`;
    if (personaje.relationship) info += `💞 *Relación:* ${personaje.relationship}\n`;

    await conn.sendFile(m.chat, personaje.img, 'personaje.jpg', info, m);
  } catch (e) {
    console.error(e);
    m.reply(`⚠️ Hubo un error al buscar el personaje. Intenta más tarde.`);
  }
};

handler.help = ['winfo <nombre>'];
handler.tags = ['anime', 'info'];
handler.command = ['winfo'];

export default handler;
