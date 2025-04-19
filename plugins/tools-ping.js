let handler = async (m, { conn }) => {
    const start = Date.now();
    await m.reply('⏱️ Calculando ping...');
    const end = Date.now();
    const ping = end - start;
  
    await m.reply(`> 🏓 Ping: ${ping} ms`);
  };
  
  handler.help = ['ping', 'p'];
  handler.tags = ['info'];
  handler.command = ['ping', 'p'];
  
  export default handler;
  