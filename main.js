// Advertencia Modifica esto solo si sabes lo que haces 

// esta madre funciona pero no tengo ni puta idea de como le hice para que funcione

// este codigo es producto de 2 noches de lagrimas, sudor y mucho pero mucho cafe 

// Agradezco al dev de LunaBotv6 por compartir soluciones

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
import './config.js'; 
import { createRequire } from "module";
import path, { join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import * as ws from 'ws';
import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch, rmSync, rmdirSync } from 'fs';
import yargs from 'yargs';
import { spawn } from 'child_process';
import lodash from 'lodash';
import chalk from 'chalk'
import syntaxerror from 'syntax-error';
import { tmpdir } from 'os';
import { format } from 'util';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import P from 'pino'
import pino from 'pino'
import Pino from 'pino'
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js';
import store from './lib/store.js'
import { Boom } from '@hapi/boom'
import pkg from 'google-libphonenumber'
const { PhoneNumberUtil } = pkg
const phoneUtil = PhoneNumberUtil.getInstance()
const {useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, MessageRetryMap, makeCacheableSignalKeyStore, jidNormalizedUser, PHONENUMBER_MCC } = await import('@whiskeysockets/baileys')
import moment from 'moment-timezone'
import NodeCache from 'node-cache'
import { startSubBots } from './plugins/sub-bots.js'
import readline from 'readline'
import fs from 'fs'
import qrcode from 'qrcode-terminal'

const { CONNECTING } = ws
const { chain } = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000

protoType()
serialize()

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') { return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString() }; 
global.__dirname = function dirname(pathURL) { return path.dirname(global.__filename(pathURL, true)) }; 
global.__require = function require(dir = import.meta.url) { return createRequire(dir) } 

global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '')

global.timestamp = {
  start: new Date
}

