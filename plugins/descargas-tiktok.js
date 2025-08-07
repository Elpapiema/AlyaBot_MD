import fetch from 'node-fetch';

let handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) {
    throw `Ups Parece que olvidaste darme el elnace de tiktok \n \n Ejemplo:  de uso ${usedPrefix}${command} https://www.tiktok.com/@usuario/video/1234567890`;
  }

  const servers = [
    { name: 'Server Masha', url: masha },
    { name: 'Server Alya', url: alya },
    { name: 'Server Masachika', url: masachika }
  ];

  // Reordenar aleatoriamente los servidores
  const shuffledServers = servers.sort(() => Math.random() - 0.5);
  let success = false;
  let lastError = '';

  for (let server of shuffledServers) {
    const endpoint = `${server.url}/Tiktok_videodl?url=${encodeURIComponent(args[0])}`;
    try {
      //await conn.sendMessage(m.chat, { text: `📡 Usando *${server.name}*...\n⏳ Procesando tu video...` }, { quoted: m });

      const res = await fetch(endpoint);
      if (!res.ok) throw `⚠️ Respuesta inválida del servidor (${res.status})`;

      const json = await res.json();
      if (!json.video_url) throw `⚠️ El servidor no devolvió un video válido`;

      await conn.sendFile(m.chat, json.video_url, 'tiktok.mp4', `✅ *Descarga exitosa*\n🎬 Aquí tienes tu video de TikTok\n\n💫 Procesado por: *${server.name}*`, m);
      success = true;
      break; // Éxito, salimos del ciclo
    } catch (err) {
      lastError = `❌ Falló ${server.name}: ${err}`;
      console.log(lastError);
    }
  }

  if (!success) {
    throw `🚫 No se pudo descargar el video desde ninguno de los servidores disponibles.\n\n${lastError}`;
  }
};

handler.help = ['tt <url>', 'tiktok <url>'];
handler.tags = ['downloader'];
handler.command = /^tt|tiktok$/i;

export default handler;