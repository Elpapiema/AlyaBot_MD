// ---------------[ APIs (internas) ]---------------

global.masha = 'https://sm.alycore.xyz'
global.alya = 'https://salya.alycore.xyz'
global.masachika = 'https://sm2.alycore.xyz'

//------------[ Versión | Nombre  ]------------

// Cambia por el nombre de tu bot

global.wm = 'AlyaBot' 
global.botname = 'AlyaBot'
global.vs = '3.0.1 Stable'
global.dev = 'Emma (Violets Version)'
global.copy = '©' // No modificar

//------------------------[ Stickers ]-----------------------------

global.packname = 'AlyaBot'
global.author = 'Emma (Violets Version)'


//------------[ Owners ]------------
// Acepta LID y/o numero
global.owner = [
  ...(process.env.BOT_OWNER ? process.env.BOT_OWNER.split(',').map((v) => v.trim()).filter(Boolean) : [])
, '128514011471987@lid','5212444357601@s.whatsapp.net']

//------------[ Maintenance ]------------
// true = activo | false = desactivado (solo para limpieza de sesiones)
global.maintenanceMode = false

// Expiracion de tokens web para .code (10 min)
global.codeTokenTTLms = 10 * 60 * 1000

// Permitir comandos enviados por el propio bot
// true = permite | false = ignora mensajes fromMe
global.allowBotCommands = true
