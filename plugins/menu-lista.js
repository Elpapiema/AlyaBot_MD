let handler = async (m, { conn }) => {
    try {
        // URLs de los videos que se enviarán
        const videoUrls = [
            'https://files.catbox.moe/b5n81s.mp4', // Primer video
            'https://files.catbox.moe/o9vzpe.mp4', // Segundo video
            'https://qu.ax/ocrFx.mp4'  // Tercer video
        ];

        // Seleccionar un video aleatoriamente
        const randomVideoUrl = videoUrls[Math.floor(Math.random() * videoUrls.length)];

        // Texto del mensaje del menú
        const menuMessage = `
┎┈┈┈┈┈┈┈┈┈୨ Ｉｎｆｏ ୧┈┈┈┈┈┈┈┈┒
┊
┊
┊   ✦ Desarrollado por: 𝓔𝓶𝓶𝓪 (𝓥𝓲𝓸𝓵𝓮𝓽'𝓼 𝓥𝓮𝓻𝓼𝓲𝓸𝓷)
┊   
┊   ✦ Versión actual: 1.2.3
┊
┊
┖┈┈┈┈┈┈┈┈┈┈┈┈୨♡୧┈┈┈┈┈┈┈┈┈┈┈┈┚`;

        // Enviar el video aleatorio interpretado como GIF con reproducción automática
        await conn.sendMessage(m.chat, 
            { 
                video: { url: randomVideoUrl }, 
                gifPlayback: true,  // Reproducción automática de GIF
                caption: menuMessage,  // El mensaje del menú
                mentions: [m.sender]  // Mencionar al remitente del mensaje
            }
        );

    } catch (error) {
        await conn.reply(m.chat, `Error al cargar el menú: ${error.message}`, m);
    }
};

// Configuración del comando
handler.help = ['menu'];
handler.tags = ['info'];
handler.command = /^(menu)$/i; // Comando aceptado: "menu"

// Exportar el handler
export default handler;