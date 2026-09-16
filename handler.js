import { promises as fs } from 'node:fs'
import { createWriteStream } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import { randomUUID } from 'node:crypto'
import { logMessage } from './lib/console.js'
import chalk from 'chalk'
import { isAdminModeForGroup, isBotEnabledForGroup } from './lib/settings.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const pluginsDir = path.join(__dirname, 'plugins')
const rawPrefix = process.env.PREFIX || ''
const prefixList = rawPrefix
  ? rawPrefix.split(/[\s,]+/).map((p) => p.trim()).filter(Boolean)
  : ['.', '#', '!']
const defaultPrefix = prefixList[0] || '.'
const TMP_DIR = '/tmp'
const OUTGOING_MEDIA_KEYS = ['image', 'video', 'audio', 'document', 'sticker']
const GROUP_COMMAND_LOCK_TTL_MS = 2000
const MESSAGE_COMMAND_LOCK_TTL_MS = 5000

function isHttpUrl(value) {
  return /^https?:\/\//i.test(String(value || '').trim())
}

function sanitizeExt(ext, fallback = '.bin') {
  if (!ext) return fallback
  const cleaned = String(ext).toLowerCase().replace(/[^a-z0-9.]/g, '')
  if (!cleaned) return fallback
  return cleaned.startsWith('.') ? cleaned : `.${cleaned}`
}

function guessExt(urlValue, contentType, mediaKey = 'file') {
  const byUrl = path.extname(String(urlValue || '').split('?')[0] || '')
  if (byUrl) return sanitizeExt(byUrl)

  const mime = String(contentType || '').split(';')[0].trim().toLowerCase()
  if (mime) {
    if (mime.includes('jpeg')) return '.jpg'
    if (mime.includes('png')) return '.png'
    if (mime.includes('webp')) return '.webp'
    if (mime.includes('gif')) return '.gif'
    if (mime.includes('mp4')) return '.mp4'
    if (mime.includes('webm')) return '.webm'
    if (mime.includes('mpeg')) return '.mp3'
    if (mime.includes('ogg')) return '.ogg'
    if (mime.includes('wav')) return '.wav'
    if (mime.includes('pdf')) return '.pdf'
  }

  if (mediaKey === 'image') return '.jpg'
  if (mediaKey === 'video') return '.mp4'
  if (mediaKey === 'audio') return '.mp3'
  if (mediaKey === 'sticker') return '.webp'
  return '.bin'
}

async function downloadUrlToTmp(urlValue, mediaKey = 'file') {
  await fs.mkdir(TMP_DIR, { recursive: true })
  const response = await fetch(urlValue)
  if (!response.ok) {
    throw new Error(`No se pudo descargar media (${response.status})`)
  }

  const ext = guessExt(urlValue, response.headers.get('content-type'), mediaKey)
  const filePath = path.join(TMP_DIR, `alya-${mediaKey}-${Date.now()}-${randomUUID()}${ext}`)

  if (response.body) {
    await pipeline(Readable.fromWeb(response.body), createWriteStream(filePath))
  } else {
    const buffer = Buffer.from(await response.arrayBuffer())
    await fs.writeFile(filePath, buffer)
  }

  return filePath
}

async function materializeMediaValueToTmp(value, mediaKey) {
  if (!value) return value

  if (typeof value === 'string') {
    if (!isHttpUrl(value)) return value
    return { url: await downloadUrlToTmp(value, mediaKey) }
  }

  if (typeof value === 'object' && typeof value.url === 'string' && isHttpUrl(value.url)) {
    return {
      ...value,
      url: await downloadUrlToTmp(value.url, mediaKey)
    }
  }

  return value
}

async function materializeOutgoingContentToTmp(content) {
  if (!content || typeof content !== 'object') return content

  const prepared = { ...content }
  for (const key of OUTGOING_MEDIA_KEYS) {
    if (!(key in prepared)) continue
    prepared[key] = await materializeMediaValueToTmp(prepared[key], key)
  }

  return prepared
}

function ownerEntryVariants(value = '') {
  const raw = String(value || '').trim().toLowerCase()
  if (!raw) return []

  const idPart = raw.split('@')[0]
  const digits = raw.replace(/[^0-9]/g, '')
  return Array.from(new Set([raw, idPart, digits].filter(Boolean)))
}

function flattenOwnerValues(input) {
  const result = []
  const stack = Array.isArray(input) ? [...input] : [input]

  while (stack.length) {
    const current = stack.pop()
    if (Array.isArray(current)) {
      stack.push(...current)
      continue
    }
    if (current === null || current === undefined) continue
    result.push(current)
  }

  return result
}

