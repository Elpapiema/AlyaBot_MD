import * as baileys from '@whiskeysockets/baileys'
import pino from 'pino'
import NodeCache from 'node-cache'
import qrcode from 'qrcode-terminal'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import fs from 'node:fs'
import path from 'node:path'
import { registerHandler } from './handler.js'
import { startSavedSubBots } from './lib/subs.js'
import { startMaintenance } from './lib/maintenance.js'
import chalk from 'chalk'

const makeWASocket = baileys.default ?? baileys.makeWASocket
const useMultiFileAuthState = baileys.useMultiFileAuthState
const fetchLatestBaileysVersion = baileys.fetchLatestBaileysVersion
const DisconnectReason = baileys.DisconnectReason
const makeInMemoryStore = baileys.makeInMemoryStore
const makeCacheableSignalKeyStore = baileys.makeCacheableSignalKeyStore
const jidNormalizedUser = baileys.jidNormalizedUser

if (!makeWASocket) {
  throw new Error('No se encontro makeWASocket en @whiskeysockets/baileys')
}

const logger = pino({ level: 'silent' })
let reconnectScheduled = false
let savedSubsBootstrapped = false
let savedSubsBootstrapTimer = null
const msgRetryCounterCache = new NodeCache()
const MethodMobile = process.env.MOBILE === 'true'
const FALLBACK_SUBS_BOOT_DELAY_MS = 60_000

function normalizePhoneNumber(rawNumber = '') {
  return rawNumber.replace(/[^0-9]/g, '')
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function askPhoneNumber() {
  const rl = createInterface({ input, output })
  const answer = await rl.question(`${chalk.greenBright('Ingresa tu numero (con codigo de pais, sin + ni espacios)')} : `)
  rl.close()
  return normalizePhoneNumber(answer)
}

function formatPairingCode(code = '') {
  const cleanCode = code.replace(/\s+/g, '').toUpperCase()
  if (cleanCode.length !== 8) return code
  return `${cleanCode.slice(0, 4)}-${cleanCode.slice(4, 8)}`
}

function generateAlyaPairCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const randomChar = chars[Math.floor(Math.random() * chars.length)]
  return `ALYABOT${randomChar}`
}

async function requestPairingCodeWithRetry(sock, phoneNumber, maxAttempts = 10) {
  let lastError = null

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {

      const customCode = generateAlyaPairCode()
      const code = await sock.requestPairingCode(phoneNumber, customCode)

      return code
    } catch (error) {
      lastError = error
      const statusCode = error?.output?.statusCode ?? error?.data?.output?.statusCode
      const isClosed428 = statusCode === 428 || /Connection Closed/i.test(error?.message || '')

      if (!isClosed428 || attempt === maxAttempts) {
        throw error
      }

      console.log(`[CONN] Pairing aun no disponible (intento ${attempt}/${maxAttempts}). Reintentando...`)
      await sleep(1500)
    }
  }

  throw lastError || new Error('No se pudo obtener pairing code')
}

function startSavedSubsOnce(sock, reason = 'manual') {
  if (savedSubsBootstrapped) return
  savedSubsBootstrapped = true

  if (savedSubsBootstrapTimer) {
    clearTimeout(savedSubsBootstrapTimer)
    savedSubsBootstrapTimer = null
  }

  console.log(`${chalk.cyanBright('[SUB] Iniciando sub-bots guardados:')} ${reason}`)
  startSavedSubBots(sock).catch((error) => {
    console.error(`${chalk.yellowBright('[SUB] Error iniciando sub-bots guardados:')} ${error.message}`)
  })
}

function scheduleSavedSubsFallback(sock, reason) {
  if (savedSubsBootstrapped || savedSubsBootstrapTimer) return

  console.log(
    `${chalk.yellowBright('[SUB] Subs guardados se activaran en 1 min si la sesion principal no abre:')} ${reason}`
  )

  savedSubsBootstrapTimer = setTimeout(() => {
    savedSubsBootstrapTimer = null
    startSavedSubsOnce(sock, reason)
  }, FALLBACK_SUBS_BOOT_DELAY_MS)
}

