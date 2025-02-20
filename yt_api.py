from flask import Flask, request, jsonify, send_file, url_for
import yt_dlp
import os
import re
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Habilitar CORS para evitar bloqueos

# Carpeta de descargas
DOWNLOAD_FOLDER = os.path.join(os.getcwd(), "downloads")
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)

# Ruta para servir archivos descargados
@app.route('/downloads/<path:filename>')
def serve_file(filename):
    file_path = os.path.join(DOWNLOAD_FOLDER, filename)

    # Verificar si el archivo existe antes de enviarlo
    if not os.path.exists(file_path):
        return jsonify({"error": "Archivo no encontrado"}), 404

    return send_file(file_path, as_attachment=True)

# Ruta para descargar audio
@app.route('/download_audio', methods=['GET'])
def download_audio():
    url = request.args.get('url')

    if not url:
        return jsonify({'error': 'Falta el parámetro URL'}), 400

    try:
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': os.path.join(DOWNLOAD_FOLDER, '%(title)s.%(ext)s'),  # Guarda con título original
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)

            # Detectar automáticamente el archivo descargado
            downloaded_files = os.listdir(DOWNLOAD_FOLDER)
            downloaded_files.sort(key=lambda x: os.path.getctime(os.path.join(DOWNLOAD_FOLDER, x)), reverse=True)  # Ordenar por fecha de creación
            original_filename = downloaded_files[0]  # Tomar el archivo más reciente

            # Generar un nombre seguro para la URL
            safe_title = re.sub(r'[^\w\-_.]', '_', info['title'])
            new_filename = f"{safe_title}.mp3"
            old_path = os.path.join(DOWNLOAD_FOLDER, original_filename)
            new_path = os.path.join(DOWNLOAD_FOLDER, new_filename)

            # Renombrar el archivo si es necesario
            if old_path != new_path:
                os.rename(old_path, new_path)

        # Generar URL accesible
        file_url = url_for('serve_file', filename=new_filename, _external=True)

        return jsonify({'message': 'Descarga de audio completada', 'file_url': file_url})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Ruta para descargar video
@app.route('/download_video', methods=['GET'])
def download_video():
    url = request.args.get('url')

    if not url:
        return jsonify({'error': 'Falta el parámetro URL'}), 400

    try:
        ydl_opts = {
            'format': 'best[height<=360]',  # Calidad máxima 360p
            'outtmpl': os.path.join(DOWNLOAD_FOLDER, '%(title)s.%(ext)s'),
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)

            # Detectar automáticamente el archivo descargado
            downloaded_files = os.listdir(DOWNLOAD_FOLDER)
            downloaded_files.sort(key=lambda x: os.path.getctime(os.path.join(DOWNLOAD_FOLDER, x)), reverse=True)
            original_filename = downloaded_files[0]

            # Limpiar el nombre del archivo
            safe_title = re.sub(r'[^\w\-_.]', '_', info['title'])
            new_filename = f"{safe_title}.mp4"
            old_path = os.path.join(DOWNLOAD_FOLDER, original_filename)
            new_path = os.path.join(DOWNLOAD_FOLDER, new_filename)

            if old_path != new_path:
                os.rename(old_path, new_path)

        # URL accesible
        file_url = url_for('serve_file', filename=new_filename, _external=True)

        return jsonify({
            'message': 'Descarga de video completada',
            'title': info.get('title', 'Desconocido'),
            'duration': info.get('duration', 0),
            'quality': '360p',
            'views': info.get('view_count', 0),
            'likes': info.get('like_count', 0),
            'comments': info.get('comment_count', 0),
            'file_url': file_url
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')