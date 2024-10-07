// rollwaifu-claim.js
import fs from 'fs';
import fetch from 'node-fetch';

// Ruta del archivo harem.json
const haremFilePath = './harem.json';

// Función para cargar el archivo characters.json desde GitHub
async function loadCharacters() {
    const jsonUrl = 'https://raw.githubusercontent.com/Elpapiema/Adiciones-para-AlyaBot-RaphtaliaBot-/refs/heads/main/image_json/characters.json';
    try {
        const response = await fetch(jsonUrl);
        if (!response.ok) {
            throw new Error(`No se pudo obtener el archivo characters.json. Código de estado: ${response.status}`);
        }

        const textData = await response.text();
        return JSON.parse(textData);
    } catch (error) {
        console.error(`Error al cargar el archivo characters.json: ${error.message}`);
        throw new Error(`No se pudo cargar el archivo characters.json desde GitHub.`);
    }
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

// Configuración de los comandos de reclamación
claimHandler.help = ['c <nombre del personaje>', 'claim <nombre del personaje>'];
claimHandler.tags = ['anime'];
claimHandler.command = /^(c|claim)$/i; // Los comandos aceptados son "c" y "claim"

// Exportar el handler
export default claimHandler;