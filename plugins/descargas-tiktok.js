import fetch from 'node-fetch';

const handler = async (m, { conn, text, command }) => {
    if (!text) {
        return conn.reply(m.chat, '❌ Por favor proporciona un enlace válido de TikTok.', m);
    }

    try {
        const apiUrl = `https://deliriussapi-oficial.vercel.app/download/tiktok?url=${encodeURIComponent(text)}`;
        const response = await fetch(apiUrl);
        const result = await response.json();

        if (!result || !result.status || !result.data || !result.data.meta || !result.data.meta.media) {
            return conn.reply(m.chat, '❌ No se pudo descargar el video. Verifica el enlace e intenta nuevamente.', m);
        }

        // Obtener el video sin marca de agua (org)
        const media = result.data.meta.media.find((item) => item.type === 'video' && item.org);
        if (!media || !media.org) {
            return conn.reply(m.chat, '❌ No se encontró un video válido sin marca de agua.', m);
        }

        const videoUrl = media.org;

        // Obtener información adicional
        const author = result.data.author?.nickname || 'Desconocido';
        const likes = result.data.like || '0';
        const shares = result.data.share || '0';
        const comments = result.data.comment || '0';

        const caption = `
✅ *Video descargado correctamente:*

👤 Autor: ${author}
👍 Me gusta: ${likes}
🔄 Compartidos: ${shares}
💬 Comentarios: ${comments}
`;

        // Enviar el video al usuario
        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption,
        }, { quoted: m });
    } catch (error) {
        console.error(error);
        conn.reply(m.chat, '❌ Ocurrió un error al intentar descargar el video.', m);
    }
};

handler.command = /^(tt|tiktok)$/i;

export default handler;