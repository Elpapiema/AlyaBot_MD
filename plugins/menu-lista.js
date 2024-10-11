import axios from 'axios';

const sendMenuGif = async (client, message) => {
  // Definimos los enlaces de los videos
  const videoLinks = [
    'https://qu.ax/UYGf.mp4',
    'https://qu.ax/kOwY.mp4',
    'https://qu.ax/WgJR.mp4'
  ];

  // Selecciona un video aleatorio de la lista
  const randomIndex = Math.floor(Math.random() * videoLinks.length);
  const videoUrl = videoLinks[randomIndex];

  // Mensaje que se enviará junto con la multimedia
  const welcomeMessage = 'Bienvenido al menú. Por el momento este menú está en construcción. Use .allmenu para ver el menú hecho por GataNina-Li.';

  try {
    // Descarga el video desde la URL
    const response = await axios({
      url: videoUrl,
      method: 'GET',
      responseType: 'arraybuffer'
    });

    const buffer = Buffer.from(response.data, 'binary');

    // Envía el video como un "gif" (looped MP4) junto con el mensaje
    await client.sendMessage(message.key.remoteJid, {
      video: buffer,
      gifPlayback: true, // Esto indica a WhatsApp que debe interpretarlo como un GIF
      caption: welcomeMessage // Mensaje que se enviará junto con el GIF
    });
  } catch (error) {
    console.error('Error al enviar el GIF: ', error);
  }
};

// Definición del handler
const handler = async (client, message, args) => {
  await sendMenuGif(client, message);
};

// Propiedades adicionales del handler
handler.help = ['#menu']; // Ayuda para el comando
handler.tags = ['help']; // Categoría del comando
handler.command = ['menu']; // Comando que dispara el handler

export default handler;