import { ensureSettingsFile } from '../../lib/settings.js'

async function initSettings() {
  try {
    await ensureSettingsFile()
    console.log('✅ Archivo settings.json verificado correctamente.')
  } catch (error) {
    console.error(`❌ Error al verificar settings.json: ${error.message}`)
  }
}

initSettings()

export default initSettings
