import { promises as fs } from 'fs';

// Ruta del archivo harem.json (en la raíz del repositorio)
const haremFilePath = './harem.json';

// Función para cargar o crear el archivo harem.json
async function loadHarem() {
    try {
        const data = await fs.readFile(haremFilePath);
        return JSON.parse(data);
    } catch (error) {
        // Si no existe el archivo, lo crea
        if (error.code === 'ENOENT') {
            await fs.writeFile(haremFilePath, JSON.stringify([]));
            return [];
        } else {
            throw new Error('No se pudo cargar el archivo harem.json.');
        }
    }
}

// Función para guardar los datos en harem.json
async function saveHarem(harem) {
    await fs.writeFile(haremFilePath, JSON.stringify(harem, null, 2));
}

// Handler para el comando 'c' o 'reclamar'
let handler = async (m, { conn }) => {
    try {
        // Verificar si se está respondiendo a un mensaje que tiene un personaje
        const reply = m.quoted;
        if (!reply || !global.lastCharacter || !global.lastCharacter[reply.key.id]) {
            throw new Error('No se ha detectado un personaje válido para reclamar.');
        }

        const character = global.lastCharacter[reply.key.id];

        // Verificar si el personaje ya ha sido reclamado
        if (character.owner) {
            throw new Error('Este personaje ya ha sido reclamado por otro usuario.');
        }

        // Cargar el archivo harem.json
        let harem = await loadHarem();

        // Agregar el personaje al harem del usuario que lo reclama
        character.owner = m.sender;
        harem.push(character);

        // Guardar el harem actualizado
        await saveHarem(harem);

        await conn.reply(m.chat, `¡Has reclamado a *${character.name}*!`, m);
    } catch (error) {
        await conn.reply(m.chat, `Error: ${error.message}`, m);
    }
};

// Configuración del comando
handler.help = ['c', 'reclamar'];
handler.tags = ['anime'];
handler.command = /^(c|reclamar)$/i; // Comandos "c" y "reclamar"

// Exportar el handler
export default handler;