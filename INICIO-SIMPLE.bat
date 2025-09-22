@echo off
title FlexoApp - Inicio Simple
color 0A

echo.
echo ████████╗██╗     ███████╗██╗  ██╗ ██████╗  █████╗ ██████╗ ██████╗ 
echo ██╔════╝██║     ██╔════╝╝██╗██╔╝██╔═══██╗██╔══██╗██╔══██╗██╔══██╗
echo █████╗  ██║     █████╗   ╚███╔╝ ██║   ██║███████║██████╔╝██████╔╝
echo ██╔══╝  ██║     ██╔══╝   ██╔██╗ ██║   ██║██╔══██║██╔═══╝ ██╔═══╝ 
echo ██║     ███████╗███████╗██╔╝ ██╗╚██████╔╝██║  ██║██║     ██║     
echo ╚═╝     ╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝     
echo.
echo 🚀 INICIO SIMPLE - FlexoApp
echo ═══════════════════════════════════════════════════════════════════
echo.

REM Verificar Node.js
echo [1/4] 🔍 Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no encontrado. Descarga desde: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js OK

REM Instalar dependencias básicas
echo [2/4] 📦 Instalando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias de Angular...
    npm install --silent
)

if not exist "simple-backend\node_modules" (
    echo Instalando dependencias del backend...
    cd simple-backend
    npm install --silent
    cd ..
)
echo ✅ Dependencias OK

REM Iniciar backend
echo [3/4] 🔥 Iniciando backend...
cd simple-backend
start /B /MIN cmd /c "node server.js"
cd ..

REM Esperar backend
echo ⏳ Esperando backend (5 segundos)...
timeout /t 5 /nobreak >nul

REM Iniciar Angular
echo [4/4] 🅰️ Iniciando Angular...
echo.
echo ═══════════════════════════════════════════════════════════════════
echo ✅ INICIANDO FLEXOAPP...
echo ═══════════════════════════════════════════════════════════════════
echo.
echo 🌐 Frontend: http://localhost:4200
echo 🔧 Backend:  http://localhost:5000
echo.
echo 💡 Se abrirá automáticamente en tu navegador
echo 🛑 Para cerrar: Ctrl+C o cierra esta ventana
echo.

ng serve --open --port 4200 --disable-host-check

echo.
echo 👋 FlexoApp cerrado
pause