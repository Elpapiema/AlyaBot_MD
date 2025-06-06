/*import { promises as fs } from 'fs';

const haremFilePath = './database/harem.json';
const usersDbPath = './database/db_users.json';
const perzonaliPath = './database/personalize.json';

async function loadJSON(path, defaultValue = {}) {
    try {
        const data = await fs.readFile(path, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(path, JSON.stringify(defaultValue, null, 2));
            return defaultValue;
        } else {
            throw new Error(`Error al cargar el archivo ${path}`);
        }
    }
}

async function saveJSON(path, data) {
    try {
        await fs.writeFile(path, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        throw new Error(`Error al guardar el archivo ${path}`);
    }
}

let handler = async (m, { conn }) => {
    try {
        const dataP = JSON.parse(await fs.readFile(perzonaliPath));
        const globalConfig = dataP.global;
        const defaultConfig = dataP.default;
        const currency = globalConfig.currency || defaultConfig.currency;

        let character;

        if (m.quoted && (m.quoted.sender === conn.user.jid || m.quoted.id.startsWith('BAE5') || m.quoted.id.startsWith('3EB0'))) {
        /*if (m.quoted && m.quoted.sender === conn.user.jid) {
            const quotedId = m.quoted?.key?.id || m.quoted?.stanzaId || m.quoted?.id;
            if (!quotedId || !global.lastCharacter || !global.lastCharacter[quotedId]) {
                await conn.reply(m.chat, '⚠️ El mensaje al que estás respondiendo no contiene un personaje válido para reclamar.', m);
                return;
            }
            character = global.lastCharacter[quotedId];
        } else {
            await conn.reply(m.chat, '⚠️ Debes responder al mensaje del personaje enviado por el bot para reclamarlo.', m);
            return;
        }

        const harem = await loadJSON(haremFilePath);
        const usersDb = await loadJSON(usersDbPath);

        if (!usersDb[m.sender]) {
            usersDb[m.sender] = { money: 0, bank: 0 };
        }

        const userMoney = usersDb[m.sender].money || 0;
        const userBank = usersDb[m.sender].bank || 0;
        const cost = parseInt(character.buy) || 0;

        if (userMoney + userBank < cost) {
            await conn.reply(m.chat, `❌ No tienes suficiente dinero para reclamar a ${character.name}.\n\nNecesitas ${cost} ${currency} en total.\n\nUsa #work para ganar dinero`, m);
            return;
        }

        if (userMoney >= cost) {
            usersDb[m.sender].money -= cost;
        } else {
            const remaining = cost - userMoney;
            usersDb[m.sender].money = 0;
            usersDb[m.sender].bank -= remaining;
        }

        if (!harem[m.sender]) harem[m.sender] = [];

        if (harem[m.sender].some(c => c.name === character.name)) {
            await conn.reply(m.chat, `❗ Ya has reclamado a ${character.name}.`, m);
            return;
        }

        harem[m.sender].push(character);

        await saveJSON(haremFilePath, harem);
        await saveJSON(usersDbPath, usersDb);

        await conn.reply(m.chat, `✅ Has reclamado a ${character.name} con éxito.\n\nSe descontaron ${cost} ${currency}.\n\nSaldo actual:\n💰 Dinero: ${usersDb[m.sender].money} ${currency}\n🏦 Banco: ${usersDb[m.sender].bank} ${currency}`, m);

    } catch (error) {
        await conn.reply(m.chat, `❌ Error al reclamar el personaje: ${error.message}`, m);
    }
};

handler.help = ['claim'];
handler.tags = ['anime'];
handler.command = ['claim', 'c', 'reclamar'];

export default handler;*/ 


import { promises as fs } from 'fs';

const haremFilePath = './harem.json';
const usersDbPath = './db_users.json';
const perzonaliPath = './personalize.json'

async function loadJSON(path, defaultValue = {}) {
    try {
        const data = await fs.readFile(path, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(path, JSON.stringify(defaultValue, null, 2));
            return defaultValue;
        } else {
            throw new Error(`Error al cargar el archivo ${path}`);
        }
    }
}

