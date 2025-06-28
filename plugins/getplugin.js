import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let handler = async (m, { conn, text }) => {
    const pluginName = text.replace(/^(getplugin)\s+/i, '').trim();

    if (!pluginName) {
        conn.reply(m.chat, 'Por favor, proporciona el nombre del plugin que deseas instalar.', m);
        return;
    }

    try {
        const storeUrl = 'https://raw.githubusercontent.com/Elpapiema/CharHub-Store/refs/heads/main/plugin_Store/store.json';
        conn.reply(m.chat, `🔄 Buscando el plugin "${pluginName}" en la tienda...`, m);

        // Obtén la lista de plugins desde la tienda
        const response = await fetch(storeUrl);
        if (!response.ok) throw new Error(`Error al obtener la tienda: ${response.statusText}`);
        const storeData = await response.json();

        // Busca el plugin
        const plugin = storeData.plugins.find(p => p.name.toLowerCase() === pluginName.toLowerCase());
        if (!plugin) {
            conn.reply(m.chat, `⚠️ El plugin "${pluginName}" no se encuentra en la tienda.`, m);
            return;
        }

        conn.reply(m.chat, `🔄 Descargando el plugin "${pluginName}"...`, m);

        // Descarga el plugin
        const pluginFile = await fetch(plugin.link);
        if (!pluginFile.ok) throw new Error(`Error al descargar el plugin: ${pluginFile.statusText}`);
        const pluginContent = await pluginFile.text();

        // Ruta hacia la carpeta plugins en la raíz
        const rootPath = path.resolve(); // Obtiene la ruta raíz del proyecto
        const pluginsFolder = path.join(rootPath, 'plugins');
        const pluginPath = path.join(pluginsFolder, `${pluginName}.js`);

        // Crear la carpeta plugins si no existe
        if (!fs.existsSync(pluginsFolder)) {
            fs.mkdirSync(pluginsFolder);
        }

        // Guardar el archivo
        fs.writeFileSync(pluginPath, pluginContent);

        conn.reply(m.chat, `✅ El plugin "${pluginName}" se ha instalado correctamente.`, m);
    } catch (err) {
        console.error('Error en getplugin:', err.message);
        conn.reply(m.chat, `⚠️ Hubo un error: ${err.message}`, m);
    }
};

// Definición del comando
handler.command = /^(getplugin)$/i;

export default handler;