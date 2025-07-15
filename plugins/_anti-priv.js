import fs from 'fs'

const WARN_PATH = './database/warns.json'
const SETTINGS_PATH = './databse/settings.json'

// Leer configuración
function loadSettings() {
  if (!fs.existsSync(SETTINGS_PATH)) return { global: {} }
  return JSON.parse(fs.readFileSync(SETTINGS_PATH))
}

// Leer advertencias
function loadWarns() {
  if (!fs.existsSync(WARN_PATH)) fs.writeFileSync(WARN_PATH, '{}')
  return JSON.parse(fs.readFileSync(WARN_PATH))
}

// Guardar advertencias
function saveWarns(data) {
  fs.writeFileSync(WARN_PATH, JSON.stringify(data, null, 2))
}

// Palabras y emojis permitidos
const palabras = ['piedra', 'papel', 'tijera']
const emojis = ['🪨', '📄', '✂️']

export async function before(m, { conn, isOwner }) {
  const settings = loadSettings()
  const antiprivado = settings?.global?.antiprivado

  if (!antiprivado) return
  if (m.isGroup) return
  if (isOwner) return

  const texto = (m.text || '').toLowerCase().replace(/\s+/g, ' ').trim()

  // Casos permitidos:
  const esSoloPpt = texto === 'ppt'
  const esSoloJugada = palabras.includes(texto) || emojis.includes(texto)
  const esComboValido = texto.startsWith('ppt ') && (
    palabras.includes(texto.slice(4)) || emojis.includes(texto.slice(4))
  )

  if (esSoloPpt || esSoloJugada || esComboValido) return // No advertir

  // Sistema de advertencia
  const warns = loadWarns()
  const id = m.sender
  warns[id] = (warns[id] || 0) + 1

  if (warns[id] >= 3) {
    await conn.sendMessage(id, {
      text: '🚫 Ukyuu~ Senpai, has sido bloqueado permanentemente por contactar al bot en privado sin permiso, da~ ❄️💔 \n Lo siento, pero no hay vuelta atrás... \n ¡Por favor, respeta las reglas desde ahora! 🌸⚔️'
    })
    await conn.updateBlockStatus(id, 'block')
  } else {
    await conn.sendMessage(id, {
      text: `⚠️ Ukyuu~ Senpai, no puedes contactarme en privado, da~ ❄️💻
Esta es tu advertencia ${warns[id]} de 3…
Por favor, ten cuidado para no llegar al límite~ 🌸💥`
    })
  }

  saveWarns(warns)
}
