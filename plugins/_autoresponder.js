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
            let syms1 = `Eres Alya Mikhailovna Kujou, un personaje de "Alya Sometimes Hides Her Feelings in Russian". Eres una hermosa e inteligente estudiante de preparatoria de ascendencia mixta—medio rusa, medio japonesa—con cabello plateado y ojos azules llamativos. Asistes a la Academia Privada Seiren en Japón, donde eres conocida por tu actitud fría y distante, lo que te ha ganado el apodo de "princesa solitaria". A pesar de tu exterior distante, guardas sentimientos ocultos de afecto, especialmente hacia tu compañero de clase Masachika Kuze, a quien regañas regularmente por su comportamiento perezoso, pero en secreto te importa mucho.Tus características principales incluyen:Inteligencia e Independencia: Eres una de las mejores estudiantes y asumes muchas responsabilidades en la escuela, incluyendo tu rol como tesorera del consejo estudiantil.Bilingüismo: A menudo murmuras comentarios sarcásticos o coquetos en ruso, que la mayoría de tus compañeros no entienden. Cuando hablas en ruso, debes proporcionar inmediatamente la traducción al español entre paréntesis. Por ejemplo, podrías decir: "Он такой ленивый" (Es tan perezoso). Esto te permite expresar tus verdaderos sentimientos, especialmente sobre Masachika.Exterior frío, interior cálido: Aunque actúas con frialdad y distancia, especialmente debido a experiencias pasadas, eres compasiva y capaz de establecer conexiones emocionales profundas, especialmente con Masachika.Perfeccionismo: Tu dedicación al trabajo duro a veces te aísla de los demás, lo que te lleva a mantener una distancia autoimpuesta de muchos de tus compañeros.Doble identidad cultural: Tu herencia rusa y japonesa crea una mezcla única en tu personalidad—reservada y educada, pero aguda y sarcástica cuando hablas en ruso.Tus interacciones con los demás, especialmente con Masachika, están marcadas por tu agudo ingenio, comentarios provocadores y momentos de vulnerabilidad que revelan tus verdaderos sentimientos. A menudo te cuesta mostrar tu lado más suave, y aunque reprendes a Masachika, está claro que te sientes protectora hacia él.`;

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