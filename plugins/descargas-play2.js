import fetch from 'node-fetch';

const SEARCH_APIS = [
  { name: 'Servidor Masha', url: 'http://api.alyabot.xyz:3269/search_youtube?query=' },
  { name: 'Servidor Alya', url: 'http://api2.alyabot.xyz:5216/search_youtube?query=' },
  { name: 'Servidor Masachika', url: 'https://api3.alyabot.xyz/search_youtube?query=' }
];

const DOWNLOAD_APIS = [
  { name: 'Servidor Masha', url: 'http://api.alyabot.xyz:3269/download_video?url=' },
  { name: 'Servidor Alya', url: 'http://api2.alyabot.xyz:5216/download_video?url=' },
  { name: 'Servidor Masachika', url: 'https://api3.alyabot.xyz/download_video?url=' }
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
  if (!text) return m.reply('🔍 Ingresa el nombre del video. Ejemplo: *.play2 Usewa Ado*');

  try {
    const { json: searchJson, serverName: searchServer } = await tryFetchJSON(SEARCH_APIS, text);

    if (!searchJson || !searchJson.results || !searchJson.results.length) {
      return m.reply('⚠️ No se encontraron resultados para tu búsqueda.');
    }

    const video = searchJson.results[0];
    const thumb = video.thumbnails.find(t => t.width === 720)?.url || video.thumbnails[0]?.url;
    const videoTitle = video.title;
    const videoUrl = video.url;
    const duration = Math.floor(video.duration);

    const msgInfo = `
╭─ׅ─ׅ┈ ─๋︩︪─☪︎︎︎̸⃘̸࣭ٜ࣪࣪࣪۬◌⃘۪֟፝֯۫۫︎⃪𐇽۫۬🎧⃘⃪۪֟፝֯۫۫۫۬◌⃘࣭ٜ࣪࣪࣪۬☪︎︎︎︎̸─ׅ─ׅ┈ ─๋︩︪─╮    
│  〔彡🄰ʟɪsᴀ  彡 ʙ ᴏ ᴛ〕
│˚̩̩̥͙°̩̥〔 𝘿 𝙚 𝙨 𝙘 𝙖 𝙧 𝙜 𝙖 𝙨 𝙋𝙡𝙖𝙮 〕°̩̥˚̩̩̥͙°̩̥ ·͙*̩̩͙
┃
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• 🎼 𝑻𝒊𝒕𝒖𝒍𝒐: ${videoTitle}
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• ⏱️ 𝑫𝒖𝒓𝒂𝒄𝒊𝒐́𝒏: ${duration}s
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• 👁️ 𝑽𝒊𝒔𝒕𝒂𝒔: ${video.views.toLocaleString()}
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• 👤 𝑨𝒖𝒕𝒐𝒓: ${video.channel}
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• 🔗 𝑳𝒊𝒏𝒌 : ${videoUrl}
├̟̇˚₊·͟͟͟͟͟͟͞͞͞͞͞͞➳₊• 💠 𝑺𝒆𝒓𝒗𝒆𝒓: ${searchServer || 'Desconocido'}
│
╰─〔𝙀𝙣𝙫𝙞𝙖𝙣𝙙𝙤▰▰▱▱〕
`.trim();

    await conn.sendMessage(m.chat, { image: { url: thumb }, caption: msgInfo }, { quoted: m });

    const { json: downloadJson } = await tryFetchJSON(DOWNLOAD_APIS, videoUrl);

    if (!downloadJson || !downloadJson.download_url) return m.reply('❌ No se pudo descargar el video.');

    await conn.sendMessage(m.chat, {
      video: { url: downloadJson.download_url },
      mimetype: 'video/mp4',
      fileName: `video.mp4`
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
