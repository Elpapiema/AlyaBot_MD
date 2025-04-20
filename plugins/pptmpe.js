// plugins/pptmpe.js
import { downloadMediaMessage } from '@whiskeysockets/baileys';

const handler = async (m, { conn }) => {
  if (!m.quoted || m.quoted.mtype !== 'audioMessage') {
    return m.reply('Responde a un audio para convertirlo en nota de voz.');
  }

  try {
    const audio = await downloadMediaMessage(m.quoted, 'buffer', {}, { reuploadRequest: conn.updateMediaMessage });
    if (!audio) throw 'No se pudo descargar el audio.';

    await conn.sendMessage(m.chat, { audio, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: m });
  } catch (e) {
    m.reply('Ocurrió un error al procesar el audio.');
    console.error(e);
  }
};

handler.command = /^pptmp3$/i;
handler.register = true;
handler.help = ['pptmpe'];
handler.tags = ['audio'];

export default handler;