function getOwnerSet() {
  const globalOwners = flattenOwnerValues(global.owner)
  const envOwners = (process.env.BOT_OWNER || '').split(',').map((v) => v.trim()).filter(Boolean)
  const all = [...globalOwners, ...envOwners]

  const set = new Set()
  for (const owner of all) {
    for (const variant of ownerEntryVariants(owner)) {
      set.add(variant)
    }
  }
  return set
}

function isOwnerIdentity(sender, sock) {
  const ownerSet = getOwnerSet()
  const senderVariants = ownerEntryVariants(sender)
  const botVariants = ownerEntryVariants(sock.user?.id || '')

  for (const variant of [...senderVariants, ...botVariants]) {
    if (ownerSet.has(variant)) return true
  }

  const senderRaw = String(sender || '').toLowerCase()
  const botRaw = String(sock.user?.id || '').toLowerCase()
  if (senderRaw && botRaw && senderRaw === botRaw) return true

  return false
}

function getGroupCommandLocks() {
  if (!global.__groupCommandLocks) global.__groupCommandLocks = new Map()
  return global.__groupCommandLocks
}

function isGroupLocked(remoteJid, sock) {
  const locks = getGroupCommandLocks()
  const entry = locks.get(remoteJid)
  if (!entry) return false
  if (Date.now() > entry.expiresAt) {
    locks.delete(remoteJid)
    return false
  }
  const ownerId = entry.ownerId || ''
  const currentId = sock.user?.id || ''
  if (ownerId && currentId && ownerId === currentId) return false
  return true
}

function setGroupLock(remoteJid, sock) {
  const locks = getGroupCommandLocks()
  locks.set(remoteJid, {
    ownerId: sock.user?.id || '',
    expiresAt: Date.now() + GROUP_COMMAND_LOCK_TTL_MS
  })
}

function getMessageCommandLocks() {
  if (!global.__messageCommandLocks) global.__messageCommandLocks = new Map()
  return global.__messageCommandLocks
}

function trySetMessageLock(messageId, sock) {
  if (!messageId) return true
  const locks = getMessageCommandLocks()
  const now = Date.now()
  const entry = locks.get(messageId)
  if (entry && now <= entry.expiresAt && entry.ownerId && entry.ownerId !== (sock.user?.id || '')) {
    return false
  }
  locks.set(messageId, {
    ownerId: sock.user?.id || '',
    expiresAt: now + MESSAGE_COMMAND_LOCK_TTL_MS
  })
  return true
}

class PluginManager {
  constructor() {
    this.plugins = new Map()
    this.scanInterval = null
    this.fileState = new Map()
    this.initPromise = null
  }

  async init() {
    if (this.initPromise) return this.initPromise
    this.initPromise = this.initOnce()
    return this.initPromise
  }

  async initOnce() {
    await fs.mkdir(pluginsDir, { recursive: true })
    await this.syncPlugins(true)
    this.watch()
  }

