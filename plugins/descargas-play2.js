import fetch from 'node-fetch';

const SERVERS = [
  { name: 'Servidor Masha', baseUrl: masha },
  { name: 'Servidor Alya', baseUrl: alya },
  { name: 'Servidor Masachika', baseUrl: masachika }
];

// Función para mezclar servidores
function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

// Intenta acceder a los servidores aleatoriamente
async function tryServers(servers, endpoint, queryParam) {
  const shuffled = shuffleArray(servers);

  for (const server of shuffled) {
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

let handler = async (m, { text, conn }) => {
  if (!text) return m.reply('🔍 Ingresa el nombre del video. Ejemplo: *.play2 Usewa Ado*');

  try {
    // Buscar video
    const { json: searchJson, server: searchServer } = await tryServers(SERVERS, '/search_youtube?query=', text);

    if (!searchJson.results?.length) return m.reply('⚠️ No se encontraron resultados para tu búsqueda.');

    const video = searchJson.results[0];
    const thumb = video.thumbnails.find(t => t.width === 720)?.url || video.thumbnails[0]?.url;
    const videoTitle = video.title;
    const videoUrl = video.url;
    const duration = Math.floor(video.duration);

    const msgInfo = `
╭─⃝🌸⃝─⃝❀⃝─〔 彡 AlyaBot 彡 〕─⃝❀⃝─⃝🌸⃝─╮
│
│  (๑>◡<๑)✨ ¡Aquí tienes tu Video~!
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
      const { json } = await tryServers(SERVERS, '/download_video?url=', videoUrl);
      downloadJson = json;
    } catch (err) {
      console.error('⚠️ Endpoint principal de descarga falló, intentando con el respaldo...');
      const { json } = await tryServers(SERVERS, '/download_videoV2?url=', videoUrl);
      downloadJson = json;
    }

    if (!downloadJson?.file_url) return m.reply('❌ No se pudo descargar el video.');

    await conn.sendMessage(m.chat, {
      video: { url: downloadJson.file_url },
      mimetype: 'video/mp4',
      fileName: `${downloadJson.title || videoTitle}.mp4`
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply('❌ Error al procesar tu solicitud.');
  }
};

handler.command = ['play2', 'mp4', 'ytmp4', 'playmp4'];
handler.help = ['play2 <video>'];
handler.tags = ['downloader'];

export default handler;