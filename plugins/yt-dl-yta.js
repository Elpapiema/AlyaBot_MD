import fetch from 'node-fetch';

const handler = async (m, { conn, text, command }) => {
    if (!text) {
        return conn.reply(m.chat, '❌ Por favor proporciona un enlace válido de YouTube.', m);
    }

    try {
        // API para obtener datos del audio
        const apiUrl = `https://restapi.apibotwa.biz.id/api/ytmp3?url=${encodeURIComponent(text)}`;
        const response = await fetch(apiUrl);
        const result = await response.json();

        // Validaciones de respuesta de la API
        if (!result || result.status !== 200 || !result.result || !result.result.download) {
            return conn.reply(m.chat, '❌ No se pudo descargar el audio. Verifica el enlace e intenta nuevamente.', m);
        }

        const { metadata, download } = result.result;
        const { title, thumbnail } = metadata;
        const { url: audioUrl, quality } = download;

        // Mensaje de confirmación con detalles del audio descargado
        const caption = `
✅ *Audio descargado correctamente:*
*🎵 Título:* ${title}
*🎚️ Calidad:* ${quality}
`;

        // Enviar el audio al usuario
        await conn.sendMessage(
            m.chat,
            {
                audio: { url: audioUrl },
                mimetype: 'audio/mp4',
                ptt: false, // Cambia a `true` si deseas enviar como nota de voz
                jpegThumbnail: await (await fetch(thumbnail)).buffer(), // Miniatura del video
            },
            { quoted: m }
        );

        // Enviar mensaje de confirmación
        await conn.reply(m.chat, caption, m);
    } catch (error) {
        console.error(error);
        conn.reply(m.chat, '❌ Ocurrió un error al intentar descargar el audio.', m);
    }
};

// Comandos aceptados
handler.command = /^(ytmp3|yta)$/i;

export default handler;