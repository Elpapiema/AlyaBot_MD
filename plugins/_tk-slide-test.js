import fetch from 'node-fetch';

let handler = async (m, { conn, args, command }) => {
  if (!args[0]) throw '⚠️ Proporciona la URL de un video de TikTok.\n\nEjemplo:\n.ttsl https://vt.tiktok.com/ZSBy3kxKw/';

  const url = args[0];

  // Servidores con nombre y base URL
  const servers = [
    { name: 'Servidor Masha', baseUrl: alya1 },
    { name: 'Servidor Alya', baseUrl: alya2 },
    { name: 'Servidor Masachika', baseUrl: alya3 },
  ];

  // Función para intentar obtener slides de forma recursiva por servidores
  async function tryServers(serversList) {
    if (serversList.length === 0) throw '❌ Todos los servidores fallaron. Intenta más tarde.';

    const [currentServer, ...rest] = serversList;

    try {
      await m.reply(`🔄 Intentando obtener slides desde ${currentServer.name}, por favor espera...`);

      const apiUrl = `${currentServer.baseUrl}/Tiktok_slidesdl?url=${encodeURIComponent(url)}`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      const json = await res.json();

      if (!json.slides || !Array.isArray(json.slides) || json.slides.length === 0) {
        throw new Error('No se encontraron slides en la respuesta');
      }

      // Éxito: retornar datos y servidor usado
      return { json, server: currentServer };
    } catch (e) {
      console.error(`Error en ${currentServer.name}:`, e.message || e);
      // Intentar con siguiente servidor
      return tryServers(rest);
    }
  }

  try {
    const { json, server } = await tryServers(shuffleArray(servers));

    // Enviar primer slide con mensaje que incluye el nombre del servidor
    await conn.sendMessage(m.chat, {
      image: { url: json.slides[0] },
      caption: `✅ Imágenes extraídas exitosamente desde ${server.name}.\nTotal: ${json.slides.length}\n Procesado por: ${server.name}`,
    }, { quoted: m });

    // Enviar los demás slides
    for (let i = 1; i < json.slides.length; i++) {
      await conn.sendFile(m.chat, json.slides[i], `slide${i}.jpg`, '', m);
    }

  } catch (e) {
    console.error(e);
    throw e.toString();
  }
};

// Función para barajar un array (Fisher-Yates)
function shuffleArray(array) {
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

handler.help = ['ttsl <url>', 'ttph <url>'];
handler.tags = ['descargas'];
handler.command = ['ttp', 'ttsl', 'ttph'];

export default handler;
