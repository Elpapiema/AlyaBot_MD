import { smsg } from './lib/simple.js'
import { format } from 'util' 
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'
import ws from 'ws';

/**
 * @type {import('@whiskeysockets/baileys')}
 */
const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
    clearTimeout(this)
    resolve()
}, ms))
 
/**
 * Handle messages upsert
 * @param {import('@whiskeysockets/baileys').BaileysEventMap<unknown>['messages.upsert']} groupsUpdate 
 */
export async function handler(chatUpdate) {
this.msgqueque = this.msgqueque || [];
  this.uptime = this.uptime || Date.now();
    if (!chatUpdate)
        return
    this.pushMessage(chatUpdate.messages).catch(console.error)
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m)
        return
    if (global.db.data == null)
        await global.loadDatabase()
    try {
        m = smsg(this, m) || m
        if (!m)
            return
        m.exp = 0
m.limit = false
m.money = false
        try {
            let user = global.db.data.users[m.sender]
            if (typeof user !== 'object')
                global.db.data.users[m.sender] = {}
            if (user) {
            if (!isNumber(user.exp)) user.exp = 0;
        if (!('premium' in user)) user.premium = false;
        if (!isNumber(user.joincount)) user.joincount = 2;
       if (!isNumber(user.money)) user.money = 10
if (!isNumber(user.limit)) user.limit = 8       
                }
            let chat = global.db.data.chats[m.chat]
            if (typeof chat !== 'object')
                global.db.data.chats[m.chat] = {}
if (chat) {

}} catch (e) {
console.error(e)
}

if (opts['nyimak']) {
return;
}
    if (!m.fromMe && opts['self']) {
      return;
    }
    if (opts['pconly'] && m.chat.endsWith('g.us')) {
      return;
    }
    if (opts['gconly'] && !m.chat.endsWith('g.us')) {
      return;
    }
    if (opts['swonly'] && m.chat !== 'status@broadcast') {
      return;
    }
    if (typeof m.text !== 'string') {
      m.text = '';
    }
        
let _user = global.db.data && global.db.data.users && global.db.data.users[m.sender]

        const isROwner = [
  conn.decodeJid(global.conn.user.id),
  ...global.owner.map(([n]) => n),
  ...global.lidOwners.map(([n]) => n)
]
  .map(v => v.replace(/[^0-9]/g, ''))
  .some(n => [`${n}@s.whatsapp.net`, `${n}@lid`].includes(m.sender))
        const isOwner = isROwner || m.fromMe
        const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender) || _user.prem == true

        if (opts['queque'] && m.text && !(isMods || isPrems)) {
            let queque = this.msgqueque, time = 1000 * 5
            const previousID = queque[queque.length - 1]
            queque.push(m.id || m.key.id)
            setInterval(async function () {
                if (queque.indexOf(previousID) === -1) clearInterval(this)
                await delay(time)
            }, time)
        }

//if (m.isBaileys) return 
if (m.isBaileys || isBaileysFail && m?.sender === this?.this?.user?.jid) {
      return;
}
	    
m.exp += Math.ceil(Math.random() * 10)
let usedPrefix
//let _user = global.db.data && global.db.data.users && global.db.data.users[m.sender]
        
