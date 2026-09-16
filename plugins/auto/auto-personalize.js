import { loadPersonalize } from '../../lib/storage.js'

async function handler() {
  try {
    await loadPersonalize()
    console.log('✅ Archivo personalize.json verificado correctamente.')
  } catch (error) {
    console.error(`❌ Error al verificar o crear el archivo personalize.json: ${error.message}`)
  }
}

handler()

export default handler
