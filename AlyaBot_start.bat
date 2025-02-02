@echo off
REM Función para imprimir mensajes con formato
:printMessage
    echo [%~1] %~2
    exit /b

REM Verificar si Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Node.js no está instalado. Verificando instalador...
    if exist "node-installer.exe" (
        echo [INFO] Ejecutando instalador de Node.js...
        start /wait node-installer.exe
    ) else (
        echo [ERROR] No se encontró el instalador de Node.js (node-installer.exe).
        exit /b
    )
) else (
    echo [INFO] Node.js ya está instalado.
)

REM Verificar si Git está instalado
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Git no está instalado. Verificando instalador...
    if exist "git-installer.exe" (
        echo [INFO] Ejecutando instalador de Git...
        start /wait git-installer.exe
    ) else (
        echo [ERROR] No se encontró el instalador de Git (git-installer.exe).
        exit /b
    )
) else (
    echo [INFO] Git ya está instalado.
)

REM Verificar si ImageMagick está instalado
where convert >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] ImageMagick no está instalado. Verificando instalador...
    if exist "imagemagick-installer.exe" (
        echo [INFO] Ejecutando instalador de ImageMagick...
        start /wait imagemagick-installer.exe
    ) else (
        echo [ERROR] No se encontró el instalador de ImageMagick (imagemagick-installer.exe).
        exit /b
    )
) else (
    echo [INFO] ImageMagick ya está instalado.
)

REM Ejecutar Git pull
echo [INFO] Verificando Actualizaciones...
git pull
if %errorlevel% neq 0 (
    echo [ERROR] Falló la Actualizacion. Verifica tu conexión a Internet.
    exit /b
)

REM Ejecutar npm install (ignorar crasheo)
echo [INFO] instalando Dependencias...
npm install
if %errorlevel% neq 0 (
    echo [WARNING] Instalacion completa.
)

REM Ejecutar node index.js
echo [INFO] Iniciando AlyaBot ...
node index.js
if %errorlevel% neq 0 (
    echo [ERROR] Falló al iniciar . Verifica la instalacion.
    exit /b
)

echo [INFO] Proceso completado exitosamente.
pause