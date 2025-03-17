import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db_users.json');
const haremPath = path.join(process.cwd(), 'harem.json');
const personalizePath = path.join(process.cwd(), 'personalize.json');

// Función para leer archivos JSON
function readJSON(filePath) {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// Obtener la moneda configurada en personalize.json
function getCurrency() {
    let personalizeData = readJSON(personalizePath);
    return personalizeData.global?.currency || personalizeData.default?.currency || 'monedas';
}

let handler = async (m, { conn }) => {
    let userId = m.sender; // ID del usuario que ejecuta el comando
    if (!userId) {
        m.reply('❌ No se pudo obtener tu ID.');
        return;
    }

    let db = readJSON(dbPath);
    let harem = readJSON(haremPath);
    let currency = getCurrency();

    // Datos financieros del usuario
    let userData = db[userId] || { money: 0, bank: 0 };
    let userMoney = userData.money;
    let userBank = userData.bank;

    // Contar personajes en el harem
    let haremCount = harem[userId] ? harem[userId].length : 0;

    // Obtener foto de perfil
    let profilePicUrl;
    try {
        profilePicUrl = await conn.profilePictureUrl(userId, 'image');
    } catch (e) {
        profilePicUrl = 'https://i.imgur.com/Y2Z55QF.png'; // Imagen por defecto si no tiene foto
    }

    // Crear el mensaje
    let message = `🌟 *Perfil de Usuario* 🌟\n\n`
        + `👤 *Usuario:* @${userId.split('@')[0]}\n`
        + `💰 *${currency} en mano:* ${userMoney}\n`
        + `🏦 *Banco:* ${userBank}\n`
        + `💞 *Personajes en harem:* ${haremCount}`;

    // Enviar la foto con el mensaje
    await conn.sendMessage(m.chat, { 
        image: { url: profilePicUrl }, 
        caption: message, 
        mentions: [userId] 
    }, { quoted: m });
};

// Definir el comando
handler.command = /^(perfil|profile)$/i;

export default handler;