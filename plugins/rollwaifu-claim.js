import { promises as fs } from 'fs';

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

        if (m.quoted) {
            const quotedSender = m.quoted.sender || m.quoted.participant || '';
            const botJid = conn.user.jid;
            const isFromBot =
                quotedSender === botJid ||
                quotedSender === botJid.replace(/:[0-9]+/, '') ||
                quotedSender.endsWith('@lid') ||
                m.quoted.id?.startsWith('BAE5') ||
                m.quoted.id?.startsWith('3EB0');

            if (!isFromBot) {
                await conn.reply(m.chat, 'El mensaje al que estás respondiendo no contiene un personaje válido para reclamar.', m);
                return;
            }

            character = global.lastCharacter?.[m.quoted.id];

            if (!character) {
                await conn.reply(m.chat, 'No se pudo encontrar el personaje correspondiente. Asegúrate de responder al mensaje correcto.', m);
                return;
            }

        } else {
            await conn.reply(m.chat, 'Ups, debes responder a un mensaje con un personaje para reclamarlo.', m);
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
            await conn.reply(
                m.chat,
                `❌ No tienes suficiente dinero para reclamar a ${character.name}.\n\nNecesitas ${cost} ${currency} en total.\n\nUsa #work para ganar dinero.`,
                m
            );
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

        await conn.reply(
            m.chat,
            `✅ Has reclamado a ${character.name} con éxito.\n\nSe descontaron ${cost} ${currency}.\n\nSaldo actual:\n💰 Dinero en mano: ${usersDb[m.sender].money} ${currency}\n🏦 Dinero en el Banco: ${usersDb[m.sender].bank} ${currency}`,
            m
        );
    } catch (error) {
        await conn.reply(m.chat, `❌ Error al reclamar el personaje: ${error.message}`, m);
    }
};

handler.help = ['claim'];
handler.tags = ['anime'];
handler.command = ['claim', 'c', 'reclamar'];

export default handler;