const groupMetadata = (m.isGroup ? ((conn.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}) || {}
const participants = (m.isGroup ? groupMetadata.participants : []) || []
const user = (m.isGroup ? participants.find(u => conn.decodeJid(u.id) === m.sender) : {}) || {} // User Data
// Obtener el jid real del bot
const botJid = conn.decodeJid(this.user?.id || this.user?.jid || '')

const bot = (m.isGroup
  ? participants.find(u => {
      const participantJid = conn.decodeJid(u.id || '')
      return participantJid === botJid
    })
  : {}) || {}

/*const botNumber = this.user?.jid || ''
const botJidVariants = [
  botNumber,
  botNumber.replace(/@s\.whatsapp\.net$/, '@lid'),
  botNumber.replace(/@lid$/, '@s.whatsapp.net')
]

const bot = (m.isGroup
  ? participants.find(u => botJidVariants.includes(conn.decodeJid(u.id)))
  : {}) || {}*/
//const bot = (m.isGroup ? participants.find(u => conn.decodeJid(u.id) == this.user.jid) : {}) || {} // Your Data
const isRAdmin = user?.admin == 'superadmin' || false
const isAdmin = isRAdmin || user?.admin == 'admin' || false // Is User Admin?
const isBotAdmin = bot?.admin === 'admin' || bot?.admin === 'superadmin'
 //const isBotAdmin = bot?.admin || false // Are you Admin?

        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin)
                continue
            if (plugin.disabled)
                continue
            const __filename = join(___dirname, name)
            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(this, m, {
                        chatUpdate,
                        __dirname: ___dirname,
                        __filename
                    })
                } catch (e) {
                    // if (typeof e === 'string') continue
                    console.error(e)
                   /*for (let [jid] of global.owner.filter(([number, _, isDeveloper]) => isDeveloper && number)) {
                        let data = (await conn.onWhatsApp(jid))[0] || {}
                        if (data.exists)
                            m.reply(`*Plugin:* ${name}\n*Sender:* ${m.sender}\n*Chat:* ${m.chat}\n*Command:* ${m.text}\n\n${format(e)}.trim(), data.jid)
                    }*/
                }
            }
            if (!opts['restrict'])
                if (plugin.tags && plugin.tags.includes('admin')) {
                    // global.dfail('restrict', m, this)
                    continue
                }
            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
            let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix
            let match = (_prefix instanceof RegExp ? // RegExp Mode?
                [[_prefix.exec(m.text), _prefix]] :
                Array.isArray(_prefix) ? // Array?
                    _prefix.map(p => {
                        let re = p instanceof RegExp ? // RegExp in Array?
                            p :
                            new RegExp(str2Regex(p))
                        return [re.exec(m.text), re]
                    }) :
                    typeof _prefix === 'string' ? // String?
                        [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
                        [[[], new RegExp]]
            ).find(p => p[1])
            if (typeof plugin.before === 'function') {
                if (await plugin.before.call(this, m, {
                    match,
                    conn: this,
                    participants,
                    groupMetadata,
                    user,
                    bot,
                    isROwner,
                    isOwner,
                    isRAdmin,
                    isAdmin,
                    isBotAdmin,
                    isPrems,
                    chatUpdate,
                    __dirname: ___dirname,
                    __filename
                }))
                    continue
            }
            if (typeof plugin !== 'function')
                continue
            if ((usedPrefix = (match[0] || '')[0])) {
                let noPrefix = m.text.replace(usedPrefix, '')
                let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
                args = args || []
                let _args = noPrefix.trim().split` `.slice(1)
                let text = _args.join` `
                command = (command || '').toLowerCase()
                let fail = plugin.fail || global.dfail // When failed
                let isAccept = plugin.command instanceof RegExp ? // RegExp Mode?
                    plugin.command.test(command) :
                    Array.isArray(plugin.command) ? // Array?
                        plugin.command.some(cmd => cmd instanceof RegExp ? // RegExp in Array?
                            cmd.test(command) :
                            cmd === command
                        ) :
                        typeof plugin.command === 'string' ? // String?
                            plugin.command === command :
                            false

if (!isAccept)
continue
m.plugin = name
if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
let chat = global.db.data.chats[m.chat]
let user = global.db.data.users[m.sender]
let botSpam = global.db.data.settings[this.user.jid]
if (!['owner-unbanchat.js', 'gc-link.js', 'gc-hidetag.js', 'info-creator.js'].includes(name) && chat && chat.isBanned && !isROwner) return // Except this
if (name != 'owner-unbanchat.js' && name != 'owner-exec.js' && name != 'owner-exec2.js' && name != 'tool-delete.js' && chat?.isBanned && !isROwner) return 
if (m.text && user.banned && !isROwner) {
if (typeof user.bannedMessageCount === 'undefined') {
    user.bannedMessageCount = 0;
  }
if (user.bannedMessageCount < 3) {
const messageNumber = user.bannedMessageCount + 1;
const messageText = `⚠️ ESTAS BANEADO ⚠️\nAviso (${messageNumber}/3)${user.bannedReason ? `\n*Motivo:* *${user.bannedReason}*` : ''}
*👉🏻 Puedes contactar al propietario del Bot si crees que se trata de un error o para charlar sobre tu desbaneo*

👉 wa.me/+57 314 7616444
👉 ${fb}
`.trim();
//m.reply(messageText);
user.bannedMessageCount++;
} else if (user.bannedMessageCount === 3) {
user.bannedMessageSent = true;
} else {
return;
}
return;
}

//Antispam 2		
if (user.antispam2 && isROwner) return
let time = global.db.data.users[m.sender].spam + 3000
if (new Date - global.db.data.users[m.sender].spam < 3000) return console.log(`[ SPAM ]`) 
global.db.data.users[m.sender].spam = new Date * 1
}
                
const hl = _prefix;
const adminMode = global.db.data.chats[m.chat].modoadmin;
const mystica = `${plugin.botAdmin || plugin.admin || plugin.group || plugin || noPrefix || hl || m.text.slice(0, 1) == hl || plugin.command}`;
if (adminMode && !isOwner && !isROwner && m.isGroup && !isAdmin && mystica) return;                         
if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) { // Both Owner
fail('owner', m, this)
continue
}
                if (plugin.rowner && !isROwner) { // Real Owner
                    fail('rowner', m, this)
                    continue
                }
                if (plugin.owner && !isOwner) { // Number Owner
                    fail('owner', m, this)
                    continue
                }
                if (plugin.mods && !isMods) { // Moderator
                    fail('mods', m, this)
                    continue
                }
                if (plugin.premium && !isPrems) { // Usuarios Premium
                    fail('premium', m, this)
                    continue
                }
                if (plugin.group && !m.isGroup) { // Group Only
                    fail('group', m, this)
                    continue
                } else if (plugin.botAdmin && !isBotAdmin) { // You Admin
                    fail('botAdmin', m, this)
                    continue
                } else if (plugin.admin && !isAdmin) { // User Admin
                    fail('admin', m, this)
                    continue
                }
                if (plugin.private && m.isGroup) { // Private Chat Only
                    fail('private', m, this)
                    continue
                }
                if (plugin.register == true && _user.registered == false) { // Butuh daftar?
                    fail('unreg', m, this)
                    continue
                }
                m.isCommand = true
                let xp = 'exp' in plugin ? parseInt(plugin.exp) : 1 // Ganancia de XP por comando
                if (xp > 9000)
                    m.reply('chirrido -_-') // Hehehe
                else
