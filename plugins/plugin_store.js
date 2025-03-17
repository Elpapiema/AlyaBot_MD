import fetch from 'node-fetch';

const handler = async (m, { conn }) => {
  try {
    // URL del JSON
    const url = 'https://raw.githubusercontent.com/Elpapiema/Adiciones-para-AlyaBot-RaphtaliaBot-/refs/heads/main/plugin_Store/store.json';

    // Intentar obtener el JSON
    let response = await fetch(url);
    if (!response.ok) throw new Error('Error al obtener el JSON');
    const data = await response.json();

    // Crear el mensaje
    let message = '*Plugins Disponibles*\n\n';
    data.plugins.forEach(plugin => {
      message += `🔹 *${plugin.name}*\n${plugin.description}\n💲 *${plugin.price}*\n\n`;
    });
    data.packages.forEach(pack => {
      message += `*Paquetes disponibles*\n \n 🔸 *${pack.name}*\n${pack.description}\n💲 *${pack.price}*\n\n`;
    });

    // Enviar el mensaje
    await conn.reply(m.chat, message.trim(), m);
  } catch (err) {
    console.error(err);
    await conn.reply(m.chat, 'Hubo un error al obtener la tienda. Inténtalo más tarde.', m);
  }
};

handler.command = /^(store|pluginstore|tienda)$/i; // Comandos
export default handler;