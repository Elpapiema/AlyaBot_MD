import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db_users.json');
const personalizePath = path.join(process.cwd(), 'personalize.json');

// Función para leer archivos JSON
function readJSON(filePath) {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// Función para escribir en JSON
function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Obtener la moneda configurada en personalize.json
function getCurrency() {
    let personalizeData = readJSON(personalizePath);
    return personalizeData.global?.currency || personalizeData.default?.currency || 'monedas';
}

let handler = async (m, { text }) => {
    let userId = m.sender; // ID del usuario que ejecuta el comando
    if (!userId) {
        m.reply('❌ No se pudo obtener tu ID.');
        return;
    }

    let db = readJSON(dbPath);
    let currency = getCurrency();

    // Asegurar que la estructura de datos del usuario exista
    if (!db[userId]) db[userId] = { money: 0, bank: 0 };

    let userMoney = db[userId].money;
    let userBank = db[userId].bank;

    // Manejo del comando sin argumento
    if (!text) {
        m.reply(`❌ Uso incorrecto. Usa:\n- \`.deposit cantidad\`\n- \`.deposit all\``);
        return;
    }

    let depositAmount;

    if (text.toLowerCase() === 'all') {
        depositAmount = userMoney; // Depositar todo
    } else {
        depositAmount = parseInt(text);
        if (isNaN(depositAmount) || depositAmount <= 0) {
            m.reply(`❌ Ingresa una cantidad válida.`);
            return;
        }
    }

    // Validar que el usuario tenga suficiente dinero para depositar
    if (depositAmount > userMoney) {
        m.reply(`❌ No tienes suficiente ${currency} para depositar esa cantidad.`);
        return;
    }

    // Realizar el depósito
    db[userId].money = userMoney - depositAmount;
    db[userId].bank = userBank + depositAmount; // Aquí aseguramos que el banco se actualice correctamente

    writeJSON(dbPath, db); // Guardamos los cambios

    m.reply(`✅ Has depositado ${depositAmount} ${currency} en el banco.\n\n💰 **${currency} restante:** ${db[userId].money}\n🏦 **Saldo en el banco:** ${db[userId].bank}`);
};

// Definir el comando
handler.command = ['deposit', 'depositar', 'd'];

export default handler;