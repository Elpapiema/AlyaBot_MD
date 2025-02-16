@echo off
REM Verificar si Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Node.js no está instalado. Ejecutando instalador...
    start /wait node-installer.msi
) else (
    echo [INFO] Node.js ya esta instalado.
)

REM Verificar si Git está instalado
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Git no está instalado. Ejecutando instalador...
    start /wait git-installer.exe
) else (
    echo [INFO] Git ya esta instalado.
)

REM Verificar si ImageMagick está instalado
where convert >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] ImageMagick no está instalado. Ejecutando instalador...
    start /wait imagemagick-installer.exe
) else (
    echo [INFO] ImageMagick ya esta instalado.
)

REM Ejecutar Git pull
echo [INFO] Verificando Actualizaciones...
git pull

REM Ejecutar npm install (ignorar crasheo)
echo [INFO] Instalando Dependencias...
npm install
if %errorlevel% neq 0 (
    echo [ADVERTENCIA] Se detectó un problema después de npm install, pero se ignorará para continuar.
)

REM Ejecutar node index.js
echo Ejecutando node index.js...
node index.js

pause