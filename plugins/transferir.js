import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database', 'db_users.json');
const personalizePath = path.join(process.cwd(), 'database', 'personalize.json');

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

let handler = async (m, { conn, text }) => {
    let userId = m.sender; // ID del usuario que ejecuta el comando
    let args = text.split(' '); // Dividir el comando en argumentos
    let amount = parseInt(args[0]); // La cantidad de dinero a transferir
    let target = args[1]; // El destinatario de la transferencia

    if (!amount || isNaN(amount) || amount <= 0) {
        m.reply('❌ Por favor, ingresa una cantidad válida para transferir.');
        return;
    }

    if (!target || !target.startsWith('@')) {
        m.reply('❌ Debes mencionar al usuario al que deseas transferir.');
        return;
    }

    // Obtener los datos del usuario y del destinatario
    let db = readJSON(dbPath);
    let userData = db[userId] || { money: 0, bank: 0 };
    let targetId = target.replace('@', '') + '@s.whatsapp.net'; // Formatear el ID del destinatario

    // Verificar si el usuario tiene suficiente dinero en el banco
    if (userData.bank < amount) {
        m.reply('❌ No tienes suficiente dinero en tu banco para realizar esta transferencia.');
        return;
    }

    // Si el destinatario no existe en la base de datos, crear una entrada para él
    if (!db[targetId]) {
        db[targetId] = { money: 0, bank: 0 };
    }

    // Realizar la transferencia en el banco
    userData.bank -= amount; // Descontar del banco del remitente
    db[userId] = userData; // Actualizar los datos del remitente

    db[targetId].bank += amount; // Agregar al banco del destinatario
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2)); // Guardar los cambios en db_users.json

    let currency = getCurrency(); // Obtener la moneda personalizada

    // Confirmar la transferencia mencionando al receptor
    let receiverMention = `@${targetId.split('@')[0]}`;
    m.reply(`✅ Has transferido *${amount} ${currency}* a ${receiverMention} dentro de su banco.`, null, { mentions: [targetId] });
};

// Definir el comando
handler.command = /^(transferir)$/i;

export default handler;