const __dirname = global.__dirname(import.meta.url)

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.prefix = new RegExp('^[' + (opts['prefix'] || '‎z/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.,\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')

global.db = new Low(/https?:\/\//.test(opts['db'] || '') ?
new cloudDBAdapter(opts['db']) : /mongodb(\+srv)?:\/\//i.test(opts['db']) ? (opts['mongodbv2'] ? new mongoDBV2(opts['db']) : new mongoDB(opts['db'])) :
new JSONFile(`${opts._[0] ? opts._[0] + '_' : ''}database.json`)
)

global.DATABASE = global.db 
global.loadDatabase = async function loadDatabase() {
if (global.db.READ) return new Promise((resolve) => setInterval(async function () {
if (!global.db.READ) {
clearInterval(this)
resolve(global.db.data == null ? global.loadDatabase() : global.db.data)
}}, 1 * 1000))
if (global.db.data !== null) return
global.db.READ = true
await global.db.read().catch(console.error)
global.db.READ = null
global.db.data = {
users: {},
chats: {},
stats: {},
msgs: {},
sticker: {},
settings: {},
...(global.db.data || {})
}
global.db.chain = chain(global.db.data)
}
loadDatabase()

global.authFile = `Alya-BotSession`
const {state, saveState, saveCreds} = await useMultiFileAuthState(global.authFile)
const msgRetryCounterMap = (MessageRetryMap) => { }
const msgRetryCounterCache = new NodeCache()
const {version} = await fetchLatestBaileysVersion()
let phoneNumber = global.botNumberCode
const methodCodeQR = process.argv.includes("qr")
const methodCode = !!phoneNumber || process.argv.includes("code")
const MethodMobile = process.argv.includes("mobile")

const filterStrings = [
"Q2xvc2luZyBzdGFsZSBvcGVu",
"Q2xvc2luZyBvcGVuIHNlc3Npb24=",
"RmFpbGVkIHRvIGRlY3J5cHQ=",
"U2Vzc2lvbiBlcnJvcg==",
"RXJyb3I6IEJhZCBNQUM=",
"RGVjcnlwdGVkIG1lc3NhZ2U="
]
console.info = () => {} 
console.debug = () => {} 
['log', 'warn', 'error'].forEach(methodName => redefineConsoleMethod(methodName, filterStrings))

process.setMaxListeners(0)

let opcion
if (methodCodeQR) {
opcion = '1'
}

const credsExist = fs.existsSync(`./${authFile}/creds.json`)

if (!methodCodeQR && !methodCode && !credsExist) {
const rl = readline.createInterface({
input: process.stdin,
output: process.stdout,
terminal: true,
})

const question = (texto) => {
return new Promise((resolver) => {
rl.question(texto, (respuesta) => {
resolver(respuesta.trim())
})})
}

do {
let lineM = '⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ ⋯ 〉'
opcion = await question(`╭${lineM}  
┊ ${chalk.blueBright('╭─────────────')}
┊ ${chalk.blueBright('┊')} ${chalk.blue.bgBlue.bold.cyan('MÉTODO DE VINCULACIÓN')}
┊ ${chalk.blueBright('╰─────────────')}   
┊ ${chalk.blueBright('╭─────────────')}     
┊ ${chalk.blueBright('┊')} ${chalk.green.bgMagenta.bold.yellow('¿CÓMO DESEA CONECTARSE?')}
┊ ${chalk.blueBright('┊')} ${chalk.bold.redBright('⇢  Opción 1:')} ${chalk.greenBright('Código QR.')}
┊ ${chalk.blueBright('┊')} ${chalk.bold.redBright('⇢  Opción 2:')} ${chalk.greenBright('Código de 8 digitos.')}
┊ ${chalk.blueBright('╰─────────────')}
┊ ${chalk.blueBright('╭─────────────')}     
┊ ${chalk.blueBright('┊')} ${chalk.italic.magenta('Escriba sólo el número de')}
┊ ${chalk.blueBright('┊')} ${chalk.italic.magenta('la opción para conectarse.')}
┊ ${chalk.blueBright('╰─────────────')} 
╰${lineM}\n${chalk.bold.magentaBright('---> ')}`)

if (!/^[1-2]$/.test(opcion)) {
console.log(chalk.bold.redBright(`NO SE PERMITE NÚMEROS QUE NO SEAN ${chalk.bold.greenBright("1")} O ${chalk.bold.greenBright("2")}, TAMPOCO LETRAS O SÍMBOLOS ESPECIALES.`))
}
} while (!/^[1-2]$/.test(opcion))

rl.close()
}

const connectionOptions = {
logger: pino({ level: 'silent' }),
mobile: MethodMobile, 
browser: ['Alya-Bot', 'Edge', '24.04.3'],
auth: {
creds: state.creds,
keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
},
markOnlineOnConnect: true, 
generateHighQualityLinkPreview: true, 
getMessage: async (clave) => {
let jid = jidNormalizedUser(clave.remoteJid)
let msg = await store.loadMessage(jid, clave.id)
return msg?.message || ""
},
msgRetryCounterCache,
defaultQueryTimeoutMs: undefined,
}

global.conn = makeWASocket(connectionOptions)

if (!credsExist) {
if (opcion === '2' || methodCode) {
if (!conn.authState.creds.registered) {
const rl = readline.createInterface({
input: process.stdin,
output: process.stdout,
terminal: true,
})

const question = (texto) => {
return new Promise((resolver) => {
rl.question(texto, (respuesta) => {
resolver(respuesta.trim())
})})
}

let addNumber
if (!!phoneNumber) {
addNumber = phoneNumber.replace(/[^0-9]/g, '')
} else {
do {
phoneNumber = await question(chalk.bgBlack(chalk.bold.greenBright("\n\n✳️ Escriba su número\n\nEjemplo: 5491168xxxx\n\n")))
phoneNumber = phoneNumber.replace(/\D/g,'')
if (!phoneNumber.startsWith('+')) {
phoneNumber = `+${phoneNumber}`
}
} while (!await isValidPhoneNumber(phoneNumber))

addNumber = phoneNumber.replace(/\D/g, '')
}

rl.close()

setTimeout(async () => {
let codeBot = await conn.requestPairingCode(addNumber)
codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot
console.log(chalk.bold.white(chalk.bgMagenta(`CÓDIGO DE VINCULACIÓN:`)), chalk.bold.white(chalk.white(codeBot)))
}, 3000)
}
}
}

conn.isInit = false
conn.well = false

if (!opts['test']) {
setInterval(async () => {
if (global.db.data) await global.db.write().catch(console.error)
if (opts['autocleartmp']) try {
clearTmp()
} catch (e) { console.error(e) }
}, 60 * 1000)
}

if (opts['server']) (await import('./server.js')).default(global.conn, PORT)

async function clearTmp() {
const tmp = [tmpdir(), join(__dirname, './tmp')]
const filename = []
tmp.forEach(dirname => readdirSync(dirname).forEach(file => filename.push(join(dirname, file))))

return filename.map(file => {
const stats = statSync(file)
if (stats.isFile() && (Date.now() - stats.mtimeMs >= 1000 * 60 * 1)) return unlinkSync(file)
return false
})
}

setInterval(async () => {
await clearTmp()
console.log(chalk.cyan(`┏━━━━━━━━━»♻️ AUTO-CLEAR 🗑️«━━━━━━━━•\n┃→ ARCHIVOS DE LA CARPETA TMP ELIMINADAS\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━•`))
}, 60000)

function purgeSession() {
try {
let prekey = []
if (!existsSync("./Alya-SubBots")) return
let directorio = readdirSync("./Alya-SubBots")
let filesFolderPreKeys = directorio.filter(file => {
return file.startsWith('pre-key-')
})
prekey = [...prekey, ...filesFolderPreKeys]
filesFolderPreKeys.forEach(files => {
const filePath = `./Alya-BotSession/${files}`
if (existsSync(filePath)) {
unlinkSync(filePath)
}
})
} catch (err) {
console.error('Error en purgeSession:', err)
}
} 

function purgeSessionSB() {
try {
if (!existsSync('./Alya-SubBots/')) return
let listaDirectorios = readdirSync('./Alya-SubBots/');
let SBprekey = []
listaDirectorios.forEach(directorio => {
const dirPath = `./Alya-SubBots/${directorio}`
if (existsSync(dirPath) && statSync(dirPath).isDirectory()) {
let DSBPreKeys = readdirSync(dirPath).filter(fileInDir => {
return fileInDir.startsWith('pre-key-')
})
SBprekey = [...SBprekey, ...DSBPreKeys]
DSBPreKeys.forEach(fileInDir => {
const filePath = `${dirPath}/${fileInDir}`
if (existsSync(filePath)) {
unlinkSync(filePath)
}
})
}
})
} catch (err) {
console.log(chalk.bold.red(`[ ℹ️ ] Algo salió mal durante la eliminación`))
}}

function purgeOldFiles() {
try {
const directories = ['./Alya-BotSession/', './Alya-SubBots/']
const oneHourAgo = Date.now() - (60 * 60 * 1000)
directories.forEach(dir => {
if (!existsSync(dir)) return
const files = readdirSync(dir)
files.forEach(file => {
const filePath = path.join(dir, file)
try {
const stats = statSync(filePath)
if (stats.isFile() && stats.mtimeMs < oneHourAgo && file !== 'creds.json') { 
unlinkSync(filePath)
}
} catch (err) {}
})
})
} catch (err) {}
}

setInterval(async () => {
if (global.stopped === 'close' || !conn || !conn.user) return
await purgeSessionSB()
await purgeSession()
console.log(chalk.bold.cyanBright(`\n╭» 🔵 ${global.authFile} 🔵\n│→ SESIONES NO ESENCIALES ELIMINADAS\n╰─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ 🗑️♻️`))
await purgeOldFiles()
console.log(chalk.bold.cyanBright(`\n╭» 🟠 ARCHIVOS 🟠\n│→ ARCHIVOS RESIDUALES ELIMINADAS\n╰─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ 🗑️♻️`))
}, 1000 * 60 * 10)

let qrShown = false

async function connectionUpdate(update) {
const {connection, lastDisconnect, isNewLogin, qr} = update;
global.stopped = connection;
if (isNewLogin) conn.isInit = true;

if (qr && !qrShown) {
qrShown = true
console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
console.log(chalk.bold.greenBright('✅ ESCANEA EL CÓDIGO QR'))
console.log(chalk.yellow('⏱️  Expira en 60 segundos'))
console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'))
qrcode.generate(qr, { small: true })
console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'))
}

if (global.db.data == null) loadDatabase();

if (connection == 'open') {
qrShown = false
console.log(chalk.bold.greenBright('\n▣─────────────────────────···\n│\n│§ CONECTADO CORRECTAMENTE AL WHATSAPP ✅\n│\n▣─────────────────────────···'))
}

if (connection === 'close') {
qrShown = false
const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;

if (reason === DisconnectReason.badSession) {
console.log(chalk.bold.red(`\n[ ⚠ ] SESIÓN INCORRECTA`))
console.log(chalk.yellow(`Elimina la carpeta ${global.authFile} manualmente y reinicia`))
} else if (reason === DisconnectReason.connectionClosed) {
console.log(chalk.yellow(`[ ⚠ ] Conexión cerrada, reconectando...`))
await global.reloadHandler(true).catch(console.error);
} else if (reason === DisconnectReason.connectionLost) {
console.log(chalk.yellow(`[ ⚠ ] Conexión perdida, reconectando...`))
await global.reloadHandler(true).catch(console.error);
} else if (reason === DisconnectReason.connectionReplaced) {
console.log(chalk.bold.red(`\n[ ⚠ ] CONEXIÓN REEMPLAZADA`))
console.log(chalk.yellow(`Ya existe otra sesión activa en otro lugar`))
console.log(chalk.cyan(`Eliminando sesión...\n`))
try {
if (existsSync(`./${global.authFile}`)) {
rmSync(`./${global.authFile}`, { recursive: true, force: true })
}
} catch (e) {}
console.log(chalk.bold.magenta(`Sesión eliminada, puedes volver a conectar ahora\n`))
} else if (reason === DisconnectReason.loggedOut) {
console.log(chalk.bold.red(`\n[ ⚠ ] SESIÓN CERRADA`))
console.log(chalk.yellow(`Elimina la carpeta ${global.authFile} manualmente y vuelve a conectar\n`))
} else if (reason === DisconnectReason.restartRequired) {
console.log(chalk.yellow(`[ ⚠ ] Reinicio requerido, reconectando...`))
await global.reloadHandler(true).catch(console.error);
} else if (reason === DisconnectReason.timedOut) {
console.log(chalk.yellow(`[ ⚠ ] Tiempo agotado, reconectando...`))
await global.reloadHandler(true).catch(console.error);
} else if (code === 405 || reason === 405) {
console.log(chalk.bold.red(`\n[ ⚠ ] ERROR 405 - SESIÓN REEMPLAZADA`))
console.log(chalk.cyan(`Eliminando sesión antigua...\n`))
try {
if (existsSync(`./${global.authFile}`)) {
rmSync(`./${global.authFile}`, { recursive: true, force: true })
}
} catch (e) {}
console.log(chalk.bold.magenta(`Sesión eliminada, puedes volver a conectar ahora\n`))
} else {
console.log(chalk.yellow(`[ ⚠ ] Desconexión: ${reason || code || 'desconocida'}`))
await global.reloadHandler(true).catch(console.error);
}
}}

process.on('uncaughtException', console.error);

let isInit = true;
let handler = await import('./handler.js')
global.reloadHandler = async function (restatConn) {
try {
const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error)
if (Object.keys(Handler || {}).length) handler = Handler
} catch (e) {
console.error(e)
}
if (restatConn) {
const oldChats = global.conn.chats
try { global.conn.ws.close() } catch { }
conn.ev.removeAllListeners()
global.conn = makeWASocket(connectionOptions, { chats: oldChats })
isInit = true
}
if (!isInit) {
conn.ev.off('messages.upsert', conn.handler)
conn.ev.off('group-participants.update', conn.participantsUpdate)
conn.ev.off('groups.update', conn.groupsUpdate)
conn.ev.off('message.delete', conn.onDelete)
conn.ev.off('connection.update', conn.connectionUpdate)
conn.ev.off('creds.update', conn.credsUpdate)
}

conn.welcome = 'HOLAA!! @user ¿COMO ESTAS?😃\n\n〘Bienvenido A *@subject*〙\n\nUn gusto conocerte amig@ 🤗\n\n_Recuerda leer las reglas del grupo para no tener ningun problema 🧐_\n\n*Solo disfrutar de este grupo y divertite 🥳*`'
conn.bye = 'Bueno, se fue @user 👋\n\nQue dios lo bendiga 😎`'
conn.spromote = 'Hey @user ya forma parte de staff 😏'
conn.sdemote = 'jajaja @user ya no eres admins'
conn.sDesc = 'La descripción ha sido cambiada a \n@desc'
conn.sSubject = 'El nombre del grupo ha sido cambiado a \n@group'
conn.sIcon = 'El icono del grupo ha sido cambiado'
conn.sRevoke = 'El enlace del grupo ha sido cambiado a \n@revoke'
conn.handler = handler.handler.bind(global.conn)
conn.participantsUpdate = handler.participantsUpdate.bind(global.conn)
conn.groupsUpdate = handler.groupsUpdate.bind(global.conn)
conn.onDelete = handler.deleteUpdate.bind(global.conn)
conn.connectionUpdate = connectionUpdate.bind(global.conn)
conn.credsUpdate = saveCreds.bind(global.conn, true)

conn.ev.on('messages.upsert', conn.handler)
conn.ev.on('group-participants.update', conn.participantsUpdate)
conn.ev.on('groups.update', conn.groupsUpdate)
conn.ev.on('message.delete', conn.onDelete)
conn.ev.on('connection.update', conn.connectionUpdate)
conn.ev.on('creds.update', conn.credsUpdate)
isInit = false
return true
}

