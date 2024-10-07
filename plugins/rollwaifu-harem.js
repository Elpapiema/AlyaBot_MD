import { promises as fs } from 'fs';

// Ruta del archivo harem.json
const haremFilePath = './harem.json';

// Función para cargar el archivo harem.json
async function loadHarem() {
    try {
        const data = await fs.readFile(haremFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error('No se pudo cargar el archivo harem.json.');
    }
}

// Definición del handler del comando 'harem'
let handler = async (m, { conn }) => {
    try {
        const harem = await loadHarem();
        
        // Verificar si hay personajes en el harem
        if (harem.length === 0) {
            await conn.reply(m.chat, 'No tienes personajes reclamados en tu harem.', m);
            return;
        }

        // Crear mensaje con la lista de personajes
        let message = '✨ *Personajes en tu Harem:*\n';
        harem.forEach((character, index) => {
            message += `${index + 1}. ${character.name}\n`;
        });

        // Enviar el mensaje con la lista de personajes y la imagen personalizada
        await conn.sendFile(m.chat, 'https://qu.ax/uXxWp.jpg', 'harem.jpg', message, m);
    } catch (error) {
        await conn.reply(m.chat, `Error al cargar el harem: ${error.message}`, m);
    }
};

// Configuración del comando
handler.help = ['harem'];
handler.tags = ['anime'];
handler.command = /^(harem)$/i; // Comando "harem"

export default handler;
