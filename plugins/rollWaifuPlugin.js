import { promises as fs } from 'fs';
import fetch from 'node-fetch';

// Ruta del archivo characters.json (remoto en GitHub)
const charactersUrl = 'https://raw.githubusercontent.com/Elpapiema/Adiciones-para-AlyaBot-RaphtaliaBot-/refs/heads/main/image_json/characters.json';

// Función para cargar el archivo characters.json desde GitHub
async function loadCharacters() {
    try {
        const res = await fetch(charactersUrl);
        if (!res.ok) {
            throw new Error('No se pudo cargar el archivo characters.json desde GitHub.');
        }
        const characters = await res.json();
        return characters;
    } catch (error) {
        throw new Error('No se pudo cargar el archivo characters.json.');
    }
}

// Función para descargar la imagen del personaje
async function downloadImage(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error('No se pudo descargar la imagen.');
        }
        return await res.buffer();  // Descargar la imagen como buffer
    } catch (error) {
        throw new Error('Error al descargar la imagen.');
    }
}

// Definición del handler del comando 'rw' o 'rollwaifu'
let handler = async (m, { conn }) => {
    try {
        const characters = await loadCharacters();
        const randomCharacter = characters[Math.floor(Math.random() * characters.length)];

        const message = `
✨ *Nombre*: ${randomCharacter.name}
🎂 *Edad*: ${randomCharacter.age}
💖 *Estado Sentimental*: ${randomCharacter.relationship}
📚 *Origen*: ${randomCharacter.source}
        `;

        // Descargar la imagen del personaje
        const imageBuffer = await downloadImage(randomCharacter.img);

        // Enviar el mensaje con la información del personaje junto con la imagen
        const sentMsg = await conn.sendMessage(m.chat, { image: imageBuffer, caption: message }, { quoted: m });

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