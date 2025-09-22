@echo off
setlocal enabledelayedexpansion
title FlexoApp - Iniciador Automatico
color 0A

echo.
echo  ███████╗██╗     ███████╗██╗  ██╗ ██████╗  █████╗ ██████╗ ██████╗ 
echo  ██╔════╝██║     ██╔════╝╝██╗██╔╝██╔═══██╗██╔══██╗██╔══██╗██╔══██╗
echo  █████╗  ██║     █████╗   ╚███╔╝ ██║   ██║███████║██████╔╝██████╔╝
echo  ██╔══╝  ██║     ██╔══╝   ██╔██╗ ██║   ██║██╔══██║██╔═══╝ ██╔═══╝ 
echo  ██║     ███████╗███████╗██╔╝ ██╗╚██████╔╝██║  ██║██║     ██║     
echo  ╚═╝     ╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝     
echo.
echo  🚀 INICIADOR AUTOMATICO - Sistema de Gestion de Empaques Flexibles
echo  ═══════════════════════════════════════════════════════════════════
echo.

REM Verificar si Node.js está instalado
echo [1/6] 🔍 Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js no está instalado
    echo 💡 Descarga Node.js desde: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js encontrado

REM Verificar si Angular CLI está instalado
echo [2/6] 🔍 Verificando Angular CLI...
ng version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Angular CLI no encontrado, instalando...
    npm install -g @angular/cli
    if %errorlevel% neq 0 (
        echo ❌ ERROR: No se pudo instalar Angular CLI
        pause
        exit /b 1
    )
)
echo ✅ Angular CLI listo

REM Instalar dependencias del backend
echo [3/6] 📦 Instalando dependencias del backend...
if not exist "simple-backend" (
    echo ❌ ERROR: Carpeta simple-backend no encontrada
    pause
    exit /b 1
)

cd simple-backend
if not exist "package.json" (
    echo ❌ ERROR: package.json no encontrado en simple-backend
    cd ..
    pause
    exit /b 1
)

npm install >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: No se pudieron instalar las dependencias del backend
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ Dependencias del backend instaladas

REM Instalar dependencias de Angular
echo [4/6] 📦 Instalando dependencias de Angular...
if not exist "package.json" (
    echo ❌ ERROR: package.json de Angular no encontrado
    pause
    exit /b 1
)

npm install >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: No se pudieron instalar las dependencias de Angular
    pause
    exit /b 1
)
echo ✅ Dependencias de Angular instaladas

REM Iniciar backend
echo [5/6] 🔥 Iniciando backend...
cd simple-backend
start /B cmd /c "node server.js"
cd ..

REM Esperar a que el backend inicie
echo ⏳ Esperando que el backend inicie...
set /a counter=0
:wait_backend
timeout /t 1 /nobreak >nul
set /a counter+=1

REM Probar conexión con curl si está disponible
curl -s http://localhost:5000/api/test >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend iniciado correctamente en http://localhost:5000
    goto backend_ready
)

REM Si curl no funciona, usar PowerShell
powershell -Command "try { Invoke-RestMethod -Uri 'http://localhost:5000/api/test' -TimeoutSec 2 } catch { exit 1 }" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend iniciado correctamente en http://localhost:5000
    goto backend_ready
)

if %counter% lss 10 goto wait_backend

echo ⚠️  Backend tardando en iniciar, continuando de todas formas...

:backend_ready

REM Iniciar Angular
echo [6/6] 🅰️  Iniciando Angular...
echo.
echo ═══════════════════════════════════════════════════════════════════
echo  🎉 FLEXOAPP INICIANDO...
echo ═══════════════════════════════════════════════════════════════════
echo.
echo  📱 Frontend: http://localhost:4200
echo  🔧 Backend:  http://localhost:5000
echo  🧪 Test:     http://localhost:5000/api/test
echo.
echo  💡 La aplicación se abrirá automáticamente en tu navegador
echo  🛑 Para detener: Cierra esta ventana o presiona Ctrl+C
echo.
echo ═══════════════════════════════════════════════════════════════════

REM Iniciar Angular con apertura automática del navegador
ng serve --open --port 4200

REM Si Angular falla, mostrar mensaje de error
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: Angular no pudo iniciarse
    echo 💡 Verifica que no haya otro proceso usando el puerto 4200
    echo.
    pause
)

echo.
echo 👋 FlexoApp cerrado. ¡Hasta luego!
pause