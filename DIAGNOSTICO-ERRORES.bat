@echo off
title FlexoApp - Diagnostico de Errores
color 0C

echo.
echo 🔍 DIAGNOSTICO DE ERRORES FLEXOAPP
echo ═══════════════════════════════════════
echo.

REM Crear archivo de log
set LOGFILE=errores-%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%%time:~6,2%.log
set LOGFILE=%LOGFILE: =0%

echo Generando diagnóstico de errores: %LOGFILE%
echo.

echo DIAGNOSTICO DE ERRORES - %date% %time% > %LOGFILE%
echo ═══════════════════════════════════════ >> %LOGFILE%
echo. >> %LOGFILE%

REM Verificar Node.js y npm
echo [1/6] 🔍 Verificando herramientas...
echo HERRAMIENTAS: >> %LOGFILE%
node --version >> %LOGFILE% 2>&1
npm --version >> %LOGFILE% 2>&1
echo. >> %LOGFILE%

REM Verificar estructura de archivos críticos
echo [2/6] 📁 Verificando archivos críticos...
echo ARCHIVOS CRITICOS: >> %LOGFILE%

set FILES_TO_CHECK=package.json angular.json tsconfig.json src\main.ts src\app\app.component.ts src\app\app.routes.ts

for %%f in (%FILES_TO_CHECK%) do (
    if exist "%%f" (
        echo ✅ %%f >> %LOGFILE%
    ) else (
        echo ❌ %%f FALTANTE >> %LOGFILE%
    )
)
echo. >> %LOGFILE%

REM Verificar dependencias
echo [3/6] 📦 Verificando dependencias...
echo DEPENDENCIAS: >> %LOGFILE%
if exist "node_modules" (
    echo ✅ node_modules existe >> %LOGFILE%
    if exist "node_modules\@angular\core" (
        echo ✅ Angular Core instalado >> %LOGFILE%
    ) else (
        echo ❌ Angular Core NO instalado >> %LOGFILE%
    )
) else (
    echo ❌ node_modules NO existe >> %LOGFILE%
)
echo. >> %LOGFILE%

REM Intentar compilar y capturar errores
echo [4/6] 🔨 Intentando compilación...
echo COMPILACION: >> %LOGFILE%
ng build --configuration development >> %LOGFILE% 2>&1
if %errorlevel% equ 0 (
    echo ✅ Compilación exitosa >> %LOGFILE%
) else (
    echo ❌ Errores de compilación detectados >> %LOGFILE%
)
echo. >> %LOGFILE%

REM Verificar puertos
echo [5/6] 🔌 Verificando puertos...
echo PUERTOS: >> %LOGFILE%
netstat -an | findstr ":4200 :5000" >> %LOGFILE%
echo. >> %LOGFILE%

REM Verificar backend
echo [6/6] 🔧 Verificando backend...
echo BACKEND: >> %LOGFILE%
if exist "simple-backend\server.js" (
    echo ✅ Servidor backend existe >> %LOGFILE%
    if exist "simple-backend\package.json" (
        echo ✅ package.json del backend existe >> %LOGFILE%
    ) else (
        echo ❌ package.json del backend NO existe >> %LOGFILE%
    )
) else (
    echo ❌ Servidor backend NO existe >> %LOGFILE%
)
echo. >> %LOGFILE%

REM Mostrar resumen
echo.
echo ═══════════════════════════════════════
echo 📄 REPORTE GENERADO: %LOGFILE%
echo ═══════════════════════════════════════
echo.

REM Mostrar errores críticos
echo 🔍 ERRORES ENCONTRADOS:
type %LOGFILE% | findstr /C:"❌"
echo.

REM Mostrar elementos OK
echo ✅ ELEMENTOS CORRECTOS:
type %LOGFILE% | findstr /C:"✅"
echo.

REM Sugerencias
echo 💡 SUGERENCIAS:
echo.
type %LOGFILE% | findstr /C:"❌" >nul
if %errorlevel% equ 0 (
    echo - Si faltan archivos: Verifica que estés en la carpeta correcta
    echo - Si faltan dependencias: Ejecuta "npm install"
    echo - Si hay errores de compilación: Revisa el código TypeScript
    echo - Si el backend no existe: Verifica los archivos del servidor
) else (
    echo - Todo parece estar en orden
    echo - Si aún hay problemas, revisa el archivo de log completo
)

echo.
echo 📧 Para soporte, envía el archivo: %LOGFILE%
echo.
pause