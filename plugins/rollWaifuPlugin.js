import fetch from 'node-fetch';

// Sistema de cooldown
const cooldowns = new Set();
const COOLDOWN_TIME = 10 * 1000; // Tiempo de cooldown (10 segundos)

// URL del archivo JSON en el repositorio de GitHub
const jsonUrl = 'https://raw.githubusercontent.com/Elpapiema/Adiciones-para-AlyaBot-RaphtaliaBot-/refs/heads/main/image_json/characters.json';

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

        // Enviar la imagen con el mensaje de texto y guardar el ID del mensaje
        const message = await conn.sendFile(m.chat, character.image_url, `${character.name}.jpg`, characterInfo, m);
        message.replyMessage = { id: message.id }; // Agregar el ID del mensaje

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