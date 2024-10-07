import fs from 'fs';

// Ruta del archivo harem.json
const haremFilePath = './harem.json';

// Función para cargar los personajes reclamados
function loadHarem() {
    if (fs.existsSync(haremFilePath)) {
        const haremData = fs.readFileSync(haremFilePath, 'utf-8');
        return JSON.parse(haremData);
    }
    return [];
}

// Función para guardar los personajes reclamados
function saveHarem(harem) {
    fs.writeFileSync(haremFilePath, JSON.stringify(harem, null, 2));
}

// Handler para reclamar un personaje
let claimHandler = async (m, { conn, command }) => {
    const messageId = m.replyMessage?.id; // Obtener el ID del mensaje al que se responde
    const harem = loadHarem();
    
    // Verificar si el mensaje es una respuesta a un mensaje del bot
    if (!messageId) {
        await conn.reply(m.chat, 'Por favor, responde al mensaje del personaje que deseas reclamar.', m);
        return;
    }

    // Obtener el mensaje respondido
    const characterMessage = await conn.loadMessage(m.chat, messageId);
    const characterInfo = characterMessage?.message?.conversation || characterMessage?.message?.extendedTextMessage?.text;

    if (!characterInfo) {
        await conn.reply(m.chat, 'No se pudo encontrar el personaje en el mensaje.', m);
        return;
    }

    // Extraer el nombre del personaje usando una expresión regular
    const characterNameMatch = characterInfo.match(/Personaje:\s*(.*)/);
    const characterName = characterNameMatch ? characterNameMatch[1].trim() : null;

    if (!characterName) {
        await conn.reply(m.chat, 'No se pudo encontrar el nombre del personaje en el mensaje.', m);
        return;
    }

    // Verificar si el personaje ya fue reclamado
    if (harem.some(entry => entry.name === characterName && entry.sender === m.sender)) {
        await conn.reply(m.chat, `Ya has reclamado a *${characterName}*.`, m);
        return;
    }

    // Agregar el personaje al harem
    harem.push({ sender: m.sender, name: characterName });
    saveHarem(harem);

    await conn.reply(m.chat, `Has reclamado a *${characterName}* exitosamente.`, m);
};

// Configuración del comando
claimHandler.help = ['c', 'claim'];
claimHandler.tags = ['anime'];
claimHandler.command = /^(c|claim)$/i; // Los comandos aceptados son "c" y "claim"

// Exportar el handler
export default claimHandler;