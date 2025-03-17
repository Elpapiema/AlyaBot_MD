export async function before(m) {
    const chat = global.db.data.chats[m.chat] || {};

    // Verifica si el plugin tiene un nombre y si comienza con "nsfw-"
    if (m.plugin && m.plugin.startsWith('nsfw-')) {
        if (!chat.nsfw) {
            m.reply('⚠️ El contenido NSFW está desactivado en este chat.');
            return !0; // Bloquea la ejecución del plugin
        }
    }
}