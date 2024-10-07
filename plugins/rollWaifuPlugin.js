import fetch from 'node-fetch';
import fs from 'fs';

// Sistema de cooldown
const cooldowns = new Set();
const COOLDOWN_TIME = 10 * 1000; // Tiempo de cooldown (10 segundos)

// URL del archivo JSON en el repositorio de GitHub
const jsonUrl = 'https://raw.githubusercontent.com/Elpapiema/Adiciones-para-AlyaBot-RaphtaliaBot-/refs/heads/main/image_json/characters.json';

// Ruta del archivo harem.json
const haremFilePath = './harem.json';

// Función para cargar el archivo characters.json desde GitHub
async function loadCharacters() {
    try {
        const response = await fetch(jsonUrl);
        if (!response.ok) {
            throw new Error(`No se pudo obtener el archivo characters.json. Código de estado: ${response.status}`);
        }

        const textData = await response.text();
        try {
            const data = JSON.parse(textData);
            console.log('Archivo JSON cargado correctamente desde GitHub.');
            return data;
        } catch (jsonError) {
            throw new Error('El archivo characters.json no es un JSON válido.');
        }

    } catch (error) {
        console.error(`Error al cargar el archivo characters.json: ${error.message}`);
        throw new Error(`No se pudo cargar el archivo characters.json desde GitHub.`);
    }
}

// Función para seleccionar un personaje aleatorio
async function getRandomCharacter() {
    const characters = await loadCharacters();
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters[randomIndex];
}

// Función para reclamar un personaje
async function claimCharacter(sender, character) {
    try {
        let harem = [];
        // Verificar si el archivo harem.json existe
        if (fs.existsSync(haremFilePath)) {
            const haremData = fs.readFileSync(haremFilePath, 'utf-8');
            harem = JSON.parse(haremData);
        }

        // Comprobar si el usuario ya ha reclamado un personaje
        if (harem.some(entry => entry.sender === sender)) {
            return `Ya has reclamado un personaje.`;
        }

        // Agregar el personaje reclamado al harem
        harem.push({ sender, character });
        fs.writeFileSync(haremFilePath, JSON.stringify(harem, null, 2));

        return `Has reclamado a *${character.name}* exitosamente.`;
    } catch (error) {
        console.error(`Error al reclamar el personaje: ${error.message}`);
        return 'Ocurrió un error al reclamar el personaje.';
    }
}

// Definición del handler del plugin
let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        if (cooldowns.has(m.sender)) {
            await conn.reply(m.chat, 'Espera un rato antes de usar el comando otra vez 😅', m);
            return;
        }

        cooldowns.add(m.sender);
        const character = await getRandomCharacter();

        // Crear el mensaje de texto con la información del personaje
        const characterInfo = `*Personaje:* ${character.name}\n*Edad:* ${character.age}\n*Estado:* ${character.status}\n*Anime/Juego/Manga:* ${character.anime}`;

        // Enviar la imagen con el mensaje de texto
        await conn.sendFile(m.chat, character.image_url, `${character.name}.jpg`, characterInfo, m);

        setTimeout(() => {
            cooldowns.delete(m.sender);
        }, COOLDOWN_TIME);

    } catch (error) {
        await conn.reply(m.chat, error.message, m);
    }
};

// Handler para reclamar personajes
let claimHandler = async (m, { conn, args }) => {
    const sender = m.sender;
    if (args.length === 0) {
        await conn.reply(m.chat, 'Por favor, proporciona el nombre del personaje que deseas reclamar.', m);
        return;
    }

    const characterName = args.join(' ');
    const characters = await loadCharacters();
    const character = characters.find(c => c.name.toLowerCase() === characterName.toLowerCase());

    if (!character) {
        await conn.reply(m.chat, 'No se encontró un personaje con ese nombre.', m);
        return;
    }

    const claimMessage = await claimCharacter(sender, character);
    await conn.reply(m.chat, claimMessage, m);
};

// Configuración de los comandos
handler.help = ['rw', 'rollwaifu'];
handler.tags = ['anime'];
handler.command = /^(rw|rollwaifu)$/i; // Los comandos aceptados son "rw" y "rollwaifu"

// Configuración de los comandos de reclamación
claimHandler.help = ['c <nombre del personaje>', 'claim <nombre del personaje>'];
claimHandler.tags = ['anime'];
claimHandler.command = /^(c|claim)$/i; // Los comandos aceptados son "c" y "claim"

// Exportar los handlers
export { handler, claimHandler as claim };