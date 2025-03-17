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
        m.reply(`❌ Uso incorrecto. Usa:\n- \`.retirar cantidad\`\n- \`.retirar all\``);
        return;
    }

    let withdrawAmount;

    if (text.toLowerCase() === 'all') {
        withdrawAmount = userBank; // Retirar todo
    } else {
        withdrawAmount = parseInt(text);
        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
            m.reply(`❌ Ingresa una cantidad válida.`);
            return;
        }
    }

    // Validar que el usuario tenga suficiente dinero en el banco para retirar
    if (withdrawAmount > userBank) {
        m.reply(`❌ No tienes suficiente saldo en el banco para retirar esa cantidad.`);
        return;
    }

    // Realizar el retiro
    db[userId].money = userMoney + withdrawAmount;
    db[userId].bank = userBank - withdrawAmount; // Se actualiza el banco correctamente

    writeJSON(dbPath, db); // Guardamos los cambios

    m.reply(`✅ Has retirado ${withdrawAmount} ${currency} de tu banco.\n\n💰 **${currency} disponible:** ${db[userId].money}\n🏦 **Saldo restante en el banco:** ${db[userId].bank}`);
};

// Definir el comando
handler.command = /^(retirar)$/i;

export default handler;