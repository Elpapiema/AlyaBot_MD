import fs from 'node:fs'
import path from 'node:path'
import fetch from 'node-fetch'

const STORE_URL = 'https://raw.githubusercontent.com/Elpapiema/CharHub-Store/refs/heads/main/plugin_Store/store.json'

async function loadStore() {
  const response = await fetch(STORE_URL)
  if (!response.ok) throw new Error(`Error al obtener la tienda: ${response.statusText}`)
  return response.json()
}

export default {
  name: 'plugin-store',
  command: ['store', 'pluginstore', 'tienda', 'getplugin', 'getpack'],
  tags: ['tools'],
  ownerOnly: true,

  async run({ sock, msg, text, commandName, remoteJid }) {
    try {
      const storeData = await loadStore()

      if (['store', 'pluginstore', 'tienda'].includes(commandName)) {
        let message = '*Plugins Disponibles*\n\n'

        for (const plugin of storeData.plugins || []) {
          message += `🔹 *${plugin.name}*\n${plugin.description}\n💲 *${plugin.price}*\n\n`
        }

        if (Array.isArray(storeData.packages) && storeData.packages.length) {
          message += '*Paquetes disponibles*\n\n'
          for (const pack of storeData.packages) {
            message += `🔸 *${pack.name}*\n${pack.description}\n💲 *${pack.price}*\n\n`
          }
        }

        return sock.sendMessage(remoteJid, { text: message.trim() }, { quoted: msg })
      }

      const itemName = text.trim()
      if (!itemName) {
        return sock.sendMessage(remoteJid, {
          text: `Por favor, proporciona el nombre del ${commandName === 'getplugin' ? 'plugin' : 'paquete'} que deseas instalar.`
        }, { quoted: msg })
      }

      if (commandName === 'getplugin') {
        const plugin = (storeData.plugins || []).find((item) => item.name.toLowerCase() === itemName.toLowerCase())
        if (!plugin) {
          return sock.sendMessage(remoteJid, {
            text: `⚠️ El plugin "${itemName}" no se encuentra en la tienda.`
          }, { quoted: msg })
        }

        const pluginFile = await fetch(plugin.link)
        if (!pluginFile.ok) throw new Error(`Error al descargar el plugin: ${pluginFile.statusText}`)

        const pluginContent = await pluginFile.text()
        const pluginsFolder = path.join(process.cwd(), 'plugins')
        const pluginPath = path.join(pluginsFolder, `${plugin.name}.js`)

        if (!fs.existsSync(pluginsFolder)) fs.mkdirSync(pluginsFolder, { recursive: true })
        fs.writeFileSync(pluginPath, pluginContent)

        return sock.sendMessage(remoteJid, {
          text: `✅ El plugin "${plugin.name}" se ha instalado correctamente.`
        }, { quoted: msg })
      }

      const pack = (storeData.packages || []).find((item) => item.name.toLowerCase() === itemName.toLowerCase())
      if (!pack) {
        return sock.sendMessage(remoteJid, {
          text: `⚠️ El paquete "${itemName}" no se encuentra en la tienda.`
        }, { quoted: msg })
      }

      await sock.sendMessage(remoteJid, {
        text: `⚠️ El instalador automático de paquetes para "${pack.name}" todavía no está adaptado al nuevo sistema.\n\nUsa la URL manual:\n${pack.link}`
      }, { quoted: msg })
    } catch (error) {
      console.error(error)
      await sock.sendMessage(remoteJid, {
        text: `⚠️ Hubo un error: ${error.message}`
      }, { quoted: msg })
    }
  }
}
