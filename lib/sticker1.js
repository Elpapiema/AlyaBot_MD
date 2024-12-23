import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import os from 'os';

const tmpDir = os.tmpdir();

/**
 * Convierte una imagen o video a un sticker en formato webp.
 * @param {Buffer} mediaBuffer - Imagen o video en formato buffer.
 * @param {string} mime - MIME type del archivo (e.g., 'image/jpeg', 'video/mp4').
 * @param {Object} options - Opciones para el sticker.
 * @param {string} options.pack - Nombre del paquete.
 * @param {string} options.author - Autor del sticker.
 * @returns {Promise<Buffer>} - Buffer del sticker en formato webp.
 */
export async function sticker(mediaBuffer, mime, options = { pack: 'Sticker Pack', author: 'Alya Bot' }) {
    try {
        const tmpFile = path.join(tmpDir, `input_${Date.now()}`);
        const outputSticker = path.join(tmpDir, `sticker_${Date.now()}.webp`);

        // Guardar el buffer como un archivo temporal
        fs.writeFileSync(tmpFile, mediaBuffer);

        if (mime.startsWith('image/')) {
            // Procesar imagen y convertirla a webp
            await sharp(tmpFile)
                .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
                .webp({ quality: 100, lossless: true })
                .toFile(outputSticker);
        } else if (mime.startsWith('video/')) {
            // Procesar video y convertirlo a un sticker animado webp
            await new Promise((resolve, reject) => {
                ffmpeg(tmpFile)
                    .inputOptions('-t 8') // Limitar duración a 8 segundos
                    .size('512x512') // Ajustar resolución
                    .outputOptions([
                        '-vcodec libwebp',
                        '-vf scale=512:512:force_original_aspect_ratio=decrease,fps=15',
                        '-loop 0',
                        '-preset default',
                        '-an',
                        '-vsync 0',
                    ])
                    .save(outputSticker)
                    .on('end', resolve)
                    .on('error', reject);
            });
        } else {
            throw new Error('Formato de archivo no soportado. Use una imagen o un video.');
        }

        // Leer el archivo temporal resultante como buffer
        const stickerBuffer = fs.readFileSync(outputSticker);

        // Limpiar archivos temporales
        fs.unlinkSync(tmpFile);
        fs.unlinkSync(outputSticker);

        return stickerBuffer;
    } catch (error) {
        console.error('Error al generar el sticker:', error);
        throw new Error('No se pudo crear el sticker.');
    }
}
