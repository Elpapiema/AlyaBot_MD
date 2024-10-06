const fs = require('fs');
const path = require('path');

// Prefijo del bot
const PREFIX = '!'; // Aquí puedes cambiar el prefijo a lo que quieras

// Sistema de cooldown
const cooldowns = new Set();

// Tiempo de cooldown en milisegundos (10 segundos)
const COOLDOWN_TIME = 10 * 1000;

// Función para cargar el archivo characters.json
function loadCharacters() {
    const filePath = path.join(__dirname, './src/JSON/characters.json');
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

// Función para seleccionar un personaje aleatorio
function getRandomCharacter() {
    const characters = loadCharacters();
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters[randomIndex];
}

// Plugin para responder al comando 'rw' o 'rollwaifu' con prefijo
async function rollWaifuPlugin(message, sock) {
    const command = message.body.toLowerCase();

    // Verificar si el comando tiene el prefijo correcto
    if (command.startsWith(PREFIX)) {
        const withoutPrefix = command.slice(PREFIX.length);

        if (withoutPrefix === 'rw' || withoutPrefix === 'rollwaifu') {
            // Verificar si el usuario está en cooldown
            if (cooldowns.has(message.key.remoteJid)) {
                await sock.sendMessage(message.key.remoteJid, { text: 'Por favor espera antes de usar este comando de nuevo.' });
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
        }
    }
}

module.exports = rollWaifuPlugin;