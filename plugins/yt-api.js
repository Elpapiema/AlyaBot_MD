import { spawn } from 'child_process';

const runPythonScript = () => {
    const process = spawn('python', ['yt_api.py'], { stdio: 'inherit' });

    process.on('error', (err) => {
        console.error('[YT_API] Error al ejecutar yt_api.py:', err);
    });

    process.on('exit', (code) => {
        console.log(`[YT_API] yt_api.py ha finalizado con código ${code}`);
    });
};

const handler = async (m) => {}; // No responde a ningún mensaje, solo es para ejecución automática

handler.customPrefix = /./;
handler.command = new RegExp(); // No tiene comandos

export default handler;

// Ejecutar el script cuando se carga el plugin
runPythonScript();