export default {
  name: 'ping',
  command: ['ping', 'p'],
  groupOnly: false,
  adminOnly: false,
  ownerOnly: false,
  async run({ sock, msg, remoteJid }) {
    const start = Date.now()
    await sock.sendMessage(remoteJid, { text: 'Pong...' }, { quoted: msg })
    const latency = Date.now() - start
    await sock.sendMessage(remoteJid, { text: `Latency: ${latency}ms` }, { quoted: msg })
  }
}
