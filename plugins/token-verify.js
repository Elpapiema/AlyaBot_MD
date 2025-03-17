import fetch from 'node-fetch';
import fs from 'fs';

// Enlace codificado en base64
const encryptedURL = 'aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0VscGFwaWVtYS9BZGljaW9uZXMtcGFyYS1BbHlhQm90LVJhcGh0YWxpYUJvdC0vcmVmcy9oZWFkcy9tYWluL2FjY2Vzby90b2tlbi5qc29u';

const handler = async (m, { args }) => {
    if (!args[0]) return m.reply('⚠️ Debes proporcionar un token.\nEjemplo: *.token ABCD1234*');

    const token = args[0].toUpperCase();
    // Decodificar el enlace de base64
    const url = Buffer.from(encryptedURL, 'base64').toString('utf-8'); // Desencripta el enlace

    try {
        // 📥 Obtener `tokens.json` de GitHub
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al obtener el JSON de GitHub.');

        const githubData = await response.json();

        // 📥 Obtener `token_status.json` localmente
        let localData = {};
        
        // Verificar si el archivo `token_status.json` existe
        if (fs.existsSync('./token_status.json')) {
            localData = JSON.parse(fs.readFileSync('./token_status.json', 'utf-8'));
        } else {
            // Si no existe, crear el archivo con una estructura predeterminada
            localData = {};
            fs.writeFileSync('./token_status.json', JSON.stringify(localData, null, 2), 'utf-8');
        }

        // 🔍 Buscar el token en `tokens.json`
        if (githubData.mainTokens && githubData.mainTokens[token]) {
            const tokenData = githubData.mainTokens[token];
            const tokenValue = tokenData.value;
            const maxUses = tokenData.maxUses;
            const createdAt = new Date(tokenData.createdAt).toLocaleString();
            return m.reply(`✅ Token: *${token}*\n🔹 Valor: ${tokenValue}\n🔸 Máximo de usos: ${maxUses}\n📅 Fecha de creación: ${createdAt}`);
        }

        if (githubData.subBotTokens && githubData.subBotTokens[token]) {
            const subBotInfo = localData[token] || { inUse: false };
            return m.reply(`🔹 Token de sub-bot: *${token}*\n🚀 En uso: ${subBotInfo.inUse ? 'Sí' : 'No'}`);
        }

        return m.reply(`❌ El token *${token}* no existe.`);
    } catch (error) {
        return m.reply('❌ Error al obtener los tokens. Asegúrate de que el JSON esté disponible.');
    }
};

handler.command = ['token'];

export default handler;