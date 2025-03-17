const generateToken = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (let i = 0; i < 8; i++) {
        token += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return token;
};

const handler = async (m, { args }) => {

    // Verificar que el comando tenga los parámetros necesarios (valor y máximo de usos)
    if (args.length < 1) {
        return m.reply('⚠️ Debes proporcionar el valor y el número máximo de usos.\nEjemplo: *.ctoken 200, 50*');
    }

    // Dividir los argumentos por coma
    const [value, maxUses] = args[0].split(',').map(item => item.trim());

    // Validar los parámetros
    if (!value || isNaN(maxUses)) {
        return m.reply('⚠️ El formato es incorrecto. Debes usar el formato: *.ctoken valor, máximo_uso*');
    }

    // Generar el token
    const token = generateToken();
    const creationDate = new Date().toISOString(); // Obtener la fecha de creación

    // Responder con el token y la información
    return m.reply(`✅ Token generado: *${token}*\n🔹 Valor: ${value}\n🔸 Máximo de usos: ${maxUses}\n📅 Fecha de creación: ${creationDate}`);
};

handler.command = ['ctoken'];  // Definir el comando
handler.rowner = true;  // Solo para los propietarios

export default handler;