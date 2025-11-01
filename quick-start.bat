@echo off
echo ========================================
echo ⚡ FLEXOAPP - INICIO RÁPIDO
echo ========================================
echo.

REM Obtener IP local automáticamente
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4" ^| findstr /v "127.0.0.1"') do (
    set "ip=%%a"
    set "ip=!ip: =!"
    if not "!ip!"=="" (
        set "LOCAL_IP=!ip!"
        goto :ip_found
    )
)
:ip_found

if "%LOCAL_IP%"=="" set "LOCAL_IP=localhost"

echo 🌐 IP detectada: %LOCAL_IP%
echo.

REM Verificar prerrequisitos rápidamente
node --version >nul 2>&1 || (echo ❌ Node.js requerido && pause && exit /b 1)
dotnet --version >nul 2>&1 || (echo ❌ .NET Core requerido && pause && exit /b 1)

echo ✅ Prerrequisitos OK
echo.

REM Instalar dependencias si es necesario
if not exist "frontend\node_modules" (
    echo 📦 Instalando dependencias...
    cd frontend && npm install --silent && cd ..
)

REM Iniciar servicios
echo 🚀 Iniciando Backend...
start "FlexoApp-Backend" /min cmd /c "cd backend && dotnet run --urls=http://0.0.0.0:5000"

echo ⏳ Esperando backend (10s)...
timeout /t 10 /nobreak >nul

echo 🎨 Iniciando Frontend...
start "FlexoApp-Frontend" /min cmd /c "cd frontend && ng serve --host 0.0.0.0 --port 4200"

echo ⏳ Esperando frontend (15s)...
timeout /t 15 /nobreak >nul

echo.
echo ========================================
echo ✅ FLEXOAPP LISTO!
echo ========================================
echo.
echo 🌐 URLs disponibles:
echo.
echo 📱 Local:      http://localhost:4200
echo 🌍 Red:        http://%LOCAL_IP%:4200
echo 🔧 API:        http://%LOCAL_IP%:5000
echo 📚 Swagger:    http://%LOCAL_IP%:5000/swagger
echo 🏥 Health:     http://%LOCAL_IP%:5000/health
echo.
echo 👤 Usuario de prueba:
echo    Código: ADMIN001
echo    Contraseña: Admin123!
echo.

REM Abrir automáticamente en el navegador
start http://localhost:4200

echo 🎉 ¡Aplicación iniciada y abierta en el navegador!
echo.
echo Para detener: Cierra las ventanas de comandos
echo Para reiniciar: Ejecuta este script nuevamente
echo.
pause