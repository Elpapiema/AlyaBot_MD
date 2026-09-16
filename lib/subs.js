import * as baileys from '@whiskeysockets/baileys'
import pino from 'pino'
import NodeCache from 'node-cache'
import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import qrcode from 'qrcode'
import { registerHandler } from '../handler.js'
import { startMaintenance } from './maintenance.js'
import chalk from 'chalk'

const makeWASocket = baileys.default ?? baileys.makeWASocket
const useMultiFileAuthState = baileys.useMultiFileAuthState
const fetchLatestBaileysVersion = baileys.fetchLatestBaileysVersion
const DisconnectReason = baileys.DisconnectReason
const makeInMemoryStore = baileys.makeInMemoryStore
const makeCacheableSignalKeyStore = baileys.makeCacheableSignalKeyStore
const jidNormalizedUser = baileys.jidNormalizedUser

const logger = pino({ level: 'silent' })
const MethodMobile = process.env.MOBILE === 'true'
const SUB_BOTS_DIR = path.resolve('./Alya-SubBots')
const SUBS_WEB_PORT = Number(process.env.SERVER_PORT || 5415)
const CODE_TOKEN_TTL_MS = Number(global.codeTokenTTLms || 10 * 60 * 1000)
const WEB_DIR = path.resolve('./lib/web')
const SUB_WATCHDOG_INTERVAL_MS = 5 * 60 * 1000

let webServerStarted = false
let watchdogStarted = false
const pendingCodeSessions = new Map()
let latestPendingCodeSessionKey = null
const pendingWatchdogRestarts = new Set()

function ensureSubBotsStore() {
  if (!Array.isArray(global.conns)) global.conns = []
}

function normalizeNumber(raw = '') {
  return String(raw).replace(/[^0-9]/g, '')
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function formatPairingCode(code = '') {
  const cleanCode = code.replace(/\s+/g, '').toUpperCase()
  if (cleanCode.length !== 8) return code
  return `${cleanCode.slice(0, 4)}-${cleanCode.slice(4, 8)}`
}

function getSessionPath(number) {
  return path.join(SUB_BOTS_DIR, normalizeNumber(number))
}

function getSubId(sock) {
  return sock.user?.id?.split(':')[0] || sock.__subNumber || 'desconocido'
}

function isActiveSubBot(number) {
  ensureSubBotsStore()
  const normalized = normalizeNumber(number)
  return global.conns.some((sock) => {
    const jid = sock.user?.id || sock.user?.jid || ''
    return sock.__subNumber === normalized || String(jid).includes(normalized)
  })
}

function hasPendingCodeSession(number) {
  const normalized = normalizeNumber(number)
  for (const session of pendingCodeSessions.values()) {
    if (session.ownerNumber === normalized) return true
  }
  return false
}

function trackSubBot(sock) {
  ensureSubBotsStore()
  if (!global.conns.includes(sock)) global.conns.push(sock)
}

function untrackSubBot(sock) {
  ensureSubBotsStore()
  const index = global.conns.indexOf(sock)
  if (index >= 0) global.conns.splice(index, 1)
}

function cleanSessionFolderKeepCreds(sessionPath) {
  try {
    const entries = fs.readdirSync(sessionPath, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.name.startsWith('pre-key')) continue
      const fullPath = path.join(sessionPath, entry.name)
      fs.rmSync(fullPath, { recursive: true, force: true })
    }
  } catch {}
}

function generateAlyaPairCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const randomChar = chars[Math.floor(Math.random() * chars.length)]
  return `ALYASUB${randomChar}`
}

