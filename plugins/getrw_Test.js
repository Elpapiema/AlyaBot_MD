import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
    try {
        // Consulta a la API principal
        let res = await fetch('https://eliasar-yt-api.vercel.app/api/rw');
        if (!res.ok) throw new Error('Error al obtener datos de la API');

        let { character } = await res.json();
        if (!character) throw new Error('No se encontraron datos del personaje');

        let { name, url } = character;

        // Consulta para obtener los datos faltantes desde internet
        let searchRes = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(name)}&format=json`);
        if (!searchRes.ok) throw new Error('Error al buscar datos en internet');

        let searchResult = await searchRes.json();
        let description = searchResult?.AbstractText || 'Información no disponible';

        // Extraer los datos adicionales de la descripción
        let age = description.match(/(\d+ años|\d+ años de edad)/i)?.[0] || 'Desconocida';
        let relationship = description.includes('soltera') ? 'Soltera' : description.includes('casada') ? 'Casada' : 'Desconocida';
        let source = searchResult?.Heading || 'Desconocido';

        // Crear el JSON de salida
        let jsonOutput = {
            name,
            age,
            relationship,
            source,
            img: url
        };

        // Enviar JSON como respuesta
        m.reply(JSON.stringify(jsonOutput, null, 2));
    } catch (e) {
        console.error(e);
        m.reply('Ocurrió un error al procesar tu solicitud.');
    }
};

handler.command = ['getrw'];
export default handler;