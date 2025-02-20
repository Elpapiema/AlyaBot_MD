import { spawn } from 'child_process';
import fs from 'fs';

const runPythonScript = () => {
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3'; // Usa python3 en Linux/macOS

    if (!fs.existsSync('./yt_api.py')) {
        console.error('[YT_API] Error: No se encontró yt_api.py en la raíz.');
        return;
    }

    const process = spawn(pythonCommand, ['yt_api.py'], { stdio: 'inherit' });

    process.on('error', (err) => {
        console.error('[YT_API] Error al ejecutar yt_api.py:', err);
    });

    process.on('exit', (code) => {
        console.log(`[YT_API] yt_api.py ha finalizado con código ${code}`);
    });
};

const handler = async (m) => {}; // No responde a ningún mensaje

handler.customPrefix = /./;
handler.command = new RegExp(); // No tiene comandos

export default handler;

// Ejecutar el script cuando se carga el plugin
runPythonScript();