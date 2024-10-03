import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;
const completadoImage = './src/completado.jpg';

// Función para obtener datos desde un archivo JSON
const obtenerDatos = () => {
    try {
        return fs.existsSync('data.json') 
            ? JSON.parse(fs.readFileSync('data.json', 'utf-8')) 
            : { 'usuarios': {}, 'personajesReservados': [] };
    } catch (error) {
        console.error('Error al leer data.json:', error);
        return { 'usuarios': {}, 'personajesReservados': [] };
    }
};

// Función para guardar datos en el archivo JSON
const guardarDatos = (datos) => {
    try {
        fs.writeFileSync('data.json', JSON.stringify(datos, null, 2));
    } catch (error) {
        console.error('Error al escribir en data.json:', error);
    }
};

// Función para reservar un personaje
const reservarPersonaje = (userId, personaje) => {
    let datos = obtenerDatos();
    datos.personajesReservados.push({ userId, ...personaje });
    guardarDatos(datos);
};

// Función para obtener los personajes desde un archivo JSON
const obtenerPersonajes = () => {
    try {
        return JSON.parse(fs.readFileSync('./src/JSON/characters.json', 'utf-8'));
    } catch (error) {
        console.error('Error al leer characters.json:', error);
        return [];
    }
};

// Manejador principal del comando
let cooldowns = {};

const handler = async (message, { conn }) => {
    try {
        let senderId = message.sender;
        let currentTime = new Date().getTime();
        let cooldownTime = 10 * 60 * 1000; // 10 minutos en milisegundos
        let lastUsed = cooldowns[senderId] || 0;
        let timeDifference = currentTime - lastUsed;

        if (timeDifference < cooldownTime) {
            let remainingTime = cooldownTime - timeDifference;
            let minutes = Math.floor(remainingTime / (1000 * 60));
            let seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
            let cooldownMessage = `Espera ${minutes} minutos y ${seconds} segundos para usar este comando nuevamente.`;
            await conn.sendMessage(message.chat, { text: cooldownMessage });
            return;
        }

        // Verificación de la validez del bot
        const validarBot = () => {
            try {
                const packageData = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
                if (packageData.name !== 'Raphtalia-Bot-MD') return false;
                if (packageData.repository.url !== 'git+https://github.com/David-Chian/Megumin-Bot-MD.git') return false;
                if (SECRET_KEY !== '49rof384foerAlkkO4KF4Tdfoflw') return false;
                return true;
            } catch (error) {
                console.error('Error en la validación del bot:', error);
                return false;
            }
        };

        if (!validarBot()) {
            await conn.sendMessage(message.chat, 'Comando no autorizado.');
            return;
        }

        let datos = obtenerDatos();
        let personajes = obtenerPersonajes();
        let personajesDisponibles = personajes.filter(personaje => {
            let reservado = datos.personajesReservados.find(res => res.url === personaje.url);
            let enUso = Object.values(datos.usuarios).some(user => 
                user.personajesReservados.some(res => res.url === personaje.url)
            );
            return !reservado && !enUso;
        });

        if (personajesDisponibles.length === 0) {
            await conn.sendMessage(message.chat, { image: { url: completadoImage }, caption: 'Todos los personajes han sido reservados.' });
            return;
        }

        let personajeAleatorio = personajesDisponibles[Math.floor(Math.random() * personajesDisponibles.length)];
        let personajeId = uuidv4();
        let mensajeEstado = '';

        let reservadoPor = datos.personajesReservados.find(res => res.url === personajeAleatorio.url);
        let reservadoPara = Object.entries(datos.usuarios).find(([key, value]) => 
            value.personajesReservados.some(res => res.url === personajeAleatorio.url)
        );

        if (reservadoPara) {
            mensajeEstado = `Reservado por ${reservadoPara[1].name}`;
        } else if (reservadoPor) {
            mensajeEstado = `Ocupado por ${reservadoPor.userId}`;
        } else {
            mensajeEstado = 'Libre';
        }

        const mensajePersonaje = `
            Nombre: ${personajeAleatorio.name}
            Estado: ${mensajeEstado}
            Identificador: ${personajeId}
        `;

        await conn.sendMessage(message.chat, {
            image: { url: personajeAleatorio.url },
            caption: mensajePersonaje,
            mimetype: 'image/jpeg',
            contextInfo: {
                mentionedJid: reservadoPara ? [reservadoPara[1]] : [],
                externalAdReply: {
                    showAdAttribution: true,
                    title: '¡Nuevo personaje!',
                    body: 'Felicitaciones, has obtenido un nuevo personaje.',
                    thumbnailUrl: personajeAleatorio.url,
                    sourceUrl: 'https://github.com/David-Chian/Megumin-Bot-MD',
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        });

        if (!reservadoPara) {
            reservarPersonaje(senderId, { ...personajeAleatorio, id: personajeId });
        }

        cooldowns[senderId] = currentTime;
        console.log(`Cooldown actualizado para ${senderId}: ${cooldowns[senderId]}`);

    } catch (error) {
        console.error('Error en el handler:', error);
        await conn.sendMessage(message.chat, { text: 'Ocurrió un error al procesar tu solicitud.' });
    }
};

export default handler;