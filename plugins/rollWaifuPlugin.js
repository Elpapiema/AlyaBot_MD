import fetch from 'node-fetch';
import { promises as fs } from 'fs';

// Sistema de cooldown
const cooldowns = new Set();
const COOLDOWN_TIME = 10 * 1000; // Tiempo de cooldown (10 segundos)

// URL del archivo JSON en el repositorio de GitHub
const jsonUrl = 'https://raw.githubusercontent.com/Elpapiema/Adiciones-para-AlyaBot-RaphtaliaBot-/refs/heads/main/image_json/characters.json';

// Ruta del archivo harem.json (en la raíz del repositorio)
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
        const characterInfo = `*Personaje:* ${character.name}\n*Edad:* ${character.age}\n*Estado:* ${character.relationship}\n*Anime/Juego/Manga:* ${character.source}`;

        // Enviar la imagen con el mensaje de texto
        const sentMsg = await conn.sendFile(m.chat, character.img, `${character.name}.jpg`, characterInfo, m);

        // Almacenar el personaje generado para reclamación
        if (!global.lastCharacter) global.lastCharacter = {};
        global.lastCharacter[sentMsg.key.id] = {
            ...character,
            owner: null, // Inicialmente sin propietario
            messageId: sentMsg.key.id // Guardar el ID del mensaje del bot
        };

        setTimeout(() => {
            cooldowns.delete(m.sender);
        }, COOLDOWN_TIME);

    } catch (error) {
        await conn.reply(m.chat, error.message, m);
    }
};

// Configuración del comando
handler.help = ['rw', 'rollwaifu'];
handler.tags = ['anime'];
handler.command = /^(rw|rollwaifu)$/i; // Los comandos aceptados son "rw" y "rollwaifu"

// Exportar el handler
export default handler;