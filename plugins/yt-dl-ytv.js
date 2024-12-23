import fetch from 'node-fetch';

const handler = async (m, { conn, text, command }) => {
    if (!text) {
        return conn.reply(m.chat, '❌ Por favor proporciona un enlace válido de YouTube.', m);
    }

    try {
        const apiUrl = `https://exonity.tech/api/ytdlp2-faster?apikey=adminsepuh&url=${encodeURIComponent(text)}`;
        const response = await fetch(apiUrl);
        const result = await response.json();

        if (result.status !== 200 || !result.result || !result.result.video) {
            return conn.reply(m.chat, '❌ No se pudo descargar el video. Verifica el enlace e intenta nuevamente.', m);
        }

        // Obtener datos del video
        const { title, thumb, duration, description, video } = result.result;

        const caption = `
🎥 *Descarga completada:*
*🔤 Título:* ${title}
*🕒 Duración:* ${duration}
`;

        // Enviar el video al usuario
        await conn.sendMessage(
            m.chat,
            {
                video: { url: video },
                caption,
                jpegThumbnail: await (await fetch(thumb)).buffer(), // Thumbnail del video
            },
            { quoted: m }
        );
    } catch (error) {
        console.error(error);
        conn.reply(m.chat, '❌ Ocurrió un error al intentar descargar el video.', m);
    }
};

handler.command = /^(yt|ytv|ytmp4)$/i;

export default handler;