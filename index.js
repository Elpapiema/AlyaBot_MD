import cfonts from 'cfonts'
import chalk from 'chalk'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import fs from 'node:fs'
import path from 'node:path'
import './config.js'
import { startBot } from './main.js'

const { say } = cfonts

say('AlyaBot Rc-1', {
  font: 'chrome',
  align: 'center',
  gradient: ['red', 'magenta'],
})

function normalizeMode(value = '') {
  const mode = String(value).trim().toLowerCase()
  if (mode === '1' || mode === 'qr') return 'qr'
  if (mode === '2' || mode === 'code') return 'code'
  return null
}

function getModeFromNpmArgv() {
  try {
    const parsed = JSON.parse(process.env.npm_config_argv || '{}')
    const original = Array.isArray(parsed.original) ? parsed.original : []
    for (const part of original) {
      const mode = normalizeMode(part)
      if (mode) return mode
    }
  } catch {}
  return null
}

async function askMode() {
  const rl = createInterface({ input, output })
  console.log(chalk.magentaBright('\nSelecciona metodo de vinculacion:'))
  console.log(`${chalk.yellowBright('1)')} ${chalk.greenBright('QR')}`)
  console.log(`${chalk.yellowBright('2)')} ${chalk.cyanBright('Codigo (8 caracteres)')}`)
  const answer = await rl.question(chalk.blueBright('Opcion [1/2]: '))
  rl.close()
  return normalizeMode(answer) || 'qr'
}

async function resolveStartMode() {
  const argMode = normalizeMode(process.argv[2])
  if (argMode) return argMode

  const npmArgMode = getModeFromNpmArgv()
  if (npmArgMode) return npmArgMode

  const credsPath = path.resolve('./AlyaBot-Session/creds.json')
  if (fs.existsSync(credsPath)) {
    console.log(chalk.cyanBright('[BOOT] creds.json detectado, se omite seleccion de metodo.'))
    return 'qr'
  }

  return askMode()
}

const mode = await resolveStartMode()
console.log(chalk.greenBright(`[BOOT] Modo seleccionado: ${mode === 'qr' ? 'QR' : 'CODIGO'}`))

startBot({ mode }).catch((error) => {
  console.error('[FATAL] No se pudo iniciar el bot:', error)
  process.exit(1)
})
