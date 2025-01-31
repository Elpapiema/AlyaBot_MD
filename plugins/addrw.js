import fetch from 'node-fetch';

const handler = async (m, { text, usedPrefix, command }) => {
    const args = text.split(',').map(arg => arg.trim()); // Separar por comas y eliminar espacios extra

    if (args.length < 5) {
        return m.reply(`Uso incorrecto del comando.\nFormato: ${usedPrefix}${command} <Nombre del personaje>, <Edad>, <Situación sentimental>, <Origen>, <Enlace de imagen> \n \n > Nota: el link debe estar en catbox.moe o en qu.ax si se usa qu.ax se debe configurar cono permanente`);
    }

    // Asignar valores
    const [name, age, relationship, source, img] = args;

    // Validar la URL de la imagen
    if (!img.startsWith('http')) {
        return m.reply('Por favor, proporciona un enlace válido para la imagen.');
    }

    // Crear el objeto JSON
    const characterData = {
        name,
        age: parseInt(age),
        relationship,
        source,
        img
    };

    // ID del grupo del staff
    const staffGroupId = '120363350160478830@g.us';

    // Enviar al grupo del staff
    const jsonMessage = `Nuevo personaje añadido:\n\`\`\`${JSON.stringify(characterData, null, 2)}\`\`\``;
    await conn.sendMessage(staffGroupId, { text: jsonMessage });

    // Confirmar al usuario
    m.reply(`El personaje "${name}" ha sido añadido correctamente y enviado al grupo del staff.`);
};

handler.command = ['addcharacter', 'addrw'];
export default handler;


/*import fetch from 'node-fetch';

const handler = async (m, { text, usedPrefix, command }) => {
    const args = text.split(' ');
    if (args.length < 5) {
        return m.reply(`Uso incorrecto del comando.\nFormato: ${usedPrefix}${command} <Nombre del personaje> <Edad> <Situación sentimental> <Origen> <Enlace de imagen> \n Nota: el link debe estar en catbox.moe o en qu.ax si se usa qu.ax se debe configurar cono permanente`);
    }

    // Separar los argumentos
    const [name, age, relationship, source, img] = [
        args.slice(0, -4).join(' '), // Nombre del personaje
        args[args.length - 4],       // Edad
        args[args.length - 3],       // Situación sentimental
        args[args.length - 2],       // Origen
        args[args.length - 1]        // URL de la imagen
    ];

    // Validar la URL de la imagen
    if (!img.startsWith('http')) {
        return m.reply('Por favor, proporciona un enlace válido para la imagen.');
    }

    // Crear el objeto JSON
    const characterData = {
        name,
        age: parseInt(age),
        relationship,
        source,
        img
    };

    // ID del grupo del staff
    const staffGroupId = '120363395553029777@g.us'; // Reemplaza con el ID del grupo del staff

    // Enviar al grupo del staff
    const jsonMessage = `Nuevo personaje añadido:\n\`\`\`${JSON.stringify(characterData, null, 2)}\`\`\``;
    await conn.sendMessage(staffGroupId, { text: jsonMessage });

    // Confirmar al usuario
    m.reply(`El personaje "${name}" ha sido enviado al grupo del staff para su posterior adicion.`);
};

handler.command = ['addcharacter', 'addrw'];
export default handler;*/