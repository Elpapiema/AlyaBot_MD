import { promises as fs } from 'fs';
import fetch from 'node-fetch';

// Nueva ruta del archivo harem.json en la raíz del repositorio
const haremFilePath = './harem.json';

// Función para cargar o inicializar harem.json
async function loadHarem() {
    try {
        // Intentar leer el archivo harem.json
        const data = await fs.readFile(haremFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // Si el archivo no existe, crearlo y devolver un objeto vacío
        if (error.code === 'ENOENT') {
            console.log('El archivo harem.json no existe. Creando uno nuevo...');
            const emptyHarem = {};
            await saveHarem(emptyHarem); // Crear el archivo vacío
            return emptyHarem;
        } else {
            throw new Error('Error al cargar el archivo harem.json');
        }
    }
}

// Función para guardar el archivo harem.json
async function saveHarem(harem) {
    try {
        // Guardar el contenido actualizado del harem
        await fs.writeFile(haremFilePath, JSON.stringify(harem, null, 2), 'utf-8');
    } catch (error) {
        throw new Error('Error al guardar el archivo harem.json');
    }
}

// Definición del handler del plugin para reclamar el personaje
let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        // Verificar si el último personaje generado existe
        if (!global.lastCharacter || !global.lastCharacter[m.sender]) {
            await conn.reply(m.chat, 'No has generado un personaje con el comando rw. Usa el comando primero para reclamar uno.', m);
            return;
        }

        const character = global.lastCharacter[m.sender];

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
