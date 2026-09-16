const form = document.getElementById('code-form')
const errorBox = document.getElementById('error')
const successBox = document.getElementById('success')
const codeBox = document.getElementById('code-box')
const codeValue = document.getElementById('code-value')
const intro = document.getElementById('intro')
let statusPollTimer = null

const backgroundImageUrl =
  'https://raw.githubusercontent.com/Elpapiema/Elpapiema/refs/heads/main/assets/pc3.jpg'

const rootStyle = document.documentElement.style

function setCssVar(name, value) {
  rootStyle.setProperty(name, value)
}

function mixColor(colorA, colorB, amount) {
  return {
    r: Math.round(colorA.r * (1 - amount) + colorB.r * amount),
    g: Math.round(colorA.g * (1 - amount) + colorB.g * amount),
    b: Math.round(colorA.b * (1 - amount) + colorB.b * amount)
  }
}

function colorToRgb({ r, g, b }) {
  return `rgb(${r} ${g} ${b})`
}

function relativeLuminance({ r, g, b }) {
  const toLinear = (value) => {
    const channel = value / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  }
  const rLin = toLinear(r)
  const gLin = toLinear(g)
  const bLin = toLinear(b)
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin
}

function saturationScore(r, g, b) {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max === 0) return 0
  return (max - min) / max
}

function pickAccent(pixels) {
  let best = null
  let bestScore = 0
  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3]
    if (alpha < 200) continue
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    const sat = saturationScore(r, g, b)
    const lum = relativeLuminance({ r, g, b })
    if (lum < 0.2 || lum > 0.9) continue
    const score = sat * 0.7 + lum * 0.3
    if (score > bestScore) {
      bestScore = score
      best = { r, g, b }
    }
  }
  return best
}

function applyPalette({ average, accent }) {
  const darkBase = mixColor(average, { r: 0, g: 0, b: 0 }, 0.6)
  const cardBase = mixColor(average, { r: 0, g: 0, b: 0 }, 0.35)
  const border = mixColor(cardBase, { r: 255, g: 255, b: 255 }, 0.12)
  const input = mixColor(cardBase, { r: 0, g: 0, b: 0 }, 0.12)

  let accentBase = accent || mixColor(average, { r: 255, g: 255, b: 255 }, 0.2)
  const accentLum = relativeLuminance(accentBase)
  if (accentLum < 0.35) {
    accentBase = mixColor(accentBase, { r: 255, g: 255, b: 255 }, 0.3)
  }

  const textIsLight = relativeLuminance(cardBase) < 0.45
  const textColor = textIsLight ? { r: 245, g: 247, b: 251 } : { r: 15, g: 20, b: 26 }
  const muted = mixColor(textColor, cardBase, 0.3)

  setCssVar('--bg-color', colorToRgb(darkBase))
  setCssVar('--card-color', colorToRgb(cardBase))
  setCssVar('--border-color', colorToRgb(border))
  setCssVar('--input-bg', colorToRgb(input))
  setCssVar('--input-border', colorToRgb(border))
  setCssVar('--text-color', colorToRgb(textColor))
  setCssVar('--muted-color', colorToRgb(muted))

  const codeBg = mixColor(accentBase, { r: 0, g: 0, b: 0 }, 0.65)
  const codeText = mixColor(accentBase, { r: 255, g: 255, b: 255 }, 0.6)
  const codeBorder = mixColor(accentBase, { r: 255, g: 255, b: 255 }, 0.2)
  setCssVar('--code-bg', colorToRgb(codeBg))
  setCssVar('--code-text', colorToRgb(codeText))
  setCssVar('--code-border', colorToRgb(codeBorder))
}

async function loadBackgroundAndTheme() {
  if (!backgroundImageUrl || backgroundImageUrl.includes('your-user')) return
  setCssVar('--bg-image', `url("${backgroundImageUrl}")`)

  const image = new Image()
  image.crossOrigin = 'anonymous'
  image.src = backgroundImageUrl

  try {
    await image.decode()
  } catch (error) {
    console.warn('No se pudo cargar la imagen de fondo.', error)
    return
  }

  const canvas = document.createElement('canvas')
  const size = 60
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return
  ctx.drawImage(image, 0, 0, size, size)
  const { data } = ctx.getImageData(0, 0, size, size)

  let rSum = 0
  let gSum = 0
  let bSum = 0
  let count = 0

  for (let i = 0; i < data.length; i += 16) {
    const alpha = data[i + 3]
    if (alpha < 200) continue
    rSum += data[i]
    gSum += data[i + 1]
    bSum += data[i + 2]
    count += 1
  }

  if (!count) return

  const average = {
    r: Math.round(rSum / count),
    g: Math.round(gSum / count),
    b: Math.round(bSum / count)
  }
  const accent = pickAccent(data)

  applyPalette({ average, accent })
}

function showError(message) {
  errorBox.textContent = message
  errorBox.classList.remove('hidden')
}

function clearError() {
  errorBox.textContent = ''
  errorBox.classList.add('hidden')
}

function showSuccess(message) {
  successBox.textContent = message
  successBox.classList.remove('hidden')
}

function clearSuccess() {
  successBox.textContent = ''
  successBox.classList.add('hidden')
}

function showCode(code) {
  if (!code) return
  codeValue.textContent = code
  codeBox.classList.remove('hidden')
}

function formatConnectedText(jid) {
  if (!jid) return 'Sub conectado correctamente.'
  const number = String(jid).split('@')[0]
  return `Sub conectado: wa.me/${number}`
}

function stopStatusPolling() {
  if (!statusPollTimer) return
  clearInterval(statusPollTimer)
  statusPollTimer = null
}

function startStatusPolling() {
  if (statusPollTimer) return
  statusPollTimer = setInterval(() => {
    fetchStatus().catch(() => {})
  }, 2000)
}

async function fetchStatus() {
  const res = await fetch('/sub/status')
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.ok) {
    showError(data.error || 'No hay una sesion activa. Envia .code nuevamente.')
    clearSuccess()
    stopStatusPolling()
    return
  }
  clearError()
  if (data.code) showCode(data.code)
  if (data.connected) {
    showSuccess(formatConnectedText(data.connectedJid))
    stopStatusPolling()
    return
  }
  clearSuccess()
  if (data.code) startStatusPolling()
}

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  clearError()
  clearSuccess()

  const payload = {
    country: document.getElementById('country').value,
    number: document.getElementById('number').value
  }

  const res = await fetch('/sub/code', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.ok) {
    showError(data.error || 'No se pudo generar el codigo.')
    return
  }
  showCode(data.code)
  startStatusPolling()
})

fetchStatus().catch(() => {
  showError('No se pudo verificar la sesion activa. Intenta de nuevo.')
})

loadBackgroundAndTheme().catch((error) => {
  console.warn('No se pudo aplicar el tema dinamico.', error)
})

if (intro) {
  intro.addEventListener('animationend', (event) => {
    if (event.animationName === 'intro-fade') {
      document.body.classList.remove('is-loading')
      intro.remove()
    }
  })
}