  async collectPluginFiles(dirPath = pluginsDir) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true }).catch(() => [])
    const files = []

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      if (entry.isDirectory()) {
        const nested = await this.collectPluginFiles(fullPath)
        files.push(...nested)
        continue
      }
      if (!entry.name.endsWith('.js')) continue

      const relPath = path.relative(pluginsDir, fullPath)
      const stat = await fs.stat(fullPath).catch(() => null)
      if (!stat) continue
      files.push({ relPath, mtimeMs: stat.mtimeMs })
    }

    return files
  }

  async syncPlugins(initial = false) {
    const files = await this.collectPluginFiles()
    const next = new Set(files.map((f) => f.relPath))

    for (const oldFile of this.fileState.keys()) {
      if (next.has(oldFile)) continue
      this.unloadByFile(oldFile)
      this.fileState.delete(oldFile)
    }

    for (const file of files) {
      const prevMtime = this.fileState.get(file.relPath)
      if (prevMtime === file.mtimeMs) continue

      this.unloadByFile(file.relPath)
      await this.loadFile(file.relPath)
      this.fileState.set(file.relPath, file.mtimeMs)
    }

    if (initial) {
      console.log(`${chalk.cyanBright('[PLUGINS] Cargados:')} ${this.plugins.size}`)
    }
  }

  async loadFile(fileName) {
    const fullPath = path.join(pluginsDir, fileName)
    const moduleUrl = `${pathToFileURL(fullPath).href}?update=${Date.now()}`

    try {
      const imported = await import(moduleUrl)
      const rawPlugin = imported.default ?? imported.plugin
      const plugin = this.normalizePlugin(rawPlugin, fileName)

      if (!plugin) {
        console.log(`${chalk.yellowBright('[PLUGINS]')} ${fileName} ignorado: formato de plugin no compatible`)
        return
      }

      const pluginName = plugin.name || path.basename(fileName, '.js')
      this.plugins.set(pluginName, { ...plugin, __fileName: fileName })
      console.log(`${chalk.magentaBright('[PLUGINS]')} Cargado ${fileName}${plugin.__legacy ? ' (Legacy)' : ''}`)
    } catch (error) {
      console.error(`${chalk.redBright('[PLUGINS]')} Error cargando ${fileName}:`, error.message)
    }
  }

  normalizePlugin(rawPlugin, fileName) {
    const defaultName = path.basename(fileName, '.js')

    if (typeof rawPlugin === 'function') {
      return {
        __legacy: true,
        name: rawPlugin.name || defaultName,
        command: rawPlugin.command,
        customPrefix: rawPlugin.customPrefix,
        help: rawPlugin.help,
        tags: rawPlugin.tags,
        groupOnly: Boolean(rawPlugin.groupOnly || rawPlugin.group),
        privateOnly: Boolean(rawPlugin.privateOnly || rawPlugin.private),
        adminOnly: Boolean(rawPlugin.adminOnly || rawPlugin.admin),
        ownerOnly: Boolean(rawPlugin.ownerOnly || rawPlugin.rowner),
        onGroupUpdate: rawPlugin.onGroupUpdate,
        all: rawPlugin.all,
        run: async (ctx) => {
          const m = createLegacyMessage(ctx)
          return rawPlugin(m, {
            text: ctx.args.join(' ').trim(),
            conn: ctx.sock,
            command: ctx.commandName,
            args: ctx.args,
            usedPrefix: ctx.usedPrefix,
            noPrefix: ctx.noPrefix,
            isAdmin: ctx.isAdmin,
            isOwner: ctx.isOwner,
            isGroup: ctx.isGroup,
            sender: ctx.sender,
            chat: ctx.remoteJid,
            groupMetadata: ctx.groupMetadata
          })
        }
      }
    }

    if (rawPlugin && typeof rawPlugin === 'object') {
      const run = rawPlugin.run ?? rawPlugin.handler
      const hasAll = typeof rawPlugin.all === 'function'
      const hasGroupUpdate = typeof rawPlugin.onGroupUpdate === 'function'
      if (typeof run !== 'function' && !hasAll && !hasGroupUpdate) return null

      return {
        ...rawPlugin,
        name: rawPlugin.name || defaultName,
        customPrefix: rawPlugin.customPrefix,
        groupOnly: Boolean(rawPlugin.groupOnly || rawPlugin.group),
        privateOnly: Boolean(rawPlugin.privateOnly || rawPlugin.private),
        adminOnly: Boolean(rawPlugin.adminOnly || rawPlugin.admin),
        ownerOnly: Boolean(rawPlugin.ownerOnly || rawPlugin.rowner),
        run: typeof run === 'function' ? run : async () => {}
      }
    }

    return null
  }

  unloadByFile(fileName) {
    for (const [name, plugin] of this.plugins.entries()) {
      if (plugin.__fileName === fileName) {
        this.plugins.delete(name)
        console.log(`[PLUGINS] Eliminado: ${name}`)
      }
    }
  }

  watch() {
    this.scanInterval = setInterval(() => {
      this.syncPlugins(false).catch((error) => {
        console.error('[PLUGINS] Error sincronizando plugins:', error.message)
      })
    }, 2_000)
  }

  matchPlugin(commandName, options = {}) {
    const { ignoreCustomPrefix = false } = options

    for (const plugin of this.plugins.values()) {
      if (ignoreCustomPrefix && plugin.customPrefix) continue
      if (!plugin.command) continue

      if (typeof plugin.command === 'string' && plugin.command.toLowerCase() === commandName) return plugin

      if (Array.isArray(plugin.command) && plugin.command.some((cmd) => String(cmd).toLowerCase() === commandName)) return plugin

      if (plugin.command instanceof RegExp) {
        plugin.command.lastIndex = 0
        if (plugin.command.test(commandName)) return plugin
      }
    }

    return null
  }
}

