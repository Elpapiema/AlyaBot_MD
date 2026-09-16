const KEYWORD_REGEX = /\b(alya|rusa|albina|emma|alyabot)\b/i
const EMOJIS = ['🌸', '✨', '💫', '🫶', '🥰', '🔥', '💖', '😼']

function randomEmoji() {
  return EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
}

export default {
  name: 'auto-react-keywords',
  async all({ sock, msg, text }) {
    if (!text || !KEYWORD_REGEX.test(text)) return

    await sock.sendMessage(msg.key.remoteJid, {
      react: {
        text: randomEmoji(),
        key: msg.key
      }
    })
  }
}
