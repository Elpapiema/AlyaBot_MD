import fs from 'fs';
const handler = async (m, {conn, text}) => {
  try {
    m.reply('Espera Por Favor, Enviando Base de Datos');
    
    // Verificar y leer el archivo database.json
    if (!fs.existsSync('./database.json')) {
      throw new Error('El archivo database.json no existe.');
    }
    const db = fs.readFileSync('./database.json');
    await conn.sendMessage(m.chat, {document: db, mimetype: 'application/json', fileName: 'database.json'}, {quoted: m});
    
    // Verificar y leer el archivo harem.json
    if (!fs.existsSync('./harem.json')) {
      throw new Error('El archivo harem.json no existe.');
    }
    const harem = fs.readFileSync('./harem.json');
    await conn.sendMessage(m.chat, {document: harem, mimetype: 'application/json', fileName: 'harem.json'}, {quoted: m});
    
  } catch (err) {
    console.error(err);
    m.reply('Hubo un error al enviar los archivos. Intenta nuevamente más tarde.');
  }
};
handler.help = ['getdb'];
handler.tags = ['owner'];
handler.command = /^(getdb)$/i;

handler.rowner = true;
export default handler;