async function requestPairingCodeWithRetry(sock, phoneNumber, maxAttempts = 10) {
  let lastError = null

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      console.log(`${chalk.cyanBright('[SUB-CODE] Solicitando pairing code para:')} ${phoneNumber} ${chalk.gray(`(intento ${attempt}/${maxAttempts})`)}`)
      const customCode = generateAlyaPairCode()
      const code = await sock.requestPairingCode(phoneNumber, customCode)
      console.log(`${chalk.greenBright('[SUB-CODE] Pairing code generado correctamente para:')} ${phoneNumber}`)
      return code
    } catch (error) {
      lastError = error
      const statusCode = error?.output?.statusCode ?? error?.data?.output?.statusCode
      const isClosed428 = statusCode === 428 || /Connection Closed/i.test(error?.message || '')
      console.error(
        `${chalk.redBright('[SUB-CODE] Error solicitando pairing code:')} ${error.message} ${chalk.gray(`status=${statusCode ?? 'unknown'}`)}`
      )

      if (!isClosed428 || attempt === maxAttempts) throw error
      await sleep(1500)
    }
  }

  throw lastError || new Error('No se pudo obtener pairing code')
}

async function sendQrToChat(mainSock, remoteJid, quoted, qrString) {
  const qrBuffer = await qrcode.toBuffer(qrString, { scale: 8 })
  const caption = [
    '*🔰 AlyaBot-MD 🔰*',
    '*Ser Sub-Bot (QR)*',
    '',
    '1. Abre WhatsApp en tu otro dispositivo',
    '2. Ve a Dispositivos vinculados',
    '3. Escanea este QR',
    '',
    'Este QR es de un solo uso.'
  ].join('\n')

  await mainSock.sendMessage(remoteJid, { image: qrBuffer, caption }, { quoted })
}

function buildConnectionOptions({ state, store, msgRetryCounterCache }) {
  return {
    logger: pino({ level: 'silent' }),
    mobile: MethodMobile,
    browser: ['Ubuntu', 'Edge', '24.04.3'],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(
        state.keys,
        pino({ level: 'fatal' }).child({ level: 'fatal' })
      )
    },
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    getMessage: async (key) => {
      const jid = jidNormalizedUser ? jidNormalizedUser(key.remoteJid) : key.remoteJid
      const msg = await store?.loadMessage?.(jid, key.id)
      return msg?.message || ''
    },
    msgRetryCounterCache,
    defaultQueryTimeoutMs: undefined
  }
}

