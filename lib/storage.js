import fs from 'node:fs'
import path from 'node:path'

const databaseDir = path.join(process.cwd(), 'database')
const remoteDbUrl = process.env.DB_HOST || ''

let mysqlModulePromise = null
let poolPromise = null
let remoteReadyPromise = null

export const personalizePath = path.join(databaseDir, 'personalize.json')
export const usersDbPath = path.join(databaseDir, 'db_users.json')
export const haremPath = path.join(databaseDir, 'harem.json')
export const ecoConfigPath = path.join(databaseDir, 'eco_config.json')
export const settingsPath = path.join(databaseDir, 'settings.json')

export const defaultPersonalize = {
  default: {
    botName: 'Alya Mikhailovna Kujou',
    currency: 'yenes',
    videos: [
      "https://raw.githubusercontent.com/Elpapiema/Data-Files_Store/0a4383fb068d6cfaa65dac27ebde45ac159c2784/resources/video/1.mp4",
      "https://raw.githubusercontent.com/Elpapiema/Data-Files_Store/0a4383fb068d6cfaa65dac27ebde45ac159c2784/resources/video/2.mp4"
      /*'https://cdn.alyabot.xyz/resources/others/433522153.mp4',
      'https://cdn.alyabot.xyz/resources/others/070227907.mp4',
      'https://cdn.alyabot.xyz/resources/others/747565565.mp4',
      'https://cdn.alyabot.xyz/resources/others/402480269.mp4',
      'https://cdn.alyabot.xyz/resources/others/425855129.mp4'*/
    ]
  },
  global: {
    botName: null,
    currency: null,
    videos: []
  }
}

const remoteStoreConfigs = new Map([
  [path.resolve(personalizePath), { table: 'personalize', idColumn: 'scope_key', defaultId: 'global' }],
  [path.resolve(usersDbPath), { table: 'db_users', idColumn: 'scope_key', defaultId: 'global' }],
  [path.resolve(haremPath), { table: 'harem', idColumn: 'scope_key', defaultId: 'global' }],
  [path.resolve(ecoConfigPath), { table: 'eco_config', idColumn: 'scope_key', defaultId: 'global' }],
  [path.resolve(settingsPath), { table: 'settings', idColumn: 'scope_key', defaultId: 'global' }]
])

export function ensureDir(dirPath = databaseDir) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true })
}

function cloneFallback(fallback) {
  return JSON.parse(JSON.stringify(fallback))
}

function getRemoteStoreConfig(filePath) {
  return remoteStoreConfigs.get(path.resolve(filePath)) || {
    table: path.basename(filePath, '.json'),
    idColumn: 'scope_key',
    defaultId: 'global'
  }
}

function getRemoteConfig() {
  if (!remoteDbUrl) return null

  try {
    const parsed = new URL(remoteDbUrl)
    return {
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 3306,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, '')
    }
  } catch (error) {
    console.warn(`[storage] DB_HOST invalido; se usara JSON local. ${error.message}`)
    return null
  }
}

async function loadMysqlModule() {
  if (!mysqlModulePromise) {
    mysqlModulePromise = import('mysql2/promise')
      .then((mod) => mod.default || mod)
      .catch((error) => {
        console.warn(`[storage] No se pudo cargar mysql2; se usara JSON local. ${error.message}`)
        return null
      })
  }

  return mysqlModulePromise
}

async function getRemotePool() {
  if (!remoteDbUrl) return null
  if (!poolPromise) {
    poolPromise = loadMysqlModule().then((mysql) => {
      if (!mysql) return null
      const remoteConfig = getRemoteConfig()
      if (!remoteConfig) return null
      return mysql.createPool({
        ...remoteConfig,
        waitForConnections: true,
        connectionLimit: 10,
        namedPlaceholders: true,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
        connectTimeout: 15000
      })
    }).catch((error) => {
      poolPromise = null
      console.warn(`[storage] No se pudo crear el pool remoto; se usara JSON local. ${error.message}`)
      return null
    })
  }

  return poolPromise
}

async function ensureRemoteReady() {
  if (!remoteDbUrl) return false
  if (!remoteReadyPromise) {
    remoteReadyPromise = (async () => {
      const pool = await getRemotePool()
      if (!pool) return false

      try {
        for (const config of remoteStoreConfigs.values()) {
          await pool.query(`
            CREATE TABLE IF NOT EXISTS \`${config.table}\` (
              \`${config.idColumn}\` VARCHAR(191) NOT NULL PRIMARY KEY,
              json_data LONGTEXT NOT NULL,
              updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
          `)
        }
        return true
      } catch (error) {
        console.warn(`[storage] No se pudo preparar la tabla remota; se usara JSON local. ${error.message}`)
        remoteReadyPromise = null
        return false
      }
    })()
  }

  return remoteReadyPromise
}

async function canUseRemote() {
  try {
    return await ensureRemoteReady()
  } catch {
    return false
  }
}

export function hasRemoteDbConfigured() {
  return Boolean(remoteDbUrl)
}

export async function getStorageModeLabel() {
  if (!hasRemoteDbConfigured()) return 'Local'
  return await canUseRemote() ? 'Remota (Activa)' : 'Local (Sin conexión remota)'
}

export async function readJson(filePath, fallback = {}) {
  ensureDir()
  const remoteConfig = getRemoteStoreConfig(filePath)

  if (await canUseRemote()) {
    try {
      const pool = await getRemotePool()
      const [rows] = await pool.query(
        `SELECT json_data FROM \`${remoteConfig.table}\` WHERE \`${remoteConfig.idColumn}\` = ? LIMIT 1`,
        [remoteConfig.defaultId]
      )

      if (Array.isArray(rows) && rows[0]?.json_data) {
        return JSON.parse(rows[0].json_data)
      }
    } catch (error) {
      console.warn(`[storage] Error leyendo remoto ${remoteConfig.table}; se usara JSON local. ${error.message}`)
    }
  }

  if (!fs.existsSync(filePath)) return cloneFallback(fallback)

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    return cloneFallback(fallback)
  }
}

export async function writeJson(filePath, data) {
  const remoteConfig = getRemoteStoreConfig(filePath)

  if (await canUseRemote()) {
    try {
      const pool = await getRemotePool()
      await pool.query(
        `INSERT INTO \`${remoteConfig.table}\` (\`${remoteConfig.idColumn}\`, json_data)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE json_data = VALUES(json_data)`,
        [remoteConfig.defaultId, JSON.stringify(data)]
      )
      return data
    } catch (error) {
      console.warn(`[storage] Error escribiendo remoto ${remoteConfig.table}; se usara JSON local. ${error.message}`)
    }
  }

  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  return data
}

export async function ensureJson(filePath, fallback = {}) {
  const data = await readJson(filePath, fallback)
  const remoteConfig = getRemoteStoreConfig(filePath)

  if (await canUseRemote()) {
    try {
      const pool = await getRemotePool()
      const [rows] = await pool.query(
        `SELECT \`${remoteConfig.idColumn}\` FROM \`${remoteConfig.table}\` WHERE \`${remoteConfig.idColumn}\` = ? LIMIT 1`,
        [remoteConfig.defaultId]
      )

      if (!Array.isArray(rows) || !rows.length) {
        await writeJson(filePath, data)
      }
    } catch (error) {
      console.warn(`[storage] Error verificando remoto ${remoteConfig.table}; se usara JSON local. ${error.message}`)
    }

    return data
  }

  if (!fs.existsSync(filePath)) await writeJson(filePath, data)
  return data
}

export async function loadPersonalize() {
  const current = await ensureJson(personalizePath, defaultPersonalize)
  const normalized = {
    default: {
      ...defaultPersonalize.default,
      ...(current.default || {})
    },
    global: {
      ...defaultPersonalize.global,
      ...(current.global || {})
    }
  }
  await writeJson(personalizePath, normalized)
  return normalized
}

export async function savePersonalize(data) {
  const current = await loadPersonalize()
  const normalized = {
    default: {
      ...current.default,
      ...(data.default || {})
    },
    global: {
      ...current.global,
      ...(data.global || {})
    }
  }
  return writeJson(personalizePath, normalized)
}

export async function getCurrencyName() {
  const personalize = await loadPersonalize()
  return personalize.global?.currency || personalize.default?.currency || 'yenes'
}

export async function getBotDisplayName() {
  const personalize = await loadPersonalize()
  return personalize.global?.botName || personalize.default?.botName || global.botname || 'AlyaBot'
}

export async function loadUsersDb() {
  return ensureJson(usersDbPath, {})
}

export async function saveUsersDb(data) {
  return writeJson(usersDbPath, data)
}

export async function ensureUserEconomy(userId) {
  const users = await loadUsersDb()
  if (!users[userId]) users[userId] = { money: 0, bank: 0 }
  if (typeof users[userId].money !== 'number') users[userId].money = 0
  if (typeof users[userId].bank !== 'number') users[userId].bank = 0
  await saveUsersDb(users)
  return users[userId]
}

export async function loadHarem() {
  return ensureJson(haremPath, {})
}

export async function saveHarem(data) {
  return writeJson(haremPath, data)
}

export async function loadEcoConfig() {
  const defaults = { ppt: { reward: 100, penalty: 50 } }
  const current = await ensureJson(ecoConfigPath, defaults)
  const normalized = {
    ppt: {
      ...defaults.ppt,
      ...(current.ppt || {})
    }
  }
  await writeJson(ecoConfigPath, normalized)
  return normalized
}
