let handler = async (m, { conn }) => {
    try {
        // URLs de los videos que se enviarán
        const videoUrls = [
            'https://qu.ax/WgJR.mp4', // Primer video
            'https://qu.ax/kOwY.mp4', // Segundo video
            'https://qu.ax/UYGf.mp4'  // Tercer video
        ];

        // Seleccionar un video aleatoriamente
        const randomVideoUrl = videoUrls[Math.floor(Math.random() * videoUrls.length)];

        // Texto del mensaje del menú
        const menuMessage = 'Bienvenido al menú principal. Presiona el botón "Más opciones" para ver todas las opciones disponibles.';

        // Enviar el video aleatorio como archivo de video normal
        await conn.sendFile(m.chat, randomVideoUrl, 'menu.mp4', menuMessage, m);

        // Configuración del botón
        const buttonMessage = {
            caption: 'Selecciona una opción:',
            footer: 'Menú de Opciones',
            buttons: [
                {
                    buttonId: '.allmenu', // Comando que se ejecutará cuando se presione el botón
                    buttonText: { displayText: 'Más opciones' }, // Texto del botón
                    type: 1
                }
            ],
            headerType: 5 // Indica que el mensaje tiene un GIF o video
        };

        // Enviar el mensaje con el botón
        await conn.sendMessage(m.chat, buttonMessage, { quoted: m });

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