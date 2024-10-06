import fetch from 'node-fetch';

// Sistema de cooldown
const cooldowns = new Set();
const COOLDOWN_TIME = 10; // Tiempo de cooldown (10 segundos)

// URL del archivo JSON en el repositorio de GitHub
const jsonUrl = 'https://raw.githubusercontent.com/Elpapiema/Adiciones-para-AlyaBot-RaphtaliaBot-/refs/heads/main/image_json/characters.json';  // Cambia esta URL a la correcta

// Función para cargar el archivo characters.json desde GitHub
async function loadCharacters() {
    try {
        // Hacer una solicitud HTTP para obtener el archivo JSON
        const response = await fetch(jsonUrl);
        
        // Verificar si la respuesta fue exitosa
        if (!response.ok) {
            throw new Error(`No se pudo obtener el archivo characters.json. Código de estado: ${response.status}`);
        }

        // Verificar si la respuesta es JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('El archivo characters.json no es un JSON válido.');
        }

        // Convertir la respuesta a JSON
        const data = await response.json();
        console.log('Archivo JSON cargado correctamente desde GitHub.');
        return data;
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
        // Verificar si el usuario está en cooldown
        if (cooldowns.has(m.sender)) {
            await conn.reply(m.chat, 'Espera un rato antes de usar el comando otra vez 😅', m);
            return;
        }

        // Añadir usuario al cooldown
        cooldowns.add(m.sender);

        // Obtener un personaje aleatorio
        const character = await getRandomCharacter();

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