await startSubBots();

const pluginFolder = global.__dirname(join(__dirname, './plugins/index'))
const pluginFilter = (filename) => /\.js$/.test(filename)
global.plugins = {}
async function filesInit() {
for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
try {
const file = global.__filename(join(pluginFolder, filename))
const module = await import(file)
global.plugins[filename] = module.default || module;
} catch (e) {
conn.logger.error(e)
delete global.plugins[filename]
}}}
filesInit().then((_) => Object.keys(global.plugins)).catch(console.error)

global.reload = async (_ev, filename) => {
if (pluginFilter(filename)) {
const dir = global.__filename(join(pluginFolder, filename), true)
if (filename in global.plugins) {
if (existsSync(dir)) conn.logger.info(`Plugins actualizado: '${filename}'`)
else { 
conn.logger.warn(`delete plugins: '${filename}'`)
return delete global.plugins[filename]
}
} else conn.logger.info(`Nuevo plugins:  '${filename}'`)
const err = syntaxerror(readFileSync(dir), filename, {
sourceType: 'module',
allowAwaitOutsideFunction: true,
});
if (err) conn.logger.error(`❌ error de sintaxis al cargar '${filename}'\n${format(err)}`)
else {
try { 
const module = (await import(`${global.__filename(dir)}?update=${Date.now()}`))
global.plugins[filename] = module.default || module
} catch (e) {
conn.logger.error(`❌ Error requiere plugins: '${filename}\n${format(e)}'`);
} finally {
global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)))
}}}}

