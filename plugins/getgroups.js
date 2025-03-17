const handler = async (m, { conn }) => {
    // Obtener todos los chats en los que el bot está presente
    const chats = await conn.groupFetchAllParticipating();
    const groupIds = Object.keys(chats);

    let message = "Grupos donde está el bot:\n\n";
    groupIds.forEach(id => {
        const groupName = chats[id].subject || "Sin nombre";
        message += `- ${groupName}: ${id}\n`;
    });

    m.reply(message);
};

handler.command = ['getgroups', 'grupos'];
export default handler;