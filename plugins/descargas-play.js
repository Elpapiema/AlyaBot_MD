import fetch from 'node-fetch';

// Las URLs están codificadas en base64
const ENCRYPTED_SEARCH_API = 'aHR0cDovLzE3My4yMDguMjAwLjIyNzozMjY5L3NlYXJjaF95b3V0dWJlP3F1ZXJ5PQ==';
const ENCRYPTED_DOWNLOAD_API = 'aHR0cDovLzE3My4yMDguMjAwLjIyNzozMjY5L2Rvd25sb2FkX2F1ZGlvP3VybD0=';

// Función para desencriptar
function decryptBase64(str) {
  return Buffer.from(str, 'base64').toString();
}

let handler = async (m, { text, conn, command }) => {
  if (!text) return m.reply('🔍 Ingresa el nombre de una canción. Ej: *.play Aishite Ado*');

  try {
    const searchAPI = decryptBase64(ENCRYPTED_SEARCH_API);
    const downloadAPI = decryptBase64(ENCRYPTED_DOWNLOAD_API);

    const searchRes = await fetch(`${searchAPI}${encodeURIComponent(text)}`);
    const searchJson = await searchRes.json();

    if (!searchJson.results || !searchJson.results.length) {
      return m.reply('⚠️ No se encontraron resultados.');
    }

    const video = searchJson.results[0];
    const thumb = video.thumbnails.find(t => t.width === 720)?.url || video.thumbnails[0]?.url;
    const videoTitle = video.title;
    const videoUrl = video.url;
    const duration = Math.floor(video.duration);

    const msgInfo = `
🎵 *Título:* ${videoTitle}
📺 *Canal:* ${video.channel}
⏱️ *Duración:* ${duration}s
👀 *Vistas:* ${video.views.toLocaleString()}
🔗 *URL:* ${videoUrl}
_Enviando audio un momento soy lenta (˶˃ ᵕ ˂˶)..._
`.trim();

    await conn.sendMessage(m.chat, { image: { url: thumb }, caption: msgInfo }, { quoted: m });

    const downloadRes = await fetch(`${downloadAPI}${encodeURIComponent(videoUrl)}`);
    const downloadJson = await downloadRes.json();

    if (!downloadJson.file_url) return m.reply('❌ No se pudo descargar el audio.');

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

handler.command = ['play','mp3','ytmp3','playmp3'];
handler.help = ['play <canción>'];
handler.tags = ['downloader'];

export default handler;
