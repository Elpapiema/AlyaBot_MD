@echo off
REM Verificar si Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js no esta instalado. Ejecutando instalador...
    start /wait node-installer.exe
) else (
    echo Node.js ya esta instalado.
)

REM Verificar si Git está instalado
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo Git no esta instalado. Ejecutando instalador...
    start /wait git-installer.exe
) else (
    echo Git ya esta instalado.
)

REM Verificar si ImageMagick esta instalado
where convert >nul 2>nul
if %errorlevel% neq 0 (
    echo ImageMagick no esta instalado. Ejecutando instalador...
    start /wait imagemagick-installer.exe
) else (
    echo ImageMagick ya esta instalado.
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