import fetch from 'node-fetch';
import fs from 'fs';
import { tmpdir } from 'os';
import path from 'path';

const handler = async (m, { text, conn, command }) => {
  if (!text) {
    return conn.reply(m.chat, 'Por favor, proporciona un enlace de Spotify.', m);
  }

  const urlRegex = /^(https?:\/\/)?(www\.)?(open\.)?spotify\.com\/.+$/i;
  if (!urlRegex.test(text)) {
    return conn.reply(m.chat, 'El enlace proporcionado no es válido. Asegúrate de que sea un enlace de Spotify.', m);
  }

  try {
    const apiUrl = `https://restapi.apibotwa.biz.id/api/spotify?url=${encodeURIComponent(text)}`;
    const response = await fetch(apiUrl);
    const json = await response.json();

    if (json.status === 200 && json.data?.response) {
      const downloadUrl = json.data.response;
      const filePath = path.join(tmpdir(), `${Date.now()}.mp3`);

      // Descargar el archivo de audio
      const audioResponse = await fetch(downloadUrl);
      const fileStream = fs.createWriteStream(filePath);
      await new Promise((resolve, reject) => {
        audioResponse.body.pipe(fileStream);
        audioResponse.body.on('error', reject);
        fileStream.on('finish', resolve);
      });

      // Enviar el archivo de audio
      await conn.sendMessage(m.chat, { audio: fs.readFileSync(filePath), mimetype: 'audio/mp4' }, { quoted: m });

      // Eliminar el archivo temporal
      fs.unlinkSync(filePath);
    } else {
      conn.reply(m.chat, '❌ Hubo un problema al obtener el enlace de descarga. Intenta de nuevo más tarde.', m);
    }
  } catch (error) {
    console.error(error);
    conn.reply(m.chat, '❌ Ocurrió un error al procesar tu solicitud. Intenta nuevamente.', m);
  }
};

handler.command = ['sp', 'spotify'];

export default handler;