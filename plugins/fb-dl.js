import fetch from 'node-fetch'

let handler = async (m, { args, command, conn }) => {
  if (!args[0]) throw `*Uso correcto: .${command} <enlace de Facebook>*`

  const res = await fetch(`https://eliasar-yt-api.vercel.app/api/facebookdl?link=${encodeURIComponent(args[0])}`)
  if (!res.ok) throw `*Error al contactar con la API*`

  const json = await res.json()
  if (!json.status || !json.data || !json.data.length) throw '*No se pudo obtener el video.*'

  let video = json.data[0].url
  await conn.sendFile(m.chat, video, 'facebook.mp4', '✅ *Aquí tienes tu video de Facebook*', m)
}

handler.help = ['facebook', 'fb'].map(v => v + ' <enlace>')
handler.tags = ['downloader']
handler.command = ['fb', 'facebook']

export default handler