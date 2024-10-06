import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio actual en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sistema de cooldown
const cooldowns = new Set();
const COOLDOWN_TIME = 10; // Tiempo de cooldown (10 segundos)

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

// Definición del handler del plugin
let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        // Verificar si el usuario está en cooldown
        if (cooldowns.has(m.sender)) {
            await conn.reply(m.chat, 'Espera un rato antes de usar el comando otra vez 😅', m);
            return;
        }

        // Añadir usuario al cooldown
        cooldowns.add(m.sender);

        // Obtener un personaje aleatorio
        const character = getRandomCharacter();

        // Enviar los datos del personaje
        await conn.reply(m.chat, `Personaje: ${character.name}\nEdad: ${character.age}\nEstado: ${character.status}\nAnime/Juego/Manga: ${character.anime}`, m);

        // Enviar la imagen del personaje
        await conn.sendFile(m.chat, character.image_url, `${character.name}.jpg`, `${character.name} de ${character.anime}`, m);

        // Eliminar el cooldown después de COOLDOWN_TIME
        setTimeout(() => {
            cooldowns.delete(m.sender);
        }, COOLDOWN_TIME);

    } catch (error) {
        // Enviar mensaje de error si no se pudo cargar el archivo characters.json
        await conn.reply(m.chat, error.message, m);
    }
};

// Configuración del comando
handler.help = ['rw', 'rollwaifu'];
handler.tags = ['anime'];
handler.command = /^(rw|rollwaifu)$/i; // Los comandos aceptados son "rw" y "rollwaifu"

// Exportar el handler
export default handler;