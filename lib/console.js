import chalk from 'chalk'

function bytesToHuman(size) {
  if (!size) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const power = Math.floor(Math.log(size) / Math.log(1000))
  const safePower = Math.min(Math.max(power, 0), units.length - 1)
  const value = size / (1000 ** safePower)
  return `${value.toFixed(1)} ${units[safePower]}`
}

function getMessageType(message = {}) {
  if (!message || typeof message !== 'object') return 'Desconocido'
  const firstKey = Object.keys(message)[0]
  if (!firstKey) return 'Desconocido'
  return firstKey.replace(/message$/i, '').replace(/^./, (v) => v.toUpperCase())
}

function estimateMessageSize(msg) {
  try {
    return Buffer.byteLength(JSON.stringify(msg?.message || {}), 'utf8')
  } catch {
    return 0
  }
}

function formatTimeFromMessage(msg) {
  const raw = msg?.messageTimestamp
  if (!raw) return new Date().toTimeString().split(' ')[0]
  const secs = typeof raw === 'number' ? raw : (raw.low || Number(raw) || Math.floor(Date.now() / 1000))
  return new Date(secs * 1000).toTimeString().split(' ')[0]
}

function extractText(message = {}) {
  return (
    message.conversation
    || message.extendedTextMessage?.text
    || message.imageMessage?.caption
    || message.videoMessage?.caption
    || message.buttonsResponseMessage?.selectedButtonId
    || message.listResponseMessage?.singleSelectReply?.selectedRowId
    || message.text
    || ''
  )
}

export function logMessage({ sock, msg, text, sender, chat, direction = 'in', isSubBot = false }) {
  const me = sock.user?.id?.split(':')[0] || 'desconocido'
  const botName = sock.user?.name || 'Sin nombre'
  const filesize = estimateMessageSize(msg)
  const mtype = getMessageType(msg.message)
  const bodyText = String(text ?? extractText(msg.message) ?? '').trim()
  const dirText = direction === 'out' ? 'SALIENTE' : 'ENTRANTE'
  const botTag = isSubBot ? ' (sub bot)' : ''

  console.log(chalk.redBright(`╔══════════════ ⋆⋅★彡[ᴀʟʏᴀ-ʙᴏᴛ${botTag}]彡★⋅⋆ ════════════════•| ⊱✿⊰ |•`))
  console.log(chalk.magentaBright('║'))
  console.log(`${chalk.yellowBright('╠═')} 🔧  ${chalk.redBright('Bot:')} ${chalk.greenBright(me)} ~${chalk.magentaBright(botName)}`)
  console.log(`${chalk.greenBright('╠═')} 🔁  ${chalk.yellowBright('Direccion:')} ${chalk.whiteBright(dirText)}`)
  console.log(`${chalk.cyanBright('╠═')} 🕒  ${chalk.yellowBright('Fecha:')} ${chalk.blueBright(formatTimeFromMessage(msg))}`)
  console.log(`${chalk.magentaBright('╠═')} 📌  ${chalk.greenBright('Tipo de evento:')} ${chalk.redBright(msg.messageStubType ? String(msg.messageStubType) : 'Ninguno')}`)
  console.log(`${chalk.yellowBright('╠═')} 🧱  ${chalk.magentaBright('Peso del mensaje:')} ${chalk.yellowBright(`${filesize} B`)} [${chalk.cyanBright(bytesToHuman(filesize))}]`)
  console.log(`${chalk.cyanBright('╠═')} 📤  ${chalk.blueBright('Remitente:')} ${chalk.redBright(sender)}`)
  console.log(`${chalk.magentaBright('╠═')} 💬  ${chalk.cyanBright('Chat:')} ${chalk.redBright(chat)}`)
  console.log(`${chalk.blueBright('╠═')} 📨  ${chalk.magentaBright('Tipo de mensaje:')} ${chalk.yellowBright(mtype)}`)
  if (bodyText) {
    console.log(`${chalk.greenBright('╠═')} 📝  ${chalk.yellowBright('Texto:')} ${chalk.whiteBright(bodyText)}`)
  }
  console.log(chalk.redBright('╚════════ ⋆⋅·͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙⁺˚*•̩̩͙ ᴄᴏɴꜱᴏʟᴇ •̩̩͙*˚⁺‧͙⁺˚*•̩̩͙✩•̩̩͙*˚⁺‧͙⋅⋆ ════════════•| ⊱✿⊰ |•'))
}
