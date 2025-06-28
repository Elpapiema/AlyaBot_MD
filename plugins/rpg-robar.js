import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const dbPath = path.join(process.cwd(), 'db_users.json');
const eventsUrl = 'https://raw.githubusercontent.com/Elpapiema/CharHub-Store/refs/heads/main/Random/rob-events.json'; // Reemplaza con la URL real

// Función para leer JSON local
function readJSON(filePath) {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// Función para obtener la moneda personalizada
function getCurrency() {
    let personalizePath = path.join(process.cwd(), 'personalize.json');
    let personalizeData = readJSON(personalizePath);
    return personalizeData.global?.currency || personalizeData.default?.currency || 'monedas';
}

// Función para obtener los eventos desde GitHub
async function fetchEvents() {
    try {
        let res = await fetch(eventsUrl);
        if (!res.ok) throw new Error('No se pudo obtener el JSON.');
        return await res.json();
    } catch (e) {
        console.error('Error al obtener eventos de robo:', e);
        return { successful: [], failed: [] };
    }
}

let handler = async (m, { conn, text }) => {
    let userId = m.sender;
    let args = text.split(' ');
    let target = args[0];

    let db = readJSON(dbPath);
    let userData = db[userId] || { money: 0, bank: 0 };
    let currency = getCurrency();

    let events = await fetchEvents(); // Obtener eventos desde GitHub

    if (target && target.startsWith('@')) {
        // Modo: Robar a un usuario específico
        let targetId = target.replace('@', '') + '@s.whatsapp.net';

        if (!db[targetId]) {
            m.reply('❌ El usuario mencionado no está registrado en la base de datos.');
            return;
        }

        let targetData = db[targetId];

        if (targetData.money <= 0) {
            m.reply(`❌ ${target} no tiene dinero en mano para robar.`);
            return;
        }

        let success = Math.random() < 0.3; // 30% de éxito
        let amount = Math.floor(Math.random() * 200) + 50;

        if (success) {
            amount = Math.min(amount, targetData.money);
            targetData.money -= amount;
            userData.money += amount;
            db[targetId] = targetData;
            db[userId] = userData;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            m.reply(`✅ ¡Lograste robar *${amount} ${currency}* a ${target}!`);
        } else {
            let lostAmount = Math.floor(amount / 2);
            userData.money = Math.max(0, userData.money - lostAmount);
            db[userId] = userData;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            m.reply(`❌ Fallaste en el robo y perdiste *${lostAmount} ${currency}* en el intento.`);
        }
    } else {
        // Modo: Evento de robo aleatorio
        let isSuccess = Math.random() < 0.5;
        let eventList = isSuccess ? events.successful : events.failed;
        let event = eventList[Math.floor(Math.random() * eventList.length)];
        let amount = event.amount;

        if (isSuccess) {
            userData.money += amount;
        } else {
            amount = Math.min(amount, userData.money);
            userData.money = Math.max(0, userData.money + amount);
        }

        db[userId] = userData;
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        m.reply(event.message.replace('{amount}', `${Math.abs(amount)} ${currency}`));
    }
};

handler.command = ['rob', 'robar', 'crime'];

export default handler;