m.exp += xp
if (!isPrems && plugin.limit && global.db.data.users[m.sender].limit < plugin.limit * 1) {
conn.sendMessage(m.chat, {text: `*⚠ 𝐒𝐮𝐬 𝐝𝐢𝐚𝐦𝐚𝐧𝐭𝐞 💎 𝐬𝐞 𝐡𝐚𝐧 𝐚𝐠𝐨𝐭𝐚𝐝𝐨 𝐩𝐮𝐞𝐝𝐞 𝐜𝐨𝐦𝐩𝐫𝐚𝐫 𝐦𝐚𝐬 𝐮𝐬𝐚𝐧𝐝𝐨 𝐞𝐥 𝐜𝐨𝐦𝐚𝐧𝐝𝐨:* #buy`, contextInfo: {externalAdReply : {mediaUrl: null, mediaType: 1, description: null, "title": wm, body: '', previewType: 0, "thumbnail": img.getRandom(), sourceUrl: [nna, md, yt, nn, tiktok].getRandom()}}}, { quoted: m })         
continue
}
if (plugin.level > _user.level) {
conn.sendMessage(m.chat, {text: `*⚠️𝐍𝐞𝐜𝐞𝐬𝐢𝐭𝐚 𝐞𝐥 𝐧𝐢𝐯𝐞𝐥 ${plugin.level} 𝐩𝐚𝐫𝐚 𝐩𝐨𝐝𝐞𝐫 𝐮𝐬𝐚𝐫 𝐞𝐬𝐭𝐞 𝐜𝐨𝐦𝐚𝐧𝐝𝐨, 𝐓𝐮 𝐧𝐢𝐯𝐞𝐥 𝐚𝐜𝐭𝐮𝐚𝐥 𝐞𝐬:* ${_user.level}`, contextInfo: {externalAdReply : {mediaUrl: null, mediaType: 1, description: null, "title": wm, body: '', previewType: 0, "thumbnail": img.getRandom(), sourceUrl: [nna, md, yt, nn, tiktok].getRandom()}}}, { quoted: m })         
continue // Si no se ha alcanzado el nivel
}
let extra = {match, usedPrefix, noPrefix, _args, args, command, text, conn: this, participants, groupMetadata, user, bot, isROwner, isOwner, isRAdmin, isAdmin,  isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename }
try {
await plugin.call(this, m, extra)
if (!isPrems)
m.limit = m.limit || plugin.limit || false
} catch (e) {
// Error occured
m.error = e
console.error(e)
if (e) {
let text = format(e)
for (let key of Object.values(global.APIKeys))
text = text.replace(new RegExp(key, 'g'), '#HIDDEN#')
m.reply(text)
}
} finally {
// m.reply(util.format(_user))
if (typeof plugin.after === 'function') {
try {
await plugin.after.call(this, m, extra)
} catch (e) {
console.error(e)
}}
if (m.limit) m.reply(`*${+m.limit}* 𝘿𝙞𝙖𝙢𝙖𝙣𝙩𝙚 💎 𝙪𝙨𝙖𝙙𝙤𝙨`)
if (m.money) m.reply(+m.money + ' 𝙇𝙤𝙡𝙞𝘾𝙤𝙞𝙣𝙨 𝙪𝙨𝙖𝙙𝙤𝙨') 
}
break
}}} catch (e) {
console.error(e)
} finally {
if (opts['queque'] && m.text) {
const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
            if (quequeIndex !== -1)
                this.msgqueque.splice(quequeIndex, 1)
        }
        //console.log(global.db.data.users[m.sender])
        let user, stats = global.db.data.stats
        if (m) {
            if (m.sender && (user = global.db.data.users[m.sender])) {
                user.exp += m.exp
                user.diamond -= m.diamond * 1
            }

            let stat
            if (m.plugin) {
                let now = +new Date
                if (m.plugin in stats) {
                    stat = stats[m.plugin]
                    if (!isNumber(stat.total))
                        stat.total = 1
                    if (!isNumber(stat.success))
                        stat.success = m.error != null ? 0 : 1
                    if (!isNumber(stat.last))
                        stat.last = now
                    if (!isNumber(stat.lastSuccess))
                        stat.lastSuccess = m.error != null ? 0 : now
                } else
                    stat = stats[m.plugin] = {
                        total: 1,
                        success: m.error != null ? 0 : 1,
                        last: now,
                        lastSuccess: m.error != null ? 0 : now
                    }
                stat.total += 1
                stat.last = now
                if (m.error == null) {
                    stat.success += 1
                    stat.lastSuccess = now
                }
            }
        }

        try {
if (!opts['noprint']) await (await import(`./lib/print.js`)).default(m, this)
} catch (e) {
console.log(m, m.quoted, e)}
let settingsREAD = global.db.data.settings[this.user.jid] || {}  
if (opts['autoread']) await this.readMessages([m.key])
if (settingsREAD.autoread2) await this.readMessages([m.key])  
//if (settingsREAD.autoread2 == 'true') await this.readMessages([m.key])    
	    
if (!m.fromMem && m.text.match(/(albina|alya|Botsito|Gata|:v)/gi)) {
let emot = pickRandom(["😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🤩", "😏", "😳", "🥵", "🤯", "😱", "😨", "🤫", "🥴", "🤧", "🤑", "🤠", "🤖", "🤝", "💪", "👑", "😚", "🐱", "🐈", "🐆", "🐅", "⚡️", "🌈", "☃️", "⛄️", "🌝", "🌛", "🌜", "🍓", "🍎", "🎈", "🪄", "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💘", "💝", "💟", "🌝", "😎", "🔥", "🖕", "🐦"])
this.sendMessage(m.chat, { react: { text: emot, key: m.key }})}
function pickRandom(list) { return list[Math.floor(Math.random() * list.length)]}}}

