import { promises as fs } from 'fs';

// Ruta del archivo harem.json
const haremFilePath = './database/harem.json';

// Función para cargar el archivo harem.json
async function loadHarem() {
    try {
        const data = await fs.readFile(haremFilePath, 'utf-8');
        return JSON.parse(data); // Retornar el objeto completo
    } catch (error) {
        throw new Error('No se pudo cargar el archivo harem.json.');
    }
}

// Definición del handler del comando 'harem'
let handler = async (m, { conn }) => {
    try {
        const harem = await loadHarem();
        
        // Obtener el ID del usuario que ejecuta el comando
        const userId = m.sender; // m.sender contiene el ID del usuario

        // Verificar si el usuario tiene personajes en su harem
        const userHarem = harem[userId];
        if (!userHarem || userHarem.length === 0) {
            await conn.reply(m.chat, 'No tienes personajes reclamados en tu harem.', m);
            return;
        }

        // Crear mensaje con la lista de personajes y los nuevos datos
        let message = '✨ *Personajes en tu Harem:*\n';
        userHarem.forEach((character, index) => {
            message += `${index + 1}. ${character.name}\n`;
            message += `   Situación Sentimental: ${character.relationship}\n`;
            message += `   Origen: ${character.source}\n \n`;
        });

        // Enviar el mensaje con la lista de personajes y la imagen personalizada
        await conn.sendFile(m.chat, 'https://files.catbox.moe/bnjw8e.jpg', 'harem.jpg', message, m);
    } catch (error) {
        await conn.reply(m.chat, `Error al cargar el harem: ${error.message}`, m);
    }
};

// Configuración del comando
handler.help = ['harem'];
handler.tags = ['anime'];
handler.command = /^(harem)$/i; // Comando "harem"

export default handler;