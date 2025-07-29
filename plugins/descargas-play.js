import fetch from 'node-fetch';

const SEARCH_APIS = [
  { name: 'Servidor Masha', url: 'http://api.alyabot.xyz:3269/search_youtube?query=' },
  { name: 'Servidor Alya', url: 'http://api2.alyabot.xyz:3108/search_youtube?query=' },
  { name: 'Servidor Masachika', url: 'https://api3.alyabot.xyz/search_youtube?query=' }
];

const DOWNLOAD_APIS = [
  { name: 'Servidor Masha', url: 'http://api.alyabot.xyz:3269/download_audioV2?url=' },
  { name: 'Servidor Alya', url: 'http://api2.alyabot.xyz:3108/download_audioV2?url=' },
  { name: 'Servidor Masachika', url: 'https://api3.alyabot.xyz/download_audioV2?url=' }
];

async function tryFetchJSON(servers, query) {
  for (let server of servers) {
    try {
      const res = await fetch(server.url + encodeURIComponent(query));
      if (!res.ok) continue;
      const json = await res.json();
      if (json && Object.keys(json).length) return { json, serverName: server.name };
    } catch {
      continue;
    }
  }
  return { json: null, serverName: null };
}

let handler = async (m, { text, conn, command }) => {
  if (!text) return m.reply('🔍 Ingresa el nombre de una canción. Ej: *.play Aishite Ado*');

  try {
    const { json: searchJson, serverName: searchServer } = await tryFetchJSON(SEARCH_APIS, text);

    if (!searchJson || !searchJson.results || !searchJson.results.length) {
      return m.reply('⚠️ No se encontraron resultados.');
    }

    const video = searchJson.results[0];
    const thumb = video.thumbnails.find(t => t.width === 720)?.url || video.thumbnails[0]?.url;
    const videoTitle = video.title;
    const videoUrl = video.url;
    const duration = Math.floor(video.duration);

    const msgInfo = `
╭─⃝🌸⃝─⃝❀⃝─〔 彡 AlyaBot 彡 〕─⃝❀⃝─⃝🌸⃝─╮
│
│  (๑>◡<๑)✨ ¡Aquí tienes tu cancioncita~!
│
│━━━━━━━━━━━━━━━━━━━━━━━
│💿 𝒯тιтυℓσ: ${videoTitle} 🌸
│⏱️ Dυɾαƈισɳ: ${duration}s
│👀 νιѕтαѕ: ${video.views.toLocaleString()}
│🎤 Aυƚσɾ: ${video.channel}
│🔗 ℓιηк: ${videoUrl}
│📡 รε૨ѵε૨: ${searchServer || 'Desconocido'}-nyan~ 🐾
╰─⃝🌸⃝─〔  Enviando con amor 〕─⃝🌸⃝─╯

> Hecho con amor por ${dev}
`.trim();

    await conn.sendMessage(m.chat, { image: { url: thumb }, caption: msgInfo }, { quoted: m });

    const { json: downloadJson } = await tryFetchJSON(DOWNLOAD_APIS, videoUrl);

    if (!downloadJson || !downloadJson.file_url) {
      return m.reply('❌ No se pudo descargar el audio.');
    }

    await conn.sendMessage(m.chat, {
      audio: { url: downloadJson.file_url },
      mimetype: 'audio/mp4',
      fileName: `${downloadJson.title}.mp3`
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply('❌ Error al procesar tu solicitud.');
  }
};

handler.command = ['play', 'mp3', 'ytmp3', 'playmp3'];
handler.help = ['play <canción>'];
handler.tags = ['downloader'];

export default handler;
