@echo off
REM Verificar si Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js no está instalado. Ejecutando instalador...
    start /wait node-installer.exe
) else (
    echo Node.js ya esta instalado.
)

REM Verificar si Git está instalado
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo Git no está instalado. Ejecutando instalador...
    start /wait git-installer.exe
) else (
    echo Git ya esta instalado.
)

REM Verificar si ImageMagick está instalado
where convert >nul 2>nul
if %errorlevel% neq 0 (
    echo ImageMagick no está instalado. Ejecutando instalador...
    start /wait imagemagick-installer.exe
) else (
    echo ImageMagick ya esta instalado.
)

REM Ejecutar Git pull
echo Verificando Actualizaciones...
git pull

REM Ejecutar npm install (ignorar crasheo)
echo Instalando Dependencias...
npm install
if %errorlevel% neq 0 (
    echo [ADVERTENCIA] Se detectó un problema después de npm install, pero se ignorará para continuar.
)

pause