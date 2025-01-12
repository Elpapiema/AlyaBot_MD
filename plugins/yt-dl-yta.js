import fetch from 'node-fetch';

const handler = async (m, { conn, text, command }) => {
    if (!text) {
        return conn.reply(m.chat, '❌ Por favor proporciona un enlace válido de YouTube.', m);
    }

    try {
        const apiUrl = `https://api.siputzx.my.id/api/dl/youtube/mp3?url=${encodeURIComponent(text)}`;
        const response = await fetch(apiUrl);
        const result = await response.json();

        if (!result || !result.status || !result.data) {
            return conn.reply(m.chat, '❌ No se pudo descargar el audio. Verifica el enlace e intenta nuevamente.', m);
        }

        const audioUrl = result.data;

        const caption = `✅ *Audio descargado correctamente*`;

        // Enviar el audio al usuario
        await conn.sendMessage(m.chat, {
            audio: { url: audioUrl },
            mimetype: 'audio/mp4',
            caption,
        }, { quoted: m });
    } catch (error) {
        console.error(error);
        conn.reply(m.chat, '❌ Ocurrió un error al intentar descargar el audio.', m);
    }
};

// Comandos aceptados
handler.command = /^(ytmp3|yta)$/i;

export default handler;