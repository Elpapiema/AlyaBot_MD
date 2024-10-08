let handler = async (m, { conn }) => {
    try {
        // Referencia del video que se enviará como GIF
        const videoReference = 'gataVidMenu'; // Referencia a usar para obtener el video

        // Texto del mensaje del menú
        const menuMessage = 'Bienvenido al menú principal. Presiona el botón "Más opciones" para ver todas las opciones disponibles.';

        // Enviar el video como GIF usando la referencia
        await conn.sendFile(m.chat, videoReference, 'menu.mp4', menuMessage, m, {
            asGif: true, // Interpretar el video como GIF
        });

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