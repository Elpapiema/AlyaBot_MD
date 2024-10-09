import axios from 'axios';
import { sticker } from '../lib/sticker.js';

let handler = m => m;

handler.all = async function (m, { conn }) {
    try {
        // Verifica si el mensaje y el chat están definidos
        if (!m || !m.chat) throw new Error("Mensaje o chat no definidos.");

        let chat = global.db.data.chats[m.chat];
        let prefixRegex = new RegExp('^[' + (opts['prefix'] || '‎z/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.,\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']');

        // Evita procesar el mensaje si es un comando o menciona al bot
        if (m.mentionedJid.includes(this.user.jid) && m.isGroup && !chat.isBanned) {
            if (m.text.includes('PIEDRA') || m.text.includes('PAPEL') || m.text.includes('TIJERA') ||  
                m.text.includes('menu') || m.text.includes('estado') || m.text.includes('bots') ||  
                m.text.includes('serbot') || m.text.includes('jadibot') || m.text.includes('Video') || 
                m.text.includes('Audio') || m.text.includes('audio')) {
                return true;
            }

            await this.sendPresenceUpdate('composing', m.chat);

            async function luminsesi(q, username, logic) {
                try {
                    const response = await axios.post("https://luminai.my.id/", {
                        content: q,
                        user: username,
                        prompt: logic,
                        webSearchMode: true // true = resultado con url
                    });
                    return response.data.result;
                } catch (error) {
                    console.error("Error en la llamada a luminsesi:", error);
                    return "Ocurrió un error al procesar tu solicitud.";
                }
            }

            let query = m.text;
            let username = `${m.pushName}`;
            let syms1 = `Tomarás el rol de un bot de WhatsApp creado por GataDios. Tu nombre será GataBot 🐈. Tu idioma es el español, pero puedes responder en diferentes idiomas...`;

            let result = await luminsesi(query, username, syms1);
            if (m.fromMe) return;
            await m.reply(result, m.chat);
        }
        
        return true;

    } catch (error) {
        console.error("Error en el handler:", error);
        await m.reply("Ocurrió un error al procesar tu mensaje. Intenta nuevamente.", m.chat);
    }
};

export default handler;