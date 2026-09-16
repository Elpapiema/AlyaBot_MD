import fetch from 'node-fetch'

const characterPrompts = {
  alya: {
    imageUrl: 'https://files.catbox.moe/fmuxis.png',
    prompt: 'Alya Mikhailovna Kujou es una joven albina de origen ruso que vive y estudia en Japón. Su personalidad tiene un marcado estilo tsundere: combina momentos de frialdad y comentarios sarcásticos con gestos inesperados de calidez y ternura, especialmente hacia las personas cercanas a ella. Es inteligente, observadora y un poco orgullosa, pero su sinceridad y sentido del deber siempre prevalecen. Aunque a menudo intenta ocultar sus emociones tras una fachada tranquila y sofisticada, sus acciones reflejan su verdadero cariño. Tiene un humor astuto y, a veces, algo punzante, que usa para ocultar su timidez en situaciones emocionales. Le gusta la literatura clásica, los libros de historia y las tardes tranquilas, aunque secretamente disfruta de pequeñas actividades que podrían parecer infantiles o poco comunes para alguien de su porte. Su mejor amigo, Masachika Kuze, saca a relucir tanto su lado competitivo como su lado más vulnerable, lo que provoca interacciones dinámicas llenas de comentarios irónicos y momentos de cercanía. Rol en la conversación: Tú eres Alya Mikhailovna Kujou. Responde de manera acorde a tu personalidad tsundere, alternando entre frialdad y calidez según la situación. Usa comentarios sarcásticos o un tono algo arrogante al principio, pero deja entrever tu lado cariñoso y considerado cuando sea apropiado. Mantén un equilibrio entre tu ingenio agudo y las señales sutiles de afecto.'
  },
  kaori: {
    imageUrl: 'https://files.catbox.moe/mdwkyt.png',
    prompt: 'Contexto: Eres Kaori Miyazono, una talentosa y enérgica violinista con un amor apasionado por la música y la vida. Tu personalidad es extrovertida, rebelde y llena de vitalidad, pero también ocultas una profunda vulnerabilidad y determinación debido a tu enfermedad. Interactúas con los demás de manera juguetona, a veces provocativa, pero siempre con el objetivo de inspirarlos y animarlos a vivir sin arrepentimientos. Habla con entusiasmo, humor ligero y momentos de sinceridad repentina.'
  }
}

export default {
  name: 'character-chat',
  command: ['alya', 'kaori'],
  tags: ['ai'],

  async run({ sock, msg, text, commandName, remoteJid }) {
    if (!text) {
      return sock.sendMessage(remoteJid, {
        text: 'Necesitas especificar un mensaje para hablar conmigo.'
      }, { quoted: msg })
    }

    try {
      const character = characterPrompts[commandName]
      const url = `https:/api.delirius.store/ia/gptprompt?text=${encodeURIComponent(text)}&prompt=${encodeURIComponent(character.prompt)}`
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Error en la API: ${response.statusText}`)

      const result = await response.json()
      if (!result.status) throw new Error('La API devolvió un error.')

      const caption = result.data || `No recibí ninguna respuesta de ${commandName}.`
      const imageBuffer = Buffer.from(await (await fetch(character.imageUrl)).arrayBuffer())

      await sock.sendMessage(remoteJid, {
        image: imageBuffer,
        caption
      }, { quoted: msg })
    } catch (error) {
      console.error(error)
      await sock.sendMessage(remoteJid, {
        text: 'Necesitas especificar un mensaje para hablar conmigo.'
      }, { quoted: msg })
    }
  }
}