function getWebBaseUrl() {
  const custom = process.env.SUBS_WEB_BASE_URL
  if (custom) return custom.replace(/\/$/, '')
  return `http://alya-n1.alyabot.xyz:${SUBS_WEB_PORT}`
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk.toString()
      if (body.length > 1e6) req.destroy()
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function parseRequestBody(raw, contentType = '') {
  const lower = contentType.toLowerCase()
  if (lower.includes('application/json')) {
    try {
      return JSON.parse(raw || '{}')
    } catch {
      return {}
    }
  }
  const params = new URLSearchParams(raw || '')
  return Object.fromEntries(params.entries())
}

function contentTypeForFile(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8'
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8'
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8'
  return 'application/octet-stream'
}

function safeJoinWebPath(urlPath = '') {
  const cleaned = urlPath.replace(/^\/+/, '')
  const target = path.join(WEB_DIR, cleaned.replace(/^web\//, ''))
  if (!target.startsWith(WEB_DIR)) return null
  return target
}

function startCodeWebServer() {
  if (webServerStarted) return
  webServerStarted = true

  const server = http.createServer(async (req, res) => {
    purgeExpiredCodeSessions()
    const url = new URL(req.url || '/', `http://localhost:${SUBS_WEB_PORT}`)

    if ((req.method === 'GET' || req.method === 'HEAD') && url.pathname === '/sub') {
      const indexPath = path.join(WEB_DIR, 'index.html')
      const html = fs.existsSync(indexPath) ? fs.readFileSync(indexPath) : null
      if (!html) {
        res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
        res.end('Archivo web no encontrado.')
        return
      }
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
      res.end(req.method === 'HEAD' ? undefined : html)
      return
    }

    if (req.method === 'GET' && url.pathname === '/sub/status') {
      const session = getLatestPendingCodeSession()
      if (!session) {
        res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ ok: false, error: 'No hay una sesion activa. Envia .code nuevamente.' }))
        return
      }
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify({
        ok: true,
        code: session?.pairingCode || '',
        connected: Boolean(session?.connected),
        connectedJid: session?.connectedJid || '',
        connectedAt: session?.connectedAt || null
      }))
      return
    }

    if (req.method === 'POST' && url.pathname === '/sub/code') {
      try {
        const body = await readBody(req)
        const payload = parseRequestBody(body, req.headers['content-type'] || '')
        const country = normalizeNumber(payload.country || '')
        const number = normalizeNumber(payload.number || '')
        const fullNumber = normalizeNumber(`${country}${number}`)

        const session = getLatestPendingCodeSession()
        if (!session || isExpiredSession(session)) {
          res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' })
          res.end(JSON.stringify({ ok: false, error: 'Sesion expirada, envia .code otra vez.' }))
          return
        }

        if (!fullNumber || fullNumber.length < 8) {
          res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' })
          res.end(JSON.stringify({ ok: false, error: 'Numero invalido.' }))
          return
        }

        if (session.targetNumber && session.targetNumber !== fullNumber) {
          res.writeHead(409, { 'content-type': 'application/json; charset=utf-8' })
          res.end(JSON.stringify({ ok: false, error: 'La solicitud ya esta ligada a otro numero. Envia .code nuevamente.' }))
          return
        }

        session.targetNumber = fullNumber
        session.updatedAt = Date.now()

        if (!session.sock) {
          await createCodeSessionSocket(session)
          await sleep(1500)
        }

        if (!session.sock) {
          throw new Error('No se pudo crear la conexion del sub-bot.')
        }

        if (session.pairingCode) {
          res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
          res.end(JSON.stringify({ ok: true, code: session.pairingCode }))
          return
        }

        const pairingCodeRaw = await requestPairingCodeWithRetry(session.sock, fullNumber)
        const formatted = formatPairingCode(pairingCodeRaw)
        session.pairingCode = formatted

        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ ok: true, code: formatted }))
      } catch (error) {
        res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ ok: false, error: `Error generando codigo: ${error.message}` }))
      }
      return
    }

    if (req.method === 'GET' && url.pathname.startsWith('/web/')) {
      const target = safeJoinWebPath(url.pathname)
      if (!target || !fs.existsSync(target)) {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
        res.end('Not found')
        return
      }
      res.writeHead(200, { 'content-type': contentTypeForFile(target) })
      res.end(fs.readFileSync(target))
      return
    }

    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('Not found')
  })

  server.listen(SUBS_WEB_PORT, () => {
    console.log(`[SUB-WEB] Activo en ${getWebBaseUrl()}/sub`)
  })

  setInterval(() => {
    purgeExpiredCodeSessions()
  }, 60 * 1000)
}

function upsertPendingCodeSession(token, data) {
  const current = pendingCodeSessions.get(token) || {}
  pendingCodeSessions.set(token, {
    ...current,
    ...data,
    expiresAt: current.expiresAt || (Date.now() + CODE_TOKEN_TTL_MS),
    updatedAt: Date.now()
  })
  latestPendingCodeSessionKey = token
}

function removePendingCodeSession(token) {
  if (!token) return
  pendingCodeSessions.delete(token)
  if (latestPendingCodeSessionKey === token) {
    latestPendingCodeSessionKey = null
  }
}

function isExpiredSession(session) {
  return !session || !session.expiresAt || Date.now() > session.expiresAt
}

function purgeExpiredCodeSessions() {
  for (const [token, session] of pendingCodeSessions.entries()) {
    if (isExpiredSession(session)) {
      pendingCodeSessions.delete(token)
      if (latestPendingCodeSessionKey === token) latestPendingCodeSessionKey = null
    }
  }
}

function getLatestPendingCodeSession() {
  if (latestPendingCodeSessionKey) {
    const current = pendingCodeSessions.get(latestPendingCodeSessionKey)
    if (current && !isExpiredSession(current)) return current
    latestPendingCodeSessionKey = null
  }

  let latest = null
  let latestKey = null
  for (const [token, session] of pendingCodeSessions.entries()) {
    if (isExpiredSession(session)) continue
    if (!latest || (session.updatedAt || 0) > (latest.updatedAt || 0)) {
      latest = session
      latestKey = token
    }
  }

  latestPendingCodeSessionKey = latestKey
  return latest
}

