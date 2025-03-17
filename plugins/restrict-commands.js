const handler = async (m, { conn, usedPrefix, command, isOwner, isAdmin, isBotAdmin, isPremium, isGroup }) => {
    // Asegurar que global.plugins está definido y es un objeto
    if (typeof global.plugins !== 'object') return !0;

    // Obtener el plugin que maneja el comando
    const plugin = global.plugins?.[command];
    if (!plugin) return !0; // Si el comando no existe, continuar normalmente

    // Validar restricciones automáticamente según las propiedades del plugin
    if (plugin.rowner && !isOwner) return m.reply(global.dfail('rowner', m, conn, usedPrefix));
    if (plugin.owner && !isOwner) return m.reply(global.dfail('owner', m, conn, usedPrefix));
    if (plugin.admin && !isAdmin) return m.reply(global.dfail('admin', m, conn, usedPrefix));
    if (plugin.group && !isGroup) return m.reply(global.dfail('group', m, conn, usedPrefix));
    if (plugin.botAdmin && !isBotAdmin) return m.reply(global.dfail('botAdmin', m, conn, usedPrefix));
    if (plugin.premium && !isPremium) return m.reply(global.dfail('premium', m, conn, usedPrefix));

    return !0; // Permitir la ejecución del comando si cumple con las condiciones
};

// Este handler se ejecutará antes que los demás
handler.before = async (m, context) => {
    await handler(m, context);
};

export default handler;