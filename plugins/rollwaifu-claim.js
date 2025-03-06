import { promises as fs } from 'fs';

// Ruta del archivo harem.json en la raíz del repositorio
const haremFilePath = './harem.json';

// Función para cargar o inicializar harem.json
async function loadHarem() {
    try {
        const data = await fs.readFile(haremFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('El archivo harem.json no existe. Creando uno nuevo...');
            const emptyHarem = {};
            await saveHarem(emptyHarem);
            return emptyHarem;
        } else {
            throw new Error('Error al cargar el archivo harem.json');
        }
    }
}

async function saveHarem(harem) {
    try {
        await fs.writeFile(haremFilePath, JSON.stringify(harem, null, 2), 'utf-8');
    } catch (error) {
        throw new Error('Error al guardar el archivo harem.json');
    }
}

// Definición del handler para reclamar el personaje
let handler = async (m, { conn }) => {
    try {
        let character;

        // Si el usuario está respondiendo a un mensaje del bot
        if (m.quoted && m.quoted.sender === conn.user.jid) {
            const quotedMessageId = m.quoted.id;

            // Verificar si el mensaje citado contiene un personaje generado
            if (!global.lastCharacter || !global.lastCharacter[quotedMessageId]) {
                await conn.reply(m.chat, 'El mensaje al que estás respondiendo no contiene un personaje válido para reclamar.', m);
                return;
            }
            character = global.lastCharacter[quotedMessageId]; // Obtener el personaje del mensaje citado
        } else {
            await conn.reply(m.chat, 'Debes responder a un mensaje con un personaje para reclamarlo.', m);
            return;
        }

        // Cargar el archivo harem.json
        const harem = await loadHarem();

        // Si el usuario no tiene personajes, crear una entrada nueva
        if (!harem[m.sender]) {
            harem[m.sender] = [];
        }

        // Verificar si el personaje ya ha sido reclamado
        if (harem[m.sender].some(c => c.name === character.name)) {
            await conn.reply(m.chat, `Ya has reclamado a ${character.name}.`, m);
            return;
        }

        // Añadir el personaje al harem del usuario
        harem[m.sender].push(character);

        // Guardar el archivo harem.json actualizado
        await saveHarem(harem);

        // Confirmar que el personaje ha sido reclamado
        await conn.reply(m.chat, `Has reclamado a ${character.name} con éxito.`, m);

    } catch (error) {
        await conn.reply(m.chat, `Error al reclamar el personaje: ${error.message}`, m);
    }
};

// Configuración del comando
handler.help = ['claim'];
handler.tags = ['anime'];
handler.command = /^(claim|c|reclamar)$/i; // Comandos "claim", "c" y "reclamar"

export default handler;