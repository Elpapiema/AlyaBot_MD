import { exec } from 'node:child_process'

export default {
  name: 'terminal',
  customPrefix: '$',
  command: /.*/,
  ownerOnly: true,
  tags: ['owner'],

  async run({ sock, msg, noPrefix, remoteJid }) {
    const commandText = String(noPrefix || '').trim()

    if (!commandText) {
      return sock.sendMessage(remoteJid, {
        text: 'Por favor, ingresa un comando para ejecutar.'
      }, { quoted: msg })
    }

    exec(commandText, (error, stdout, stderr) => {
      const response = error
        ? `Error:\n${error.message}`
        : stderr
          ? `Stderr:\n${stderr}`
          : `Resultado:\n${stdout || '(sin salida)'}`

      sock.sendMessage(remoteJid, { text: response }, { quoted: msg }).catch(console.error)
    })
  }
}
