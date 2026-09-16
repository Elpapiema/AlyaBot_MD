/*import axios from 'axios'

export default {
  name: 'abrazar',
  command: ['abrazar'],
  tags: ['fun'],
  groupOnly: true,

  async run({ sock, msg, remoteJid, sender }) {

    let who = null

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid
      || msg.message?.contextInfo?.mentionedJid
      || []
    const quotedSender = msg.message?.extendedTextMessage?.contextInfo?.participant
      || msg.message?.contextInfo?.participant
      || null

    if (mentioned?.[0]) {
      who = mentioned[0]
    } else if (quotedSender) {
      who = quotedSender
    }

    const senderName = sender || 'alguien'

    let caption

    if (who) {
      caption = `\`${senderName}\` está dando un fuerte abrazo a \`${who}\``
    } else {
      caption = `\`${senderName}\` se está abrazando con ... Mejor omitamos eso 🤭`
    }

    try {

      await sock.sendMessage(remoteJid, {
        react: {
          text: '🤗',
          key: msg.key
        }
      })

      const response = await axios.get(
        'https://raw.githubusercontent.com/Elpapiema/CharHub-Store/refs/heads/main/video_json/SFW/abrazar.json'
      )

      const videos = response.data.videos
      const video = videos[Math.floor(Math.random() * videos.length)]

      await sock.sendMessage(remoteJid, {
        video: { url: video },
        gifPlayback: true,
        caption,
        mentions: who ? [sender, who] : [sender]
      }, { quoted: msg })

    } catch (error) {

      console.error(error)

      await sock.sendMessage(remoteJid, {
        text: '❌ Hubo un error al obtener el video.'
      }, { quoted: msg })

    }
  }
}*/
