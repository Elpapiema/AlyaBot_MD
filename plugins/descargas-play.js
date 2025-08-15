import fetch from 'node-fetch';

const SERVERS = [
  { name: 'Servidor Masha', baseUrl: masha },
  { name: 'Servidor Alya', baseUrl: alya },
  { name: 'Servidor Masachika', baseUrl: masachika }
];

// Función para desordenar (shuffle) los servidores
function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

// Intenta acceder a los servidores de forma aleatoria
async function tryServers(servers, endpoint, queryParam) {
  const shuffledServers = shuffleArray(servers);

  for (const server of shuffledServers) {
    try {
      const url = `${server.baseUrl}${endpoint}${encodeURIComponent(queryParam)}`;
      const res = await fetch(url);

      if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

      const json = await res.json();
      if (!json || Object.keys(json).length === 0) throw new Error('Respuesta vacía');

      return { json, server: server.name };
    } catch (err) {
      console.error(`❌ ${server.name} falló:`, err.message || err);
      continue;
    }
  }

  throw '❌ Todos los servidores fallaron. Intenta más tarde.';
}

let handler = async (m, { text, conn, command }) => {
  if (!text) return m.reply('🔍 Ingresa el nombre de una canción. Ej: *.play Aishite Ado*');

  try {
    // Buscar video
    const { json: searchJson, server: searchServer } = await tryServers(SERVERS, '/search_youtube?query=', text);

    if (!searchJson.results?.length) return m.reply('⚠️ No se encontraron resultados.');

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
│📡 รε૨ѵε૨: ${searchServer}-nyan~ 🐾
╰─⃝🌸⃝─〔  Enviando con amor 〕─⃝🌸⃝─╯
`.trim();

    await conn.sendMessage(m.chat, { image: { url: thumb }, caption: msgInfo }, { quoted: m });

    // Intentar descarga con endpoint principal
    let downloadJson;
    try {
      const { json } = await tryServers(SERVERS, '/download_audio?url=', videoUrl);
      downloadJson = json;
    } catch (err) {
      console.error('⚠️ Endpoint principal de descarga falló, intentando con el respaldo...');
      const { json } = await tryServers(SERVERS, '/download_audioV2?url=', videoUrl);
      downloadJson = json;
    }

    if (!downloadJson?.file_url) return m.reply('❌ No se pudo descargar el audio.');

    await conn.sendMessage(m.chat, {
      audio: { url: downloadJson.file_url },
      mimetype: 'audio/mpeg',
      fileName: `${downloadJson.title || videoTitle}.mp3`
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