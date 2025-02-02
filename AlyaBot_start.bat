@echo off
REM Verificar si el script se ejecuta como administrador
net session >nul 2>&1
if %errorlevel% == 0 (
    echo Ejecutando con permisos de administrador...
) else (
    echo Solicitud de permisos de administrador...
    REM Solicitar elevación de permisos
    powershell -Command "Start-Process '%~f0' -Verb runAs"
    exit /b
)

REM Verificar si Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js no está instalado. Ejecutando instalador...
    start /wait node-installer.exe
) else (
    echo Node.js ya está instalado.
)

REM Verificar si Git está instalado
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo Git no está instalado. Ejecutando instalador...
    start /wait git-installer.exe
) else (
    echo Git ya está instalado.
)

REM Verificar si ImageMagick está instalado
where convert >nul 2>nul
if %errorlevel% neq 0 (
    echo ImageMagick no está instalado. Ejecutando instalador...
    start /wait imagemagick-installer.exe
) else (
    echo ImageMagick ya está instalado.
)

REM Ejecutar Git pull
echo Ejecutando git pull...
git pull

REM Ejecutar npm install
echo Ejecutando npm install...
npm install

REM Ejecutar node index.js
echo Ejecutando node index.js...
node index.js

pause