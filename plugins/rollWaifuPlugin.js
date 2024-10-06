import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Prefijo del bot
const PREFIX = '!'; // Puedes quitar esta parte si ya no usas prefijo en el handler

// Sistema de cooldown
const cooldowns = new Set();

// Tiempo de cooldown en milisegundos (10 segundos)
const COOLDOWN_TIME = 10 * 1000;

// Obtener el directorio actual en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log de prueba para verificar si el plugin se carga
console.log("Plugin rollWaifuPlugin cargado correctamente.");

// Función para cargar el archivo characters.json con manejo de errores
function loadCharacters() {
    const filePath = path.join(__dirname, './src/JSON/characters.json');
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error(`No se pudo cargar el archivo characters.json. Verifica que el archivo exista en la ruta ${filePath}`);
    }
}

// Función para seleccionar un personaje aleatorio
function getRandomCharacter() {
    const characters = loadCharacters();
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters[randomIndex];
}

// Plugin para responder al comando 'rw' o 'rollwaifu' con prefijo y manejo de errores
async function rollWaifuPlugin(message, sock) {
    try {
        // Verificar si el usuario está en cooldown
        if (cooldowns.has(message.key.remoteJid)) {
            await sock.sendMessage(message.key.remoteJid, { text: 'Espera un rato antes de usar el comando otra vez 😅' });
            return;
        }

        // Añadir usuario al cooldown
        cooldowns.add(message.key.remoteJid);

        // Obtener un personaje aleatorio
        const character = getRandomCharacter();

        // Enviar los datos del personaje
        await sock.sendMessage(message.key.remoteJid, {
            text: `Personaje: ${character.name}\nEdad: ${character.age}\nEstado: ${character.status}\nAnime/Juego/Manga: ${character.anime}`,
        });

        // Enviar la imagen del personaje
        await sock.sendMessage(message.key.remoteJid, {
            image: { url: character.image_url },
            caption: `${character.name} de ${character.anime}`
        });

        // Eliminar el cooldown después de COOLDOWN_TIME
        setTimeout(() => {
            cooldowns.delete(message.key.remoteJid);
        }, COOLDOWN_TIME);

    } catch (error) {
        // Enviar mensaje de error si no se pudo cargar el archivo characters.json
        await sock.sendMessage(message.key.remoteJid, { text: error.message });
    }
}

// Configuración del comando
handler.help = ['rw'];
handler.tags = ['fun'];
handler.command = /^rw$/i; // El comando será "rw", insensible a mayúsculas

export default rollWaifuPlugin;