async function createCodeSessionSocket(session) {
  if (!session?.mainSock || !session?.targetNumber) {
    throw new Error('Sesion de codigo incompleta.')
  }

  console.log(
    `${chalk.cyanBright('[SUB-CODE] Creando socket para numero:')} ${session.targetNumber} ${chalk.gray(`owner=${session.ownerNumber || 'unknown'}`)}`
  )

  const sock = await startSubConnection({
    mainSock: session.mainSock,
    senderJid: `${session.targetNumber}@s.whatsapp.net`,
    ownerNumber: session.ownerNumber,
    requesterJid: session.requesterJid,
    remoteJid: session.remoteJid,
    quoted: session.quoted || null,
    mode: 'code',
    notify: session.notify !== false,
    sendCodeInstructions: false,
    resetSession: true
  })

  session.sock = sock
  session.updatedAt = Date.now()
  console.log(`${chalk.greenBright('[SUB-CODE] Socket creado para numero:')} ${session.targetNumber}`)
  return sock
}

function startSubWatchdog(mainSock) {
  if (watchdogStarted) return
  watchdogStarted = true

  setInterval(async () => {
    try {
      if (!mainSock || !fs.existsSync(SUB_BOTS_DIR)) return

      const entries = fs.readdirSync(SUB_BOTS_DIR, { withFileTypes: true })
      const folders = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)

      for (const folder of folders) {
        const normalized = normalizeNumber(folder)
        const credsPath = path.join(SUB_BOTS_DIR, folder, 'creds.json')
        if (!fs.existsSync(credsPath)) {
          fs.rmSync(path.join(SUB_BOTS_DIR, folder), { recursive: true, force: true })
          console.log(`${chalk.gray('[WATCHDOG] Carpeta de sub eliminada por no tener creds.json:')} ${folder}`)
          continue
        }
        if (isActiveSubBot(normalized)) continue
        if (pendingWatchdogRestarts.has(normalized)) continue

        pendingWatchdogRestarts.add(normalized)
        console.log(`${chalk.yellowBright('[WATCHDOG] Reactivando sub:')} ${normalized}`)

        startSubConnection({
          mainSock,
          senderJid: `${normalized}@s.whatsapp.net`,
          remoteJid: null,
          quoted: null,
          mode: 'qr',
          notify: false
        }).catch((error) => {
          console.error(`${chalk.redBright('[WATCHDOG] Error reactivando sub:')} ${normalized} ${error.message}`)
        }).finally(() => {
          setTimeout(() => pendingWatchdogRestarts.delete(normalized), 10_000)
        })
      }
    } catch (error) {
      console.error(`${chalk.redBright('[WATCHDOG] Error monitoreando subs:')} ${error.message}`)
    }
  }, SUB_WATCHDOG_INTERVAL_MS)
}

