import { promises as fs } from 'fs';
import fetch from 'node-fetch';

// Ruta del archivo characters.json (remoto en GitHub)
const charactersUrl = 'https://raw.githubusercontent.com/Elpapiema/Adiciones-para-AlyaBot-RaphtaliaBot-/refs/heads/main/image_json/characters.json';

// Función para cargar el archivo characters.json desde GitHub
async function loadCharacters() {
    try {
        const res = await fetch(charactersUrl);
        const characters = await res.json();
        return characters;
    } catch (error) {
        throw new Error('No se pudo cargar el archivo characters.json desde GitHub.');
    }
}

// Definición del handler del comando 'rw' o 'rollwaifu'
let handler = async (m, { conn }) => {
    try {
        const characters = await loadCharacters();
        const randomCharacter = characters[Math.floor(Math.random() * characters.length)];

        // Mensaje de información del personaje
        const message = `
✨ *Nombre*: ${randomCharacter.name}
🎂 *Edad*: ${randomCharacter.age} años
💖 *Estado Sentimental*: ${randomCharacter.relationship}
📚 *Origen*: ${randomCharacter.source}
        `;

        // Enviar el mensaje con la información del personaje y la imagen
        const sentMsg = await conn.sendFile(m.chat, randomCharacter.img, `${randomCharacter.name}.jpg`, message, m);

        // Almacenar el personaje generado con el ID del mensaje enviado por el bot
        if (!global.lastCharacter) global.lastCharacter = {};
        global.lastCharacter[sentMsg.key.id] = randomCharacter; // Guardar usando el ID del mensaje del bot

    } catch (error) {
        await conn.reply(m.chat, `Error al cargar el personaje: ${error.message}`, m);
    }
};

// Configuración del comando
handler.help = ['rw', 'rollwaifu'];
handler.tags = ['anime'];
handler.command = /^(rw|rollwaifu)$/i; // Comandos "rw" y "rollwaifu"

export default handler;