Object.freeze(global.reload)
watch(pluginFolder, global.reload)
await global.reloadHandler()

async function _quickTest() {
let test = await Promise.all([
spawn('ffmpeg'),
spawn('ffprobe'),
spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
spawn('convert'),
spawn('magick'),
spawn('gm'),
spawn('find', ['--version'])].map(p => {
return Promise.race([
new Promise(resolve => {
p.on('close', code => {
resolve(code !== 127)
})
}),
new Promise(resolve => {
p.on('error', _ => resolve(false))
})
])}))

let [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test
console.log(test)
let s = global.support = {ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find }
Object.freeze(global.support)
}

_quickTest()
.then(() => conn.logger.info('ᴄᴀʀɢᴀɴᴅᴏ．．．.\n'))
.catch(console.error)

function redefineConsoleMethod(methodName, filterStrings) {
const originalConsoleMethod = console[methodName]
console[methodName] = function() {
const message = arguments[0]
if (typeof message === 'string' && filterStrings.some(filterString => message.includes(atob(filterString)))) {
arguments[0] = ""
}
originalConsoleMethod.apply(console, arguments)
}}

async function isValidPhoneNumber(number) {
try {
number = number.replace(/\s+/g, '')
if (number.startsWith('+521')) {
number = number.replace('+521', '+52');
} else if (number.startsWith('+52') && number[4] === '1') {
number = number.replace('+52 1', '+52');
}
const parsedNumber = phoneUtil.parseAndKeepRawInput(number)
return phoneUtil.isValidNumber(parsedNumber)
} catch (error) {
return false
}}