export async function startSubConnection({
  mainSock,
  senderJid,
  ownerNumber = null,
  requesterJid = null,
  remoteJid,
  quoted,
  mode = 'qr',
  notify = true,
  sendCodeInstructions = true,
  resetSession = false
}) {
  startMaintenance({
    mainSessionDir: path.resolve('./AlyaBot-Session'),
    subBotsDir: SUB_BOTS_DIR,
    tmpDir: '/tmp'
  })
  if (mainSock) startSubWatchdog(mainSock)

  const senderNumber = normalizeNumber(senderJid.split('@')[0])
  const requestOwnerNumber = normalizeNumber(ownerNumber || senderNumber)
  const requestRequesterJid = requesterJid || senderJid
  const useCodeWeb = mode === 'code'
  const sessionKey = useCodeWeb ? requestOwnerNumber : null

  if (useCodeWeb && sendCodeInstructions) {
    startCodeWebServer()
    upsertPendingCodeSession(sessionKey, {
      ownerNumber: requestOwnerNumber,
      requesterJid: requestRequesterJid,
      remoteJid,
      quoted,
      mainSock,
      notify,
      sock: null,
      pairingCode: null,
      targetNumber: null
    })

    if (notify && remoteJid) {
      const webUrl = `${getWebBaseUrl()}/sub`
      await mainSock.sendMessage(
        remoteJid,
        {
          text: [
            '*🟢 Sub-Bot por codigo web*',
            '',
            '1. Abre este enlace:',
            webUrl,
            '',
            '2. Selecciona tu pais',
            '3. Escribe tu numero',
            '4. Genera y usa tu codigo de vinculacion',
            '',
            'La conexion del sub-bot se creara cuando envies el numero en la web.'
          ].join('\n')
        },
        { quoted }
      ).catch(() => {})
    }

    return null
  }

  fs.mkdirSync(SUB_BOTS_DIR, { recursive: true })
  const sessionPath = getSessionPath(senderNumber)
  if (resetSession) {
    fs.rmSync(sessionPath, { recursive: true, force: true })
  }
  fs.mkdirSync(sessionPath, { recursive: true })

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
  const { version } = await fetchLatestBaileysVersion()

  const store = typeof makeInMemoryStore === 'function' ? makeInMemoryStore({ logger }) : null
  const msgRetryCounterCache = new NodeCache()

  const connectionOptions = buildConnectionOptions({ state, store, msgRetryCounterCache })
  connectionOptions.version = version

  const subSock = makeWASocket(connectionOptions)
  subSock.__subNumber = senderNumber
  store?.bind?.(subSock.ev)

  registerHandler(subSock, { isSubBot: true })
  subSock.ev.on('creds.update', saveCreds)

  let reconnectScheduled = false
  let qrDelivered = false

  if (useCodeWeb) {
    startCodeWebServer()
    upsertPendingCodeSession(sessionKey, {
      ownerNumber: requestOwnerNumber,
      requesterJid: requestRequesterJid,
      remoteJid,
      quoted,
      mainSock,
      notify,
      sock: subSock,
      pairingCode: null
    })

    if (notify && remoteJid && sendCodeInstructions) {
      const webUrl = `${getWebBaseUrl()}/sub`
      await mainSock.sendMessage(
        remoteJid,
        {
          text: [
            '*🟢 Sub-Bot por codigo web*',
            '',
            '1. Abre este enlace:',
            webUrl,
            '',
            '2. Selecciona tu pais',
            '3. Escribe tu numero',
            '4. Genera y usa tu codigo de vinculacion',
            '',
            'Nota: la web siempre usa la ultima solicitud activa.'
          ].join('\n')
        },
        { quoted }
      ).catch(() => {})
    }
  }

  const scheduleReconnect = () => {
    if (reconnectScheduled) return
    reconnectScheduled = true

    setTimeout(() => {
      reconnectScheduled = false
      startSubConnection({
        mainSock,
        senderJid,
        ownerNumber: requestOwnerNumber,
        requesterJid: requestRequesterJid,
        remoteJid,
        quoted,
        mode,
        notify,
        sendCodeInstructions: false,
        resetSession: false
      }).catch((error) => {
        console.error(`${chalk.redBright('[SUB] Error reconectando (+${senderNumber}):')} ${error.message}`)
      })
    }, 3000)
  }

  subSock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update
    const statusCode = lastDisconnect?.error?.output?.statusCode

    if (useCodeWeb) {
      const pendingCodeSession = pendingCodeSessions.get(sessionKey)
      console.log(
        `${chalk.blueBright('[SUB-CODE] connection.update ->')} ${JSON.stringify({
          number: senderNumber,
          connection: connection || null,
          statusCode: statusCode ?? null,
          registered: Boolean(state.creds?.registered),
          hasPairingCode: Boolean(pendingCodeSession?.pairingCode),
          hasQr: Boolean(qr)
        })}`
      )
    }

    if (qr && !useCodeWeb && !qrDelivered && notify && remoteJid) {
      qrDelivered = true
      await sendQrToChat(mainSock, remoteJid, quoted, qr).catch((error) => {
        console.error(`[SUB] Error enviando QR (+${senderNumber}):`, error.message)
      })
    }

    if (connection === 'open') {
      subSock.__connectedAt = Date.now()
      subSock.__sessionPath = sessionPath
      trackSubBot(subSock)
      if (useCodeWeb) {
        upsertPendingCodeSession(sessionKey, {
          ownerNumber: requestOwnerNumber,
          requesterJid: requestRequesterJid,
          remoteJid,
          quoted,
          mainSock,
          notify,
          sock: subSock,
          pairingCode: null,
          targetNumber: senderNumber,
          connected: true,
          connectedJid: getSubId(subSock),
          connectedAt: Date.now(),
          expiresAt: Date.now() + CODE_TOKEN_TTL_MS
        })
      } else {
        console.log(`${chalk.blueBright('[SUB] Sub conectado:')} ${getSubId(subSock)}`)
      }

      if (!useCodeWeb && notify && remoteJid) {
        await mainSock.sendMessage(
          remoteJid,
          { text: `✅ Sub-bot conectado: wa.me/${getSubId(subSock)}` },
          { quoted }
        ).catch(() => {})
      }
      return
    }

    if (connection === 'close') {
      const pendingCodeSession = useCodeWeb ? pendingCodeSessions.get(sessionKey) : null
      const pairingInProgress = useCodeWeb && (!state.creds.registered || Boolean(pendingCodeSession?.pairingCode))
      const loggedOut = statusCode === DisconnectReason.loggedOut
      const shouldReconnect = useCodeWeb && (!loggedOut || (pairingInProgress && statusCode === 401))

      untrackSubBot(subSock)

      if (useCodeWeb) {
        upsertPendingCodeSession(sessionKey, {
          ownerNumber: requestOwnerNumber,
          requesterJid: requestRequesterJid,
          remoteJid,
          quoted,
          mainSock,
          notify,
          sock: subSock,
          pairingCode: null,
          targetNumber: senderNumber,
          connected: false,
          connectedJid: null,
          connectedAt: null
        })
      }

      if (shouldReconnect) {
        console.log(`${chalk.yellowBright('[SUB] Reintentando conexion por codigo...')}`)
        scheduleReconnect()
      } else {
        if (useCodeWeb && notify && remoteJid) {
          await mainSock.sendMessage(
            remoteJid,
            { text: '⚠️ Conexion cerrada, por favor envia .code nuevamente.' },
            { quoted }
          ).catch(() => {})
          removePendingCodeSession(sessionKey)
        }

        cleanSessionFolderKeepCreds(sessionPath)
      }
    }
  })

  return subSock
}

export async function startSavedSubBots(mainSock = global.conn) {
  if (!mainSock || !fs.existsSync(SUB_BOTS_DIR)) return

  startSubWatchdog(mainSock)

  const entries = fs.readdirSync(SUB_BOTS_DIR, { withFileTypes: true })
  const folders = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)

  for (const folder of folders) {
    const credsPath = path.join(SUB_BOTS_DIR, folder, 'creds.json')
    if (!fs.existsSync(credsPath)) {
      fs.rmSync(path.join(SUB_BOTS_DIR, folder), { recursive: true, force: true })
      console.log(`${chalk.gray('[SUB] Carpeta eliminada por no tener creds.json:')} ${folder}`)
      continue
    }
    if (isActiveSubBot(folder)) continue

    const senderJid = `${normalizeNumber(folder)}@s.whatsapp.net`
    await startSubConnection({
      mainSock,
      senderJid,
      remoteJid: null,
      quoted: null,
      mode: 'qr',
      notify: false
    }).catch((error) => {
      console.error(`[SUB] Error restaurando (+${folder}):`, error.message)
    })

    await sleep(500)
  }
}

export { isActiveSubBot, hasPendingCodeSession }
