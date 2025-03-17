import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'plugins', 'nsfw-menu.js');

// Verificar si el archivo ya existe
if (!fs.existsSync(filePath)) {
  // Contenido del archivo a crear
  const content = `let handler = async (m) => {
  await m.reply('Los comandos NSFW no están instalados. Usa #getpack Paquete +18 para instalar.');
};

handler.command = ['menunsfw'];

export default handler;
`;

  // Escribir el archivo
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Archivo "nsfw-menu.js" creado correctamente.');
} else {
  console.log('⚠️ El archivo "nsfw-menu.js" ya existe y no ha sido modificado.');
}
