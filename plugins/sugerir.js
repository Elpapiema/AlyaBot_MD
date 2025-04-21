const handler = async (m, { args, text, conn, command }) => {
  if (!text) return m.reply('Por favor, escribe una sugerencia. Ejemplo: .sug Agrega más comandos divertidos.');

  const grupoSugerencias = '120363395553029777@g.us';
  const sugerencia = `*Nueva sugerencia recibida:*\n\n"${text}"\n\n*Enviada por:* @${m.sender.split('@')[0]}`;

  // Enviar al grupo designado
  await conn.sendMessage(grupoSugerencias, {
    text: sugerencia,
    mentions: [m.sender]
  });

  // Confirmar al usuario
  await m.reply('¡Gracias por tu sugerencia! Fue enviada correctamente al equipo del Staff.');
};

handler.command = /^sug$/i;
handler.help = ['sug <texto>'];
handler.tags = ['info'];
handler.register = true;

export default handler;