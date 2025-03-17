let handler = async (m, { conn, participants, isAdmin }) => {
    const chat = global.db.data.chats[m.chat];
    if (!chat.bye) return; // Si las despedidas están desactivadas, no hacer nada

    // Filtrar participantes que salieron o fueron eliminados
    const leftParticipants = participants.filter(p => p.action === 'remove').map(p => p.id);
    if (!leftParticipants.length) return;

    for (const user of leftParticipants) {
        const userName = await conn.getName(user);
        const groupName = await conn.getName(m.chat);

        // Mensaje de despedida personalizado
        const byeMessage = `👋 Adiós, @${user.split('@')[0]}.
        
        💬 Esperamos que hayas disfrutado tu tiempo en *${groupName}*. ¡Buena suerte en todo lo que hagas!`;

        // Enviar mensaje de despedida
        await conn.sendMessage(m.chat, {
            text: byeMessage,
            mentions: [user]
        });
    }
};

handler.groupParticipantsUpdate = true; // Escucha eventos de participantes en grupos
export default handler;