export async function startBot(options = {}) {

  startMaintenance({
    mainSessionDir: path.resolve('./AlyaBot-Session'),
    subBotsDir: path.resolve('./Alya-SubBots'),
    tmpDir: '/tmp'
  })

  const mainCredsPath = path.resolve('./AlyaBot-Session/creds.json')
  const mainSessionExists = fs.existsSync(mainCredsPath)
  const { state, saveCreds } = await useMultiFileAuthState('./AlyaBot-Session')
  const { version } = await fetchLatestBaileysVersion()

  const selectedMode = options.mode === 'code' || options.mode === 'qr' ? options.mode : null
  const usePairingCode = selectedMode ? selectedMode === 'code' : process.env.USE_PAIRING_CODE === 'true'
  const store = typeof makeInMemoryStore === 'function' ? makeInMemoryStore({ logger }) : null

  const connectionOptions = {
    version,
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

  const sock = makeWASocket(connectionOptions)
  store?.bind?.(sock.ev)

  registerHandler(sock)
  if (!mainSessionExists) {
    scheduleSavedSubsFallback(sock, 'no existe AlyaBot-Session/creds.json')
  }

  sock.ev.on('creds.update', saveCreds)

  const scheduleReconnect = () => {
    if (reconnectScheduled) return
    reconnectScheduled = true
    setTimeout(() => {
      reconnectScheduled = false
      startBot({ mode: selectedMode || (usePairingCode ? 'code' : 'qr') }).catch((error) => {
        console.error(`${chalk.yellowBright('[CONN] Error reintentando conexion:')} ${error.message}`)
      })
    }, 3000)
  }

  sock.ev.on('connection.update', async (update) => {

    const { connection, lastDisconnect, qr } = update

    if (qr && !usePairingCode) {
      console.log(`${chalk.greenBright('[CONN] QR generado. Escanealo desde WhatsApp.')}`)
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') {

      const botJid = sock.user?.id?.split(':')[0] || 'desconocido'
      console.log(`${chalk.greenBright('[CONN] Conexión establecida con el bot:')} ${botJid}`)

      startSavedSubsOnce(sock, 'sesion principal conectada')

      return
    }

    if (connection === 'close') {

      const statusCode = lastDisconnect?.error?.output?.statusCode
      const pairingInProgress = usePairingCode && !state.creds.registered
      const loggedOut = statusCode === DisconnectReason.loggedOut
      const shouldReconnect = !loggedOut || (pairingInProgress && statusCode === 401)

      console.log(`${chalk.redBright('[CONN] Conexion cerrada. Codigo:')} ${statusCode ?? 'unknown'}`)
      scheduleSavedSubsFallback(sock, `sesion principal cerrada (${statusCode ?? 'unknown'})`)

      if (shouldReconnect) {
        console.log(`${chalk.yellowBright('[CONN] Reintentando conexion...')}`)
        scheduleReconnect()
      } else {
        console.log(`${chalk.redBright('[CONN] Sesion cerrada. Borra /AlyaBot-Session para volver a vincular.')}`)
      }
    }

  })

  if (usePairingCode && !state.creds.registered) {

    let phoneNumber = normalizePhoneNumber(process.env.PHONE_NUMBER)

    if (!phoneNumber) {
      phoneNumber = await askPhoneNumber()
    }

    if (!phoneNumber) {
      throw new Error(`${chalk.redBright('[CONN] No se proporciono numero valido para pairing code')}`)
    }

    try {

      const pairingCode = await requestPairingCodeWithRetry(sock, phoneNumber)

      console.log(`${chalk.greenBright('[CONN] Codigo de conexion:')} ${formatPairingCode(pairingCode)}`)

    } catch (error) {

      const statusCode = error?.output?.statusCode ?? error?.data?.output?.statusCode

      console.error(`${chalk.redBright('[CONN] No se pudo obtener pairing code (status:')} ${statusCode ?? 'unknown'}): ${error.message}`)
      console.log(`${chalk.yellowBright('[CONN] El bot seguira intentando reconectar automaticamente.')}`)

    }

  }

  return sock
}
