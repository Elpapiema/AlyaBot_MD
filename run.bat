@echo off
REM Ejecutar el archivo setup.bat
echo Ejecutando setup.bat...
call setup.bat

REM Verificar si setup.bat terminó correctamente
if %errorlevel% neq 0 (
    echo [ADVERTENCIA] setup.bat terminó con errores, pero se continuará con la ejecución.
)

REM Ejecutar node index.js
echo Ejecutando node index.js...
node index.js
if %errorlevel% neq 0 (
    echo [ERROR] Falló al ejecutar node index.js. Verifica el archivo index.js.
)

REM Pausa final para mantener la ventana abierta
echo Presiona una tecla para cerrar esta ventana...
pause