function getSharedPluginManager() {
  if (!global.__sharedPluginManager) {
    global.__sharedPluginManager = new PluginManager()
  }
  return global.__sharedPluginManager
}

function getTextFromMessage(message = {}) {
  return (
    message.conversation
    || message.extendedTextMessage?.text
    || message.imageMessage?.caption
    || message.videoMessage?.caption
    || message.buttonsResponseMessage?.selectedButtonId
    || message.listResponseMessage?.singleSelectReply?.selectedRowId
    || ''
  )
}

async function isAdmin(sock, jid, userJid) {
  try {
    const metadata = await sock.groupMetadata(jid)
    const participant = metadata.participants.find((p) => p.id === userJid)
    return participant?.admin === 'admin' || participant?.admin === 'superadmin'
  } catch {
    return false
  }
}

function getSenderJid(msg) {
  if (msg.key.participant) return msg.key.participant
  return msg.key.remoteJid
}

function matchCustomPrefixPrefix(customPrefix, text) {
  if (!customPrefix || !text) return null

  if (typeof customPrefix === 'string') {
    return text.startsWith(customPrefix) ? customPrefix : null
  }

  if (customPrefix instanceof RegExp) {
    customPrefix.lastIndex = 0
    const match = customPrefix.exec(text)
    return match && match.index === 0 ? match[0] : null
  }

  if (Array.isArray(customPrefix)) {
    for (const item of customPrefix) {
      const found = matchCustomPrefixPrefix(item, text)
      if (found) return found
    }
  }

  return null
}

function matchDefaultPrefix(text) {
  if (!text) return null
  for (const p of prefixList) {
    if (text.startsWith(p)) return p
  }
  return null
}

async function handleDisabledBotCommand(sock, msg, remoteJid, commandName) {
  if (commandName === 'bot') return false
  await sock.sendMessage(
    remoteJid,
    { text: 'alyabot esta desactivada en este grupo' },
    { quoted: msg }
  )
  return true
}

async function handleAdminModeCommand(sock, msg, remoteJid, commandName, senderIsAdmin) {
  if (commandName === 'on' || commandName === 'off') return false
  if (senderIsAdmin) return false
  await sock.sendMessage(
    remoteJid,
    { text: 'solo los admins del grupo pueden ejecutar comandos mientras modoadmin esta activado' },
    { quoted: msg }
  )
  return true
}

async function sendPrefixSignals(sock, msg, remoteJid) {
  try {
    await sock.readMessages([msg.key])
  } catch {}
  try {
    await sock.sendPresenceUpdate('composing', remoteJid)
  } catch {}
}

async function stopPrefixSignals(sock, remoteJid, delayMs = 0) {
  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }
  try {
    await sock.sendPresenceUpdate('paused', remoteJid)
  } catch {}
}

function matchesCommandCondition(command, commandName) {
  if (!command) return true
  if (typeof command === 'string') return command.toLowerCase() === commandName
  if (Array.isArray(command)) return command.some((cmd) => String(cmd).toLowerCase() === commandName)
  if (command instanceof RegExp) {
    command.lastIndex = 0
    return command.test(commandName)
  }
  return false
}

function createLegacyMessage(ctx) {
  return {
    ...ctx.msg,
    chat: ctx.remoteJid,
    sender: ctx.sender,
    isGroup: ctx.isGroup,
    text: ctx.text,
    body: ctx.text,
    fromMe: ctx.msg.key.fromMe,
    reply: async (text) => {
      return ctx.sock.sendMessage(ctx.remoteJid, { text: String(text) }, { quoted: ctx.msg })
    }
  }
}

function createCompatSendFile(sock) {
  return async (jid, file, fileName = 'file', caption = '', quoted = null, options = {}) => {
    const lower = String(fileName).toLowerCase()
    const message = { ...options }

    if (lower.endsWith('.mp4') || lower.endsWith('.mkv') || lower.endsWith('.mov') || lower.endsWith('.webm')) {
      message.video = typeof file === 'string' ? { url: file } : file
      if (caption) message.caption = caption
      return sock.sendMessage(jid, message, quoted ? { quoted } : {})
    }

    if (lower.endsWith('.mp3') || lower.endsWith('.m4a') || lower.endsWith('.wav') || lower.endsWith('.ogg')) {
      message.audio = typeof file === 'string' ? { url: file } : file
      message.mimetype = message.mimetype || 'audio/mpeg'
      return sock.sendMessage(jid, message, quoted ? { quoted } : {})
    }

    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp')) {
      message.image = typeof file === 'string' ? { url: file } : file
      if (caption) message.caption = caption
      return sock.sendMessage(jid, message, quoted ? { quoted } : {})
    }

    message.document = typeof file === 'string' ? { url: file } : file
    message.fileName = fileName
    if (caption) message.caption = caption
    return sock.sendMessage(jid, message, quoted ? { quoted } : {})
  }
}

export function registerHandler(sock, options = {}) {
  const manager = getSharedPluginManager()
  const isSubBot = Boolean(options.isSubBot)
  sock.sendFile = createCompatSendFile(sock)
  if (!isSubBot) global.conn = sock

  if (!sock.__debugSendLogWrapped) {
    const originalSendMessage = sock.sendMessage.bind(sock)
    sock.sendMessage = async (jid, content = {}, opts = {}) => {
      const preparedContent = await materializeOutgoingContentToTmp(content)

      try {
        logMessage({
          sock,
          msg: { message: preparedContent, messageTimestamp: Math.floor(Date.now() / 1000) },
          text: '',
          sender: sock.user?.id?.split(':')[0] || 'desconocido',
          chat: jid,
          direction: 'out',
          isSubBot
        })
      } catch {}

      return originalSendMessage(jid, preparedContent, opts)
    }
    sock.__debugSendLogWrapped = true
  }

  manager.init().catch((error) => {
    console.error('[PLUGINS] Error inicializando plugins:', error.message)
  })

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return

    for (const msg of messages) {
      try {
        const allowBotCommands = global.allowBotCommands === true
        if (!msg.message) continue

        const remoteJid = msg.key.remoteJid
        const sender = getSenderJid(msg)
        const text = getTextFromMessage(msg.message).trim()
        const isGroup = remoteJid.endsWith('@g.us')
        let groupMetadata = null
        let prefixSignalsSent = false
        logMessage({ sock, msg, text, sender, chat: remoteJid, direction: 'in', isSubBot })

        for (const plugin of manager.plugins.values()) {
          if (typeof plugin.all === 'function') {
            await plugin.all({ sock, msg, text, isGroup, sender, remoteJid, prefix: defaultPrefix })
          }
        }

        if (msg.key.fromMe && !allowBotCommands) continue

        const isOwner = isOwnerIdentity(sender, sock)
        let executed = false

        const executePlugin = async (plugin, usedPrefixValue, noPrefixValue, commandNameValue, argsValue) => {
          let admin = false

          const messageId = msg?.key?.id || msg?.key?.participant || ''
          if (!trySetMessageLock(messageId, sock)) {
            return false
          }

          if (plugin.groupOnly && !isGroup) {
            await sock.sendMessage(remoteJid, { text: 'Este comando solo funciona en grupos.' }, { quoted: msg })
            return false
          }

          if (plugin.privateOnly && isGroup) {
            await sock.sendMessage(remoteJid, { text: 'Este comando solo funciona por privado.' }, { quoted: msg })
            return false
          }

          if (plugin.ownerOnly && !isOwner) {
            await sock.sendMessage(remoteJid, { text: 'Este comando es solo para el owner.' }, { quoted: msg })
            return false
          }

          if (plugin.adminOnly) {
            if (!isGroup) {
              await sock.sendMessage(remoteJid, { text: 'Este comando requiere grupo.' }, { quoted: msg })
              return false
            }

            admin = await isAdmin(sock, remoteJid, sender)
            if (!admin) {
              await sock.sendMessage(remoteJid, { text: 'Debes ser admin para usar este comando.' }, { quoted: msg })
              return false
            }
          }

          if (isGroup && !groupMetadata) {
            groupMetadata = await sock.groupMetadata(remoteJid).catch(() => null)
          }

          try {
            if (isGroup) setGroupLock(remoteJid, sock)
            const textWithoutCommand = argsValue.join(' ').trim()
            await plugin.run({
              sock,
              msg,
              args: argsValue,
              text: textWithoutCommand,
              rawText: text,
              commandName: commandNameValue,
              sender,
              remoteJid,
              isGroup,
              prefix: defaultPrefix,
              usedPrefix: usedPrefixValue,
              noPrefix: noPrefixValue,
              isAdmin: admin,
              isOwner,
              groupMetadata
            })
            await stopPrefixSignals(sock, remoteJid, 10_000)
            executed = true
            return true
          } catch (error) {
            const errorText = error?.message || String(error)
            if (errorText) {
              await sock.sendMessage(remoteJid, { text: errorText }, { quoted: msg })
            }
            await stopPrefixSignals(sock, remoteJid, 10_000)
            console.error(`[HANDLER] Error ejecutando plugin (${plugin.name || 'anonimo'}):`, error)
            return false
          }
        }

        for (const plugin of manager.plugins.values()) {
          const matchedPrefix = matchCustomPrefixPrefix(plugin.customPrefix, text)
          if (!matchedPrefix) continue
          if (isGroup && isGroupLocked(remoteJid, sock)) continue

          const noPrefixCustom = text.slice(matchedPrefix.length).trimStart()
          const [commandNameRawCustom = '', ...argsCustom] = noPrefixCustom.split(/\s+/).filter(Boolean)
          const commandNameCustom = commandNameRawCustom.toLowerCase()

          if (isGroup && !await isBotEnabledForGroup(remoteJid)) {
            const handled = await handleDisabledBotCommand(sock, msg, remoteJid, commandNameCustom)
            if (handled) {
              executed = true
              break
            }
          }

          if (isGroup && await isAdminModeForGroup(remoteJid)) {
            const senderIsAdmin = await isAdmin(sock, remoteJid, sender)
            const handled = await handleAdminModeCommand(sock, msg, remoteJid, commandNameCustom, senderIsAdmin)
            if (handled) {
              executed = true
              break
            }
          }

          if (!matchesCommandCondition(plugin.command, commandNameCustom)) continue
          if (!prefixSignalsSent) {
            prefixSignalsSent = true
            await sendPrefixSignals(sock, msg, remoteJid)
          }
          await executePlugin(plugin, matchedPrefix, noPrefixCustom, commandNameCustom, argsCustom)
          if (executed) break
        }

        if (executed) continue

        const matchedDefault = matchDefaultPrefix(text)
        if (!matchedDefault) continue
        if (isGroup && isGroupLocked(remoteJid, sock)) continue

        if (!prefixSignalsSent) {
          prefixSignalsSent = true
          await sendPrefixSignals(sock, msg, remoteJid)
        }

        const noPrefix = text.slice(matchedDefault.length).trim()
        if (!noPrefix) continue

        const [commandNameRaw = '', ...args] = noPrefix.split(/\s+/)
        const commandName = commandNameRaw.toLowerCase()

        if (isGroup && !await isBotEnabledForGroup(remoteJid)) {
          const handled = await handleDisabledBotCommand(sock, msg, remoteJid, commandName)
          if (handled) continue
        }

        if (isGroup && await isAdminModeForGroup(remoteJid)) {
          const senderIsAdmin = await isAdmin(sock, remoteJid, sender)
          const handled = await handleAdminModeCommand(sock, msg, remoteJid, commandName, senderIsAdmin)
          if (handled) continue
        }

        const plugin = manager.matchPlugin(commandName, { ignoreCustomPrefix: true })
        if (!plugin) continue
        await executePlugin(plugin, matchedDefault, noPrefix, commandName, args)
      } catch (error) {
        console.error('[HANDLER] Error procesando mensaje:', error)
      }
    }
  })

  sock.ev.on('group-participants.update', async (update) => {
    try {
      console.log(chalk.blueBright('╔══════ [GROUP EVENT] ══════'))
      console.log(`${chalk.cyanBright('Grupo:')} ${chalk.whiteBright(update?.id || 'desconocido')}`)
      console.log(`${chalk.cyanBright('Accion:')} ${chalk.whiteBright(update?.action || 'desconocida')}`)
      console.log(`${chalk.cyanBright('Autor:')} ${chalk.whiteBright(update?.author || 'desconocido')}`)
      console.log(`${chalk.cyanBright('Participantes:')} ${chalk.whiteBright(JSON.stringify(update?.participants || []))}`)
      console.log(`${chalk.cyanBright('Payload:')} ${chalk.gray(JSON.stringify(update, null, 2))}`)
      console.log(chalk.blueBright('╚══════ [GROUP EVENT] ══════'))
    } catch (error) {
      console.error('[HANDLER] Error logueando group-participants.update:', error.message)
    }

    for (const plugin of manager.plugins.values()) {
      if (typeof plugin.onGroupUpdate !== 'function') continue

      try {
        await plugin.onGroupUpdate({ sock, update })
      } catch (error) {
        console.error(`[HANDLER] Error onGroupUpdate (${plugin.name || 'anonimo'}):`, error.message)
      }
    }
  })
}
