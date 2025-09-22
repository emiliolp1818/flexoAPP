@echo off
title FlexoApp - Verificacion del Sistema
color 0B

echo.
echo 🔍 VERIFICACION DEL SISTEMA FLEXOAPP
echo ═══════════════════════════════════════
echo.

REM Verificar Node.js
echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js instalado: !NODE_VERSION!
) else (
    echo ❌ Node.js NO instalado
    echo 💡 Descarga desde: https://nodejs.org/
    set ERRORS=1
)

REM Verificar npm
echo [2/5] Verificando npm...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm instalado: !NPM_VERSION!
) else (
    echo ❌ npm NO disponible
    set ERRORS=1
)

REM Verificar Angular CLI
echo [3/5] Verificando Angular CLI...
ng version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Angular CLI instalado
) else (
    echo ⚠️  Angular CLI NO instalado
    echo 💡 Se instalará automáticamente al ejecutar INICIAR-FLEXOAPP.bat
)

REM Verificar archivos del proyecto
echo [4/5] Verificando archivos del proyecto...
if exist "package.json" (
    echo ✅ package.json de Angular encontrado
) else (
    echo ❌ package.json de Angular NO encontrado
    set ERRORS=1
)

if exist "simple-backend\package.json" (
    echo ✅ package.json del backend encontrado
) else (
    echo ❌ package.json del backend NO encontrado
    set ERRORS=1
)

if exist "simple-backend\server.js" (
    echo ✅ Servidor backend encontrado
) else (
    echo ❌ Servidor backend NO encontrado
    set ERRORS=1
)

REM Verificar puertos
echo [5/5] Verificando puertos...
netstat -an | find "4200" >nul
if %errorlevel% equ 0 (
    echo ⚠️  Puerto 4200 en uso (Angular)
) else (
    echo ✅ Puerto 4200 disponible
)

netstat -an | find "5000" >nul
if %errorlevel% equ 0 (
    echo ⚠️  Puerto 5000 en uso (Backend)
) else (
    echo ✅ Puerto 5000 disponible
)

echo.
echo ═══════════════════════════════════════
if defined ERRORS (
    echo ❌ SISTEMA NO LISTO - Hay errores que corregir
    echo.
    echo 💡 Soluciones:
    echo    - Instala Node.js desde https://nodejs.org/
    echo    - Verifica que estés en la carpeta correcta del proyecto
    echo    - Asegúrate de tener todos los archivos del proyecto
) else (
    echo ✅ SISTEMA LISTO PARA EJECUTAR
    echo.
    echo 🚀 Para iniciar FlexoApp ejecuta: INICIAR-FLEXOAPP.bat
)
echo ═══════════════════════════════════════
echo.
pause