/**
 * Handle groups participants update
 * @param {import('@adiwajshing/baileys').BaileysEventMap<unknown>['group-participants.update']} groupsUpdate 
 */
export async function participantsUpdate({ id, participants, action }) {
if (opts['self'])
return
// if (id in conn.chats) return // First login will spam
if (this.isInit)
return
if (global.db.data == null)
await loadDatabase()
let chat = global.db.data.chats[id] || {}
let text = ''
switch (action) {
case 'add':
if (chat.welcome) {
let groupMetadata = await this.groupMetadata(id) || (conn.chats[id] || {}).metadata
for (let user of participants) {
let pp = './src/sinfoto.jpg'
try {
pp = await this.profilePictureUrl(user, 'image')
} catch (e) {
} finally {
let apii = await this.getFile(pp)
const botTt2 = groupMetadata.participants.find(u => this.decodeJid(u.id) == this.user.jid) || {} 
const isBotAdminNn = botTt2?.admin === "admin" || false
text = (action === 'add' ? (chat.sWelcome || this.welcome || conn.welcome || 'Welcome, @user!').replace('@subject', await this.getName(id)).replace('@desc', groupMetadata.desc?.toString() || '*ᴜɴ ɢʀᴜᴘᴏ ɢᴇɴɪᴀ😸*\n *sɪɴ ʀᴇɢʟᴀ 😉*') :
(chat.sBye || this.bye || conn.bye || 'Bye, @user!')).replace('@user', '@' + user.split('@')[0])
if (chat.antifake && isBotAdminNn && action === 'add') {
const numerosPermitidos = ["212", "265", "92", "91", "90", "210", "60", "61", "62", "40", "48", "49", "93", "94", "98", "258"] //PUEDES EDITAR LOS USUARIOS QUE SE ELIMINARÁN SI EMPIEZA POR CUALQUIER DE ESOS NÚMEROS	
if (numerosPermitidos.some(num => user.startsWith(num))) {	
this.sendMessage(id, { text: `@${user.split("@")[0]} Nos numero fake no esta permitido el este grupo hasta la próxima...`, mentions: [user] }, { quoted: null });          
let responseb = await this.groupParticipantsUpdate(id, [user], 'remove')
if (responseb[0].status === "404") return      
return    
}}    
let username = this.getName(id)
let fkontak2 = { "key": { "participants":"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${user.split('@')[0]}:${user.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }}, "participant": "0@s.whatsapp.net" }      
let vn = 'https://qu.ax/cUYg.mp3'
let or = ['texto', 'audio'];
let media = or[Math.floor(Math.random() * 2)]
if (media === 'texto')
this.sendMessage(id, { text: text, 
contextInfo:{
forwardingScore: 9999999,
isForwarded: true, 
mentionedJid:[user],
"externalAdReply": {
"showAdAttribution": true,
"renderLargerThumbnail": true,
"thumbnail": apii.data, 
"title": [wm, ' ' + wm + '😊', '🌟'].getRandom(),
"containsAutoReply": true,
"mediaType": 1, 
sourceUrl: [md, nna, yt, nnn, nn, tiktok].getRandom()}}}, { quoted: fkontak2 }) 
if (media === 'audio')
this.sendMessage(id, { audio: { url: vn }, contextInfo:{ mentionedJid:[user], "externalAdReply": { "thumbnail": apii.data, "title": `乂 ＷＥＬＣＯＭＥ 乂`, "body": [wm, ' ' + wm + '😊', '🌟'].getRandom(), "previewType": "PHOTO", "thumbnailUrl": null, "showAdAttribution": true,  sourceUrl: [md, nna, yt, nn, tiktok].getRandom()}},  ptt: true, mimetype: 'audio/mpeg', fileName: `error.mp3` }, { quoted: fkontak2 })
//this.sendFile(id, apii.data, 'pp.jpg', text, null, false, { mentions: [user] }, { quoted: fkontak2 })
}}}
			    
break
case 'promote':
case 'daradmin':
case 'darpoder':
text = (chat.sPromote || this.spromote || conn.spromote || '@user ```is now Admin```')
case 'demote':
case 'quitarpoder':
case 'quitaradmin':
if (!text)
text = (chat.sDemote || this.sdemote || conn.sdemote || '@user ```is no longer Admin```')
text = text.replace('@user', '@' + participants[0].split('@')[0])
if (chat.detect)
//this.sendMessage(id, { text, mentions: this.parseMention(text) })
break
}}

/** 
 * Actualización de grupos de control
 * Handle groups update
 * @param {import('@adiwajshing/baileys').BaileysEventMap<unknown>['groups.update']} groupsUpdate 
 */
export async function groupsUpdate(groupsUpdate) {
if (opts['self'])
return
for (const groupUpdate of groupsUpdate) {
const id = groupUpdate.id
if (!id) continue
let chats = global.db.data.chats[id], text = ''
if (!chats?.detect) continue
// if (groupUpdate.desc) text = (chats.sDesc || this.sDesc || conn.sDesc || '```Description has been changed to```\n@desc').replace('@desc', groupUpdate.desc)
//if (groupUpdate.subject) text = (chats.sSubject || this.sSubject || conn.sSubject || '```Subject has been changed to```\n@subject').replace('@subject', groupUpdate.subject)
//if (groupUpdate.icon) text = (chats.sIcon || this.sIcon || conn.sIcon || '```Icon has been changed to```').replace('@icon', groupUpdate.icon)
if (groupUpdate.revoke) text = (chats.sRevoke || this.sRevoke || conn.sRevoke || '```Group link has been changed to```\n@revoke').replace('@revoke', groupUpdate.revoke)
if (!text) continue
await this.sendMessage(id, { text, mentions: this.parseMention(text) })
}}

export async function callUpdate(callUpdate) {
    let isAnticall = global.db.data.settings[this.user.jid].antiCall
    if (!isAnticall) return
    for (let nk of callUpdate) {
    if (nk.isGroup == false) {
    if (nk.status == "offer") {
    let callmsg = await this.reply(nk.from, `ʜᴏʟᴀ *@${nk.from.split('@')[0]}*, ʟᴀs ${nk.isVideo ? 'videollamadas' : 'llamadas'} ɴᴏ ᴇsᴛᴀɴ ᴘᴇʀᴍɪᴛɪᴅᴀs, sᴇʀᴀs ʙʟᴏǫᴜᴇᴀᴅᴏ.\n\nsɪ ᴀᴄᴄɪᴅᴇɴᴛᴀʟᴍᴇɴᴛᴇ ʟʟᴀᴍᴀsᴛᴇ ᴘᴏɴɢᴀsᴇ ᴇɴ ᴄᴏɴᴛᴀᴄᴛᴏ ᴄᴏɴ ᴍɪ ᴄʀᴇᴀᴅᴏʀ ᴘᴀʀᴀ ǫᴜᴇ ᴛᴇ ᴅᴇsʙʟᴏǫᴜᴇᴇ!\n\nɢʀᴜᴘᴏ ᴀsɪsᴛᴇɴᴄɪᴀ ғᴀᴄᴇʙᴏᴏᴋ: https://facebook.com/groups/872989990425789/`, false, { mentions: [nk.from] })
    //let data = global.owner.filter(([id, isCreator]) => id && isCreator)
    //await this.sendContact(nk.from, data.map(([id, name]) => [id, name]), false, { quoted: callmsg })
    let vcard = `BEGIN:VCARD\nVERSION:3.0\nN:;𝙇𝙤𝙡𝙞𝘽𝙤𝙩-𝙈𝘿 👑;;;\nFN:𝙇𝙤𝙡𝙞𝘽𝙤𝙩-𝙈𝘿\nORG:𝙇𝙤𝙡𝙞𝘽𝙤𝙩-𝙈𝘿 👑\nTITLE:\nitem1.TEL;waid=573147616444:+57 314 7616444\nitem1.X-ABLabel:𝙇𝙤𝙡𝙞𝘽𝙤𝙩-𝙈𝘿 👑\nX-WA-BIZ-DESCRIPTION:[❗] ᴇsᴄʀɪʙɪ sᴏʟᴏ ᴘᴏʀ ᴄᴏsᴀs ᴅᴇʟ ʙᴏᴛ.\nX-WA-BIZ-NAME:𝙇𝙤𝙡𝙞𝘽𝙤𝙩-𝙈𝘿 👑\nEND:VCARD`
    await this.sendMessage(nk.from, { contacts: { displayName: '𝙇𝙤𝙡𝙞𝘽𝙤𝙩-𝙈𝘿 👑', contacts: [{ vcard }] }}, {quoted: callmsg})
    await this.updateBlockStatus(nk.from, 'block')
    }
    }
    }
}

export async function deleteUpdate(message) {
try {
const { fromMe, id, participant } = message
if (fromMe) return 
let msg = this.serializeM(this.loadMessage(id))
let chat = global.db.data.chats[msg?.chat] || {}
if (!chat?.delete) return 
if (!msg) return 
if (!msg?.isGroup) return 
const antideleteMessage = `*[ ANTI ELIMINAR ]*\n\n@${participant.split`@`[0]} Elimino un mensaje\nEnviando el mensaje...\n\n*Para desactivar esta función escriba:*\n#disable delete`.trim();
await this.sendMessage(msg.chat, {text: antideleteMessage, mentions: [participant]}, {quoted: msg})
this.copyNForward(msg.chat, msg).catch(e => console.log(e, msg))
} catch (e) {
console.error(e)
}}

global.dfail = (type, m, conn, usedPrefix) => {
    let msg = {
        rowner: '🌸 Ukyuu~ ¡Ups! Este comando es exclusivo para mi querido propietario~ 💻💞 Pero no te preocupes, senpai~ ¡Hay muchas otras cositas que puedes probar conmigo! ❄️💋✨',
        owner: '🌸 Ukyuu~ ¡Ups! Este comando es exclusivo para mi querido propietario~ 💻💞 Pero no te preocupes, senpai~ ¡Hay muchas otras cositas que puedes probar conmigo! ❄️💋✨',
        mods: '🌸 Ukyuu~ Este comando solo puedo usarlo yo, da~ 💻✨ Privilegios de mod encantadora~ 😘💅🏻 Pero no te pongas celoso, senpai~ ¡Hay muchas otras cosas que tú también puedes disfrutar conmigo~! ❄️💞',
        premium: '🌸 Ukyuu~ Este comando es solo para usuarios Premium, da~ 💎✨ Ser VIP tiene sus beneficios, ¿verdad que suena tentador, senpai~? 💋🌟',
        group: '🌸 Ukyuu~ Este comando sólo funciona en grupos, da~ 💬❄️ ¿Por qué no me invitas a uno, senpai~? Prometo portarme linda~ 💋✨',
        private: '🌸 Ukyuu~ Vamos al privado, da~ 💌🤫 Este comando solo funciona en el privado del bot~ Shshh… hablemos a solas, senpai~ 💋❄️',
        admin: '🌸 Ukyuu~ Lo siento, senpai... 😳 Solo los admins pueden usar este comando~ 🛡️❄️ ¡Alya necesita que un admin esté aquí para ayudarte mejor! 💋✨',
        botAdmin: '🌸 Ukyuu~ Haz admin a mí, Alya, senpai~ 💻💕 Sin admin, no puedo usar este comando, da! ❄️💋 ¡Así que hazlo rápido, por favor~! ✨🫶🏻',
        unreg: '🌸 Ukyuu~ Uy, no apareces en mi base de datos, senpai... \n Para poder jugar conmigo, necesitas registrarte~ \n✨ 📋 Comando: #reg nombre.edad \n 💡 Ejemplo: #reg Alya.18 \n ¡No te tardes, da~! 🩵💻💫',
        restrict: '🔐 Ukyuu~ Este comando está desactivado por mi jefe, senpai... ❄️💼 Lo siento, no puedo usarlo ahora mismo~ 🥺💖'
    }[type]
    if (msg) return conn.sendMessage(m.chat, { 
    text: msg, 
    contextInfo: { 
        mentionedJid: null
    } 
}, { quoted: m })
}

const file = global.__filename(import.meta.url, true);
watchFile(file, async () => {
  unwatchFile(file);
  console.log(chalk.redBright('Update \'handler.js\''));
  if (global.reloadHandler) console.log(await global.reloadHandler());
  
  if (global.conns && global.conns.length > 0 ) {
    const users = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])];
    for (const userr of users) {
      userr.subreloadHandler(false)
    }
  }
  
});
