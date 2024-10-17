import fetch from 'node-fetch';
import yts from 'yt-search';
import ytdl from 'ytdl-core';
import axios from 'axios';
import {youtubedl, youtubedlv2} from '@bochilteam/scraper';
const handler = async (m, {conn, command, args, text, usedPrefix}) => {
if (!text) throw `${lenguajeGB['smsAvisoMG']()}${mid.smsMalused4}\n*${usedPrefix + command} Billie Eilish - Bellyache*`
try { 
const yt_play = await search(args.join(' '))
const texto1 = `*𓆩 𓃠 𓆪 ✧═══ ${vs} ═══✧ 𓆩 𓃠 𓆪*

ও ${mid.smsYT1}
» ${yt_play[0].title}
﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘
ও ${mid.smsYT5}
» ${secondString(yt_play[0].duration.seconds)}
ও  ${mid.smsYT2}
» ${yt_play[0].author.name}
﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘
ও ${mid.smsYT4}
» ${yt_play[0].url}

*𓆩 𓃠 𓆪 ✧═══ ${vs} ═══✧ 𓆩 𓃠 𓆪*`.trim()

await conn.sendButton(m.chat, wm, texto1, yt_play[0].thumbnail, [['Audio', `${usedPrefix}yta ${yt_play[0].url}`], ['Video', `${usedPrefix}ytv ${yt_play[0].url}`]], null, null, m)


await conn.reply(m.chat, `${lenguajeGB['smsMalError3']()}#report ${lenguajeGB['smsMensError2']()} ${usedPrefix + command}\n\n${wm}`, fkontak, m)
console.log(`❗❗ ${lenguajeGB['smsMensError2']()} ${usedPrefix + command} ❗❗`)
console.log(e)
handler.limit = 0
}}
handler.command = ['play', 'play2', 'play3', 'play4']
//handler.limit = 3
//handler.register = true 
export default handler;

async function search(query, options = {}) {
const search = await yts.search({query, hl: 'es', gl: 'ES', ...options});
return search.videos;
}

function MilesNumber(number) {
const exp = /(\d)(?=(\d{3})+(?!\d))/g;
const rep = '$1.';
const arr = number.toString().split('.');
arr[0] = arr[0].replace(exp, rep);
return arr[1] ? arr.join('.') : arr[0];
}

function secondString(seconds) {
seconds = Number(seconds);
const d = Math.floor(seconds / (3600 * 24));
const h = Math.floor((seconds % (3600 * 24)) / 3600);
const m = Math.floor((seconds % 3600) / 60);
const s = Math.floor(seconds % 60);
const dDisplay = d > 0 ? d + (d == 1 ? ' día, ' : ' días, ') : '';
const hDisplay = h > 0 ? h + (h == 1 ? ' hora, ' : ' horas, ') : '';
const mDisplay = m > 0 ? m + (m == 1 ? ' minuto, ' : ' minutos, ') : '';
const sDisplay = s > 0 ? s + (s == 1 ? ' segundo' : ' segundos') : '';
return dDisplay + hDisplay + mDisplay + sDisplay;
  }
