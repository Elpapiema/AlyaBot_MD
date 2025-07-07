import fetch from 'node-fetch'; // Si no tienes 'node-fetch', instálalo con 'npm install node-fetch'
import fs from 'fs';

// Función para obtener el trabajo aleatorio desde GitHub
const getRandomJob = async () => {
    const url = 'https://raw.githubusercontent.com/Elpapiema/CharHub-Store/refs/heads/main/Random/slut.json'; // URL del archivo JSON
    const response = await fetch(url);
    const data = await response.json();
    const jobs = data.jobs;
    return jobs[Math.floor(Math.random() * jobs.length)];
};

// Función para obtener el nombre de la moneda desde 'personalize.json' (bajo la etiqueta global)
const getCurrencyName = () => {
    const config = JSON.parse(fs.readFileSync('./database/personalize.json'));
    return config.global?.currency || 'Yenes'; // Si no hay moneda personalizada, usa 'Yenes'
};

// Guardar el dinero ganado en 'database.json'
const saveEarnings = (userId, moneyEarned) => {
    const database = fs.existsSync('./database/db_users.json') ? JSON.parse(fs.readFileSync('./database/db_users.json')) : {};
    if (!database[userId]) {
        database[userId] = { money: 0 };
    }
    database[userId].money += moneyEarned;
    fs.writeFileSync('./database/db_users.json', JSON.stringify(database, null, 2));
};

// Comando para trabajar
const handler = async (m, { conn, command }) => {
    try {
        const userId = m.sender;
        const job = await getRandomJob(); // Obtener un trabajo aleatorio
        const moneyEarned = Math.floor(Math.random() * (job.maxMoney - job.minMoney + 1)) + job.minMoney; // Calcular el dinero ganado
        const currency = getCurrencyName(); // Obtener el nombre de la moneda (personalizado o predeterminado)

        // Guardar el dinero ganado en 'database.json'
        saveEarnings(userId, moneyEarned);

        // Responder con el mensaje de trabajo realizado
        const message = ` ❀ ${job.description} ${moneyEarned} ${currency}.`;
        await conn.reply(m.chat, message, m);
    } catch (error) {
        console.error(error);
        await conn.reply(m.chat, '❌ Hubo un error al procesar \n \n Error de Sintaxis en slut.json.', m);
    }
};

handler.command = /^(slut)$/i;

export default handler;