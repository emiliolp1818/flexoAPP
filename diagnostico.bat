@echo off
title FlexoApp - Diagnostico Avanzado
color 0E

echo.
echo 🔬 DIAGNOSTICO AVANZADO FLEXOAPP
echo ═══════════════════════════════════════
echo.

REM Crear archivo de log
set LOGFILE=diagnostico-%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%%time:~6,2%.log
set LOGFILE=%LOGFILE: =0%
echo Generando reporte de diagnóstico: %LOGFILE%
echo.

echo DIAGNOSTICO FLEXOAPP - %date% %time% > %LOGFILE%
echo ═══════════════════════════════════════ >> %LOGFILE%
echo. >> %LOGFILE%

REM Información del sistema
echo [1/8] 💻 Información del sistema...
echo INFORMACION DEL SISTEMA: >> %LOGFILE%
systeminfo | findstr /C:"OS Name" /C:"OS Version" /C:"System Type" >> %LOGFILE%
echo. >> %LOGFILE%

REM Versiones de software
echo [2/8] 📋 Versiones de software...
echo VERSIONES DE SOFTWARE: >> %LOGFILE%
node --version >> %LOGFILE% 2>&1
npm --version >> %LOGFILE% 2>&1
ng version >> %LOGFILE% 2>&1
echo. >> %LOGFILE%

REM Puertos en uso
echo [3/8] 🔌 Verificando puertos...
echo PUERTOS EN USO: >> %LOGFILE%
netstat -an | findstr ":4200 :5000" >> %LOGFILE%
echo. >> %LOGFILE%

REM Procesos relacionados
echo [4/8] ⚙️  Verificando procesos...
echo PROCESOS RELACIONADOS: >> %LOGFILE%
tasklist | findstr /I "node.exe ng.exe" >> %LOGFILE%
echo. >> %LOGFILE%

REM Estructura de archivos
echo [5/8] 📁 Verificando estructura de archivos...
echo ESTRUCTURA DE ARCHIVOS: >> %LOGFILE%
if exist "package.json" (echo ✅ package.json >> %LOGFILE%) else (echo ❌ package.json >> %LOGFILE%)
if exist "angular.json" (echo ✅ angular.json >> %LOGFILE%) else (echo ❌ angular.json >> %LOGFILE%)
if exist "src\app" (echo ✅ src\app >> %LOGFILE%) else (echo ❌ src\app >> %LOGFILE%)
if exist "simple-backend\server.js" (echo ✅ simple-backend\server.js >> %LOGFILE%) else (echo ❌ simple-backend\server.js >> %LOGFILE%)
if exist "simple-backend\package.json" (echo ✅ simple-backend\package.json >> %LOGFILE%) else (echo ❌ simple-backend\package.json >> %LOGFILE%)
echo. >> %LOGFILE%

REM Dependencias instaladas
echo [6/8] 📦 Verificando dependencias...
echo DEPENDENCIAS ANGULAR: >> %LOGFILE%
if exist "node_modules" (
    echo ✅ node_modules existe >> %LOGFILE%
    dir node_modules | find "Directory" >> %LOGFILE%
) else (
    echo ❌ node_modules no existe >> %LOGFILE%
)
echo. >> %LOGFILE%

echo DEPENDENCIAS BACKEND: >> %LOGFILE%
if exist "simple-backend\node_modules" (
    echo ✅ backend node_modules existe >> %LOGFILE%
    dir simple-backend\node_modules | find "Directory" >> %LOGFILE%
) else (
    echo ❌ backend node_modules no existe >> %LOGFILE%
)
echo. >> %LOGFILE%

REM Probar conexión de red
echo [7/8] 🌐 Probando conectividad...
echo CONECTIVIDAD: >> %LOGFILE%
ping -n 1 localhost >> %LOGFILE% 2>&1
echo. >> %LOGFILE%

REM Variables de entorno
echo [8/8] 🔧 Variables de entorno...
echo VARIABLES DE ENTORNO: >> %LOGFILE%
echo PATH=%PATH% >> %LOGFILE%
echo NODE_ENV=%NODE_ENV% >> %LOGFILE%
echo. >> %LOGFILE%

REM Mostrar resumen en pantalla
echo.
echo ═══════════════════════════════════════
echo ✅ DIAGNOSTICO COMPLETADO
echo ═══════════════════════════════════════
echo.
echo 📄 Reporte guardado en: %LOGFILE%
echo.
echo 📋 RESUMEN:
type %LOGFILE% | findstr /C:"✅" /C:"❌"
echo.
echo 💡 Envía el archivo %LOGFILE% si necesitas soporte técnico
echo.
pause