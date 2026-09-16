function normalizeText(value = '') {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

const VOICE_KEYWORD_TRIGGERS = [
  {
    keywords: ['Hola Alya'],
    audioUrls: [
      'https://raw.githubusercontent.com/Elpapiema/CharHub-Store/refs/heads/main/audio-tts/Hola-Alya.ogg',
      'https://raw.githubusercontent.com/Elpapiema/CharHub-Store/refs/heads/main/audio-tts/hola-alya2.ogg'
    ],
    mimetype: 'audio/ogg; codecs=opus',
    cooldownMs: 15_000
  }

  // Agrega más opciones aquí:
  // {
  //   keywords: ['Buenos dias Alya', 'Alya despierta'],
  //   audioUrls: [
  //     'https://tu-dominio.com/otro-audio-1.ogg',
  //     'https://tu-dominio.com/otro-audio-2.ogg'
  //   ],
  //   mimetype: 'audio/ogg; codecs=opus',
  //   cooldownMs: 15000
  // }
]

function getRandomItem(items = []) {
  return items[Math.floor(Math.random() * items.length)] || null
}

function resolveAudioUrl(trigger = {}) {
  const audioUrls = Array.isArray(trigger.audioUrls)
    ? trigger.audioUrls
        .map((url) => String(url || '').trim())
        .filter((url) => /^https?:\/\//i.test(url))
    : []

  if (audioUrls.length) {
    return getRandomItem(audioUrls)
  }

  const audioUrl = String(trigger.audioUrl || '').trim()
  return /^https?:\/\//i.test(audioUrl) ? audioUrl : ''
}

function findTrigger(text = '') {
  const normalized = normalizeText(text)

  return VOICE_KEYWORD_TRIGGERS.find((trigger) => {
    const keywords = Array.isArray(trigger.keywords) ? trigger.keywords : []
    return keywords.some((keyword) => normalizeText(keyword) === normalized)
  })
}

function getCooldownMap() {
  global.__autoVoiceKeywordCooldowns ||= new Map()
  return global.__autoVoiceKeywordCooldowns
}

export default {
  name: 'auto-voice-keywords',
  tags: ['auto'],

  async all({ sock, msg, text, remoteJid }) {
    if (!text || !remoteJid || msg.key.fromMe) return

    const trigger = findTrigger(text)
    if (!trigger) return

    const audioUrl = resolveAudioUrl(trigger)
    if (!audioUrl) {
      console.warn('[AUTO VOICE] Ignorado: no hay audioUrl/audioUrls configuradas correctamente.')
      return
    }

    const cooldowns = getCooldownMap()
    const cooldownKey = `${remoteJid}:${normalizeText(text)}`
    const now = Date.now()
    const cooldownMs = Number(trigger.cooldownMs) || 0
    const lastRun = cooldowns.get(cooldownKey) || 0

    if (cooldownMs > 0 && now - lastRun < cooldownMs) return
    cooldowns.set(cooldownKey, now)

    try {
      await sock.sendPresenceUpdate('recording', remoteJid)
      await new Promise((resolve) => setTimeout(resolve, 1800))

      await sock.sendMessage(remoteJid, {
        audio: { url: audioUrl },
        ptt: true,
        mimetype: trigger.mimetype || 'audio/ogg; codecs=opus'
      }, { quoted: msg })
    } catch (error) {
      console.error('[AUTO VOICE] Error enviando audio:', error)
    } finally {
      try {
        await sock.sendPresenceUpdate('paused', remoteJid)
      } catch {}
    }
  }
}
