import { loadSettings } from '../../lib/settings.js'

const SERVERS = [
  { name: 'Servidor Masha', baseUrl: global.masha },
  { name: 'Servidor Alya', baseUrl: global.alya },
  { name: 'Servidor Masachika', baseUrl: global.masachika }
]

function getRandomServer() {
  return SERVERS[Math.floor(Math.random() * SERVERS.length)]
}

function buildCanvasUrl({ profile, text, group }) {
  const server = getRandomServer()
  const params = new URLSearchParams({
    background: 'https://files.catbox.moe/fktr0p.png',
    profile,
    text,
    group,
    font: '4.ttf',
    font2: '3.ttf',
    glitch: 'off'
  })
  return `${server.baseUrl}/canvas?${params.toString()}`
}

function resolveGroupConfig(settings, chatId) {
  const groupConfig = settings.groups?.[chatId] || {}
  return {
    welcome: groupConfig.welcome ?? settings.global?.welcome ?? false,
    msgWelcome: groupConfig.msgWelcome ?? settings.global?.msgWelcome ?? '',
    msgBye: groupConfig.msgBye ?? settings.global?.msgBye ?? '',
    msgBan: groupConfig.msgBan ?? settings.global?.msgBan ?? ''
  }
}

function applyTokens(template, values) {
  return String(template || '')
    .replace(/@user/g, values.user)
    .replace(/@group/g, values.group)
    .replace(/@desc/g, values.desc)
}

function resolveMessageByAction(action, actor, participant, config) {
  if (action === 'add') {
    return { title: 'Welcome to', message: config.msgWelcome }
  }

  if (action === 'remove') {
    const participantId = participant?.id || participant
    const isBan = actor && participantId && actor !== participantId
    if (isBan) return { title: 'Banned', message: config.msgBan }
    return { title: 'Goodbye', message: config.msgBye }
  }

  return null
}

function getParticipantRefs(participant) {
  const id = participant?.id || ''
  const phoneNumber = participant?.phoneNumber || ''
  const mentionJid = phoneNumber || id || ''
  const displayTagBase = phoneNumber || id || 'usuario'
  const displayTag = `@${String(displayTagBase).split('@')[0]}`

  return {
    id,
    phoneNumber,
    mentionJid,
    displayTag
  }
}

export default {
  name: 'welcome',
  tags: ['group'],

  async onGroupUpdate({ sock, update }) {
    const chatId = update?.id
    const participants = Array.isArray(update?.participants) ? update.participants : []
    const action = update?.action

    if (!chatId || !participants.length || !['add', 'remove'].includes(action)) return

    const settings = await loadSettings()
    const config = resolveGroupConfig(settings, chatId)
    if (!config.welcome) return

    const groupMetadata = await sock.groupMetadata(chatId).catch(() => null)
    if (!groupMetadata) return

    const subject = groupMetadata.subject || 'este grupo'
    const desc = groupMetadata.desc || 'Ups parece que este grupo no tiene descripción'
    const actor = update?.author || null

    for (const participant of participants) {
      const refs = getParticipantRefs(participant)
      const selected = resolveMessageByAction(action, actor, participant, config)
      if (!selected?.message) continue

      const profileTarget = refs.phoneNumber || refs.id
      const profileUrl = await sock.profilePictureUrl(profileTarget, 'image')
        .catch(() => 'https://files.catbox.moe/l723pi.jpg')

      const caption = applyTokens(selected.message, {
        user: refs.displayTag,
        group: subject,
        desc
      })

      const canvasUrl = buildCanvasUrl({
        profile: profileUrl,
        text: selected.title,
        group: subject
      })

      await sock.sendMessage(chatId, {
        image: { url: canvasUrl },
        caption,
        mentions: refs.mentionJid ? [refs.mentionJid] : []
      }).catch((error) => {
        console.error(`[WELCOME] Error enviando mensaje en ${chatId}:`, error.message)
      })
    }
  }
}