async function saveJSON(path, data) {
    try {
        await fs.writeFile(path, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        throw new Error(`Error al guardar el archivo ${path}`);
    }
}

let handler = async (m, { conn }) => {
    try {
        const dataP = JSON.parse(await fs.readFile(perzonaliPath));
        // Data Money -------------------------
        const globalConfig = dataP.global;
        const defaultConfig = dataP.default;
        const currency = globalConfig.currency || defaultConfig.currency;
        //------------------------------
        let character;
        if (m.quoted && (m.quoted.sender === conn.user.jid || m.quoted.id.startsWith('BAE5') || m.quoted.id.startsWith('3EB0'))) {
        //if (m.quoted && m.quoted.sender === conn.user.jid) {
            const quotedMessageId = m.quoted.id;
            if (!global.lastCharacter || !global.lastCharacter[quotedMessageId]) {
                await conn.reply(m.chat, 'El mensaje al que estás respondiendo no contiene un personaje válido para reclamar.', m);
                return;
            }
            character = global.lastCharacter[quotedMessageId];
        } else {
            await conn.reply(m.chat, 'Ups debes responder a un mensaje con un personaje para reclamarlo.', m);
            return;
        }

        const harem = await loadJSON(haremFilePath);
        const usersDb = await loadJSON(usersDbPath);

        // Inicializar economía para el usuario si no existe
        if (!usersDb[m.sender]) {
            usersDb[m.sender] = { money: 0, bank: 0 };
        }

        const userMoney = usersDb[m.sender].money || 0;
        const userBank = usersDb[m.sender].bank || 0;
        const cost = parseInt(character.buy) || 0;

        if (userMoney + userBank < cost) {
            await conn.reply(m.chat, `❌ No tienes suficiente dinero para reclamar a ${character.name}. \n \n Necesitas ${cost} ${currency} en total. \n \n Usa #work para ganar dinero`, m);
            return;
        }

        // Descontar dinero
        if (userMoney >= cost) {
            usersDb[m.sender].money -= cost;
        } else {
            const remaining = cost - userMoney;
            usersDb[m.sender].money = 0;
            usersDb[m.sender].bank -= remaining;
        }

        if (!harem[m.sender]) harem[m.sender] = [];

        if (harem[m.sender].some(c => c.name === character.name)) {
            await conn.reply(m.chat, `❗ Ya has reclamado a ${character.name}.`, m);
            return;
        }

        harem[m.sender].push(character);

        await saveJSON(haremFilePath, harem);
        await saveJSON(usersDbPath, usersDb);

        await conn.reply(m.chat, `✅ Has reclamado a ${character.name} con éxito. \n \n Se descontaron ${cost} ${currency}.\n \nSaldo actual:\n💰 Dinero en mano: ${usersDb[m.sender].money} ${currency} \n🏦 Dinero en el Banco: ${usersDb[m.sender].bank} ${currency}`, m);

    } catch (error) {
        await conn.reply(m.chat, `❌ Error al reclamar el personaje: ${error.message}`, m);
    }
};

handler.help = ['claim'];
handler.tags = ['anime'];
handler.command = ['claim', 'c', 'reclamar']; // Comandos "claim", "c" y "reclamar"

export default handler;


// Esta es la version anterior de este comando

/*import { promises as fs } from 'fs';

// Ruta del archivo harem.json en la raíz del repositorio
const haremFilePath = './harem.json';

// Función para cargar o inicializar harem.json
async function loadHarem() {
    try {
        const data = await fs.readFile(haremFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('El archivo harem.json no existe. Creando uno nuevo...');
            const emptyHarem = {};
            await saveHarem(emptyHarem);
            return emptyHarem;
        } else {
            throw new Error('Error al cargar el archivo harem.json');
        }
    }
}

async function saveHarem(harem) {
    try {
        await fs.writeFile(haremFilePath, JSON.stringify(harem, null, 2), 'utf-8');
    } catch (error) {
        throw new Error('Error al guardar el archivo harem.json');
    }
}

// Definición del handler para reclamar el personaje
let handler = async (m, { conn }) => {
    try {
        let character;

        // Si el usuario está respondiendo a un mensaje del bot
        if (m.quoted && m.quoted.sender === conn.user.jid) {
            const quotedMessageId = m.quoted.id;

            // Verificar si el mensaje citado contiene un personaje generado
            if (!global.lastCharacter || !global.lastCharacter[quotedMessageId]) {
                await conn.reply(m.chat, 'El mensaje al que estás respondiendo no contiene un personaje válido para reclamar.', m);
                return;
            }
            character = global.lastCharacter[quotedMessageId]; // Obtener el personaje del mensaje citado
        } else {
            await conn.reply(m.chat, 'Debes responder a un mensaje con un personaje para reclamarlo.', m);
            return;
        }

        // Cargar el archivo harem.json
        const harem = await loadHarem();

        // Si el usuario no tiene personajes, crear una entrada nueva
        if (!harem[m.sender]) {
            harem[m.sender] = [];
        }

        // Verificar si el personaje ya ha sido reclamado
        if (harem[m.sender].some(c => c.name === character.name)) {
            await conn.reply(m.chat, `Ya has reclamado a ${character.name}.`, m);
            return;
        }

        // Añadir el personaje al harem del usuario
        harem[m.sender].push(character);

        // Guardar el archivo harem.json actualizado
        await saveHarem(harem);

        // Confirmar que el personaje ha sido reclamado
        await conn.reply(m.chat, `Has reclamado a ${character.name} con éxito.`, m);

    } catch (error) {
        await conn.reply(m.chat, `Error al reclamar el personaje: ${error.message}`, m);
    }
};

// Configuración del comando
handler.help = ['claim'];
handler.tags = ['anime'];
handler.command = /^(claim|c|reclamar)$/i; // Comandos "claim", "c" y "reclamar"

export default handler;*/

