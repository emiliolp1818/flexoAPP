@echo off
title FlexoApp - Compilar y Ejecutar
color 0B

echo.
echo 🔧 COMPILAR Y EJECUTAR FLEXOAPP
echo ═══════════════════════════════════════
echo.

REM Verificar Node.js
echo [1/5] 🔍 Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no encontrado
    pause
    exit /b 1
)
echo ✅ Node.js OK

REM Instalar dependencias
echo [2/5] 📦 Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias de Angular...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias de Angular
        pause
        exit /b 1
    )
)

if not exist "simple-backend\node_modules" (
    echo Instalando dependencias del backend...
    cd simple-backend
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias del backend
        cd ..
        pause
        exit /b 1
    )
    cd ..
)
echo ✅ Dependencias OK

REM Compilar Angular para detectar errores
echo [3/5] 🔨 Compilando Angular...
ng build --configuration development
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERRORES DE COMPILACION DETECTADOS
    echo ═══════════════════════════════════════
    echo.
    echo 💡 Revisa los errores mostrados arriba
    echo 💡 Corrige los errores y vuelve a ejecutar
    echo.
    pause
    exit /b 1
)
echo ✅ Compilación OK

REM Iniciar backend
echo [4/5] 🔥 Iniciando backend...
cd simple-backend
start /B /MIN cmd /c "node server.js"
cd ..

echo ⏳ Esperando backend...
timeout /t 3 /nobreak >nul

REM Probar backend
curl -s http://localhost:5000/api/test >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend funcionando
) else (
    echo ⚠️ Backend tardando, continuando...
)

REM Iniciar Angular
echo [5/5] 🅰️ Iniciando Angular...
echo.
echo ═══════════════════════════════════════
echo ✅ TODO COMPILADO CORRECTAMENTE
echo ═══════════════════════════════════════
echo.
echo 🌐 Abriendo en: http://localhost:4200
echo.

ng serve --open --port 4200

echo.
echo 👋 Aplicación cerrada
pause