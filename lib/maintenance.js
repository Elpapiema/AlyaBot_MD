import fs from 'node:fs/promises'
import path from 'node:path'
import chalk from 'chalk'

const SESSION_CLEAN_INTERVAL_MS = 5 * 60 * 1000
const TMP_CLEAN_INTERVAL_MS = 2 * 60 * 1000

let started = false

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true }).catch(() => {})
}

async function cleanSessionFolderKeepCreds(sessionPath) {
  await ensureDir(sessionPath)
  const entries = await fs.readdir(sessionPath, { withFileTypes: true }).catch(() => [])
  let removed = 0

  for (const entry of entries) {
    if (!entry.name.startsWith('pre-key')) continue
    const fullPath = path.join(sessionPath, entry.name)
    await fs.rm(fullPath, { recursive: true, force: true }).catch(() => {})
    removed += 1
  }

  return removed
}

async function cleanAllSubSessionsKeepCreds(subBotsDir) {
  await ensureDir(subBotsDir)
  const entries = await fs.readdir(subBotsDir, { withFileTypes: true }).catch(() => [])
  let removed = 0

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const sessionPath = path.join(subBotsDir, entry.name)
    removed += await cleanSessionFolderKeepCreds(sessionPath)
  }

  return removed
}

async function cleanTmpDirectory(tmpDir) {
  await ensureDir(tmpDir)
  const entries = await fs.readdir(tmpDir, { withFileTypes: true }).catch(() => [])
  let removed = 0

  for (const entry of entries) {
    const fullPath = path.join(tmpDir, entry.name)
    await fs.rm(fullPath, { recursive: true, force: true }).catch(() => {})
    removed += 1
  }

  return removed
}

function cleanLastCharacterCache() {
  if (!global.lastCharacter || typeof global.lastCharacter !== 'object') {
    global.lastCharacter = {}
    return 0
  }

  const removed = Object.keys(global.lastCharacter).length
  global.lastCharacter = {}
  return removed
}

export function startMaintenance({
  mainSessionDir = './AlyaBot-Session',
  subBotsDir = './Alya-SubBots',
  tmpDir = './tmp'
} = {}) {
  if (started) return
  started = true

  const sessionMaintenanceEnabled = global.maintenanceMode !== false

  console.log(chalk.yellowBright('[MAINT] Mantenimiento automatico activo'))
  console.log(chalk.cyanBright('[MAINT] /tmp cada 2 min (siempre activo)'))
  if (sessionMaintenanceEnabled) {
    console.log(chalk.cyanBright('[MAINT] Sesiones(pre-key) cada 5 min'))
  } else {
    console.log(chalk.yellowBright('[MAINT] Limpieza de sesiones desactivada desde settings.js'))
  }

  const runSessionCleanup = async () => {
    const mainRemoved = await cleanSessionFolderKeepCreds(mainSessionDir)
    const subsRemoved = await cleanAllSubSessionsKeepCreds(subBotsDir)
    console.log(
      chalk.greenBright(
        `[MAINT] Limpieza sesiones -> principal: ${mainRemoved}, subs: ${subsRemoved}`
      )
    )
  }

  const runTmpCleanup = async () => {
    const tmpRemoved = await cleanTmpDirectory(tmpDir)
    console.log(chalk.magentaBright(`[MAINT] Limpieza /tmp -> eliminados: ${tmpRemoved}`))
  }

  const runLastCharacterCleanup = () => {
    const removed = cleanLastCharacterCache()
    console.log(chalk.blueBright(`[MAINT] Limpieza global.lastCharacter -> eliminados: ${removed}`))
  }

  if (sessionMaintenanceEnabled) {
    runSessionCleanup().catch((error) => {
      console.error(chalk.redBright(`[MAINT] Error limpiando sesiones: ${error.message}`))
    })
  }
  runLastCharacterCleanup()
  runTmpCleanup().catch((error) => {
    console.error(chalk.redBright(`[MAINT] Error limpiando /tmp: ${error.message}`))
  })

  if (sessionMaintenanceEnabled) {
    setInterval(() => {
      runSessionCleanup().catch((error) => {
        console.error(chalk.redBright(`[MAINT] Error limpiando sesiones: ${error.message}`))
      })
    }, SESSION_CLEAN_INTERVAL_MS)
  }

  setInterval(() => {
    runLastCharacterCleanup()
  }, SESSION_CLEAN_INTERVAL_MS)

  setInterval(() => {
    runTmpCleanup().catch((error) => {
      console.error(chalk.redBright(`[MAINT] Error limpiando /tmp: ${error.message}`))
    })
  }, TMP_CLEAN_INTERVAL_MS)
}
