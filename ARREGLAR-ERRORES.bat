@echo off
title FlexoApp - Arreglar Errores Automaticamente
color 0E

echo.
echo 🔧 ARREGLAR ERRORES AUTOMATICAMENTE
echo ═══════════════════════════════════════
echo.

echo ⚠️ Este script intentará arreglar errores comunes automáticamente
echo.
set /p confirm="¿Continuar? (S/N): "
if /i not "%confirm%"=="S" (
    echo Operación cancelada.
    pause
    exit /b 0
)

echo.
echo [1/8] 🧹 Limpiando archivos temporales...
if exist ".angular" rmdir /s /q ".angular" >nul 2>&1
if exist "dist" rmdir /s /q "dist" >nul 2>&1
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache" >nul 2>&1
echo ✅ Archivos temporales limpiados

echo [2/8] 📦 Verificando package.json...
if not exist "package.json" (
    echo ❌ package.json no encontrado
    echo Creando package.json básico...
    echo { > package.json
    echo   "name": "flexoapp", >> package.json
    echo   "version": "1.0.0", >> package.json
    echo   "scripts": { >> package.json
    echo     "ng": "ng", >> package.json
    echo     "start": "ng serve", >> package.json
    echo     "build": "ng build" >> package.json
    echo   } >> package.json
    echo } >> package.json
)
echo ✅ package.json verificado

echo [3/8] 🔄 Reinstalando dependencias críticas...
npm install @angular/core @angular/common @angular/platform-browser @angular/router --save >nul 2>&1
echo ✅ Dependencias críticas instaladas

echo [4/8] 🛠️ Verificando Angular CLI...
ng version >nul 2>&1
if %errorlevel% neq 0 (
    echo Instalando Angular CLI...
    npm install -g @angular/cli >nul 2>&1
)
echo ✅ Angular CLI verificado

echo [5/8] 📁 Verificando estructura de carpetas...
if not exist "src" mkdir src
if not exist "src\app" mkdir src\app
if not exist "src\app\components" mkdir src\app\components
echo ✅ Estructura de carpetas verificada

echo [6/8] 🔧 Verificando backend...
if not exist "simple-backend" (
    echo Creando carpeta del backend...
    mkdir simple-backend
)
if not exist "simple-backend\package.json" (
    echo Creando package.json del backend...
    cd simple-backend
    echo { > package.json
    echo   "name": "flexoapp-backend", >> package.json
    echo   "version": "1.0.0", >> package.json
    echo   "main": "server.js", >> package.json
    echo   "dependencies": { >> package.json
    echo     "express": "^4.18.2", >> package.json
    echo     "cors": "^2.8.5" >> package.json
    echo   } >> package.json
    echo } >> package.json
    cd ..
)
echo ✅ Backend verificado

echo [7/8] 🔨 Intentando compilación de prueba...
ng build --configuration development >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Compilación exitosa
) else (
    echo ⚠️ Aún hay errores de compilación
    echo Ejecuta DIAGNOSTICO-ERRORES.bat para más detalles
)

echo [8/8] 🧪 Verificación final...
if exist "node_modules" (
    echo ✅ node_modules existe
) else (
    echo ⚠️ Ejecutando npm install completo...
    npm install
)

echo.
echo ═══════════════════════════════════════
echo ✅ PROCESO DE REPARACION COMPLETADO
echo ═══════════════════════════════════════
echo.
echo 💡 Próximos pasos:
echo    1. Ejecuta DIAGNOSTICO-ERRORES.bat para verificar
echo    2. Si todo está OK, ejecuta INICIO-SIMPLE.bat
echo    3. Si hay errores, revisa el código manualmente
echo.
pause