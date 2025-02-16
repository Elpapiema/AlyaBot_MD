@echo off
REM Ejecutar el archivo setup.bat
echo [Console @ AlyaBot] Verificando si los programas de ejecucion estan instalados...
call setup.bat

REM Verificar si setup.bat terminó correctamente
if %errorlevel% neq 0 (
    echo [Console @ AlyaBot] setup.bat termino con errores, pero se continuara con la ejecución.
)

REM Ejecutar node index.js
echo [Console @ AlyaBot] Iniciando AlyaBot...
node index.js
if %errorlevel% neq 0 (
    echo [ERROR] Ocurrio un error. Verifica la instalacion.
)

REM Pausa final para mantener la ventana abierta
echo Presiona una tecla para cerrar esta ventana...
pause