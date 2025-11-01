@echo off
setlocal enabledelayedexpansion

echo ========================================
echo 🚀 FLEXOAPP - INICIO COMPLETO
echo ========================================
echo.

REM Obtener la IP local para acceso desde la red
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set "ip=%%a"
    set "ip=!ip: =!"
    if not "!ip!"=="" (
        set "LOCAL_IP=!ip!"
        goto :ip_found
    )
)
:ip_found

if "%LOCAL_IP%"=="" (
    set "LOCAL_IP=localhost"
    echo ⚠️  No se pudo detectar la IP local, usando localhost
) else (
    echo 🌐 IP Local detectada: %LOCAL_IP%
)

echo.
echo Selecciona el modo de inicio:
echo.
echo 1. 🏠 Desarrollo Local (solo localhost)
echo 2. 🌐 Red Local (accesible desde otros dispositivos)
echo 3. 🐳 Docker Completo (con monitoreo)
echo 4. ⚡ Rápido (solo backend + frontend)
echo 5. 🔧 Desarrollo Avanzado (con debugging)
echo.
set /p mode="Selecciona una opción (1-5): "

if "%mode%"=="1" goto :local_dev
if "%mode%"=="2" goto :network_dev
if "%mode%"=="3" goto :docker_full
if "%mode%"=="4" goto :quick_start
if "%mode%"=="5" goto :advanced_dev

echo ❌ Opción inválida, iniciando modo local por defecto...
goto :local_dev

:local_dev
echo.
echo 🏠 INICIANDO EN MODO DESARROLLO LOCAL
echo ========================================
call :check_prerequisites
call :start_local_development
goto :show_urls_local

:network_dev
echo.
echo 🌐 INICIANDO EN MODO RED LOCAL
echo ========================================
call :check_prerequisites
call :start_network_development
goto :show_urls_network

:docker_full
echo.
echo 🐳 INICIANDO CON DOCKER COMPLETO
echo ========================================
call :check_docker
call :start_docker_full
goto :show_urls_docker

:quick_start
echo.
echo ⚡ INICIO RÁPIDO (BACKEND + FRONTEND)
echo ========================================
call :check_prerequisites
call :start_quick
goto :show_urls_local

:advanced_dev
echo.
echo 🔧 MODO DESARROLLO AVANZADO
echo ========================================
call :check_prerequisites
call :start_advanced_development
goto :show_urls_network

REM ========================================
REM FUNCIONES
REM ========================================

:check_prerequisites
echo 📋 Verificando prerrequisitos...

REM Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    echo 📥 Descarga desde: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js disponible

REM Verificar .NET
dotnet --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ .NET Core no está instalado
    echo 📥 Descarga desde: https://dotnet.microsoft.com/download
    pause
    exit /b 1
)
echo ✅ .NET Core disponible

REM Verificar npm en frontend
if not exist "frontend\node_modules" (
    echo 📦 Instalando dependencias del frontend...
    cd frontend
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias del frontend
        pause
        exit /b 1
    )
    cd ..
)
echo ✅ Dependencias del frontend listas

REM Verificar paquetes NuGet en backend
if not exist "backend\bin" (
    echo 📦 Restaurando paquetes del backend...
    cd backend
    dotnet restore
    if %errorlevel% neq 0 (
        echo ❌ Error restaurando paquetes del backend
        pause
        exit /b 1
    )
    cd ..
)
echo ✅ Paquetes del backend listos
echo.
goto :eof

:check_docker
echo 📋 Verificando Docker...

docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker no está instalado
    echo 📥 Descarga Docker Desktop desde: https://docker.com/
    pause
    exit /b 1
)

docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker no está ejecutándose
    echo 🔄 Inicia Docker Desktop y espera a que esté listo
    pause
    exit /b 1
)
echo ✅ Docker disponible y ejecutándose
echo.
goto :eof

:start_local_development
echo 🔧 Configurando para desarrollo local...

REM Crear archivo de configuración temporal para desarrollo local
echo {> frontend\src\environments\environment.local.ts
echo   production: false,>> frontend\src\environments\environment.local.ts
echo   apiUrl: 'http://localhost:5000',>> frontend\src\environments\environment.local.ts
echo   enableDevTools: true>> frontend\src\environments\environment.local.ts
echo }>> frontend\src\environments\environment.local.ts

echo ✅ Configuración local creada

echo.
echo 🚀 Iniciando Backend (.NET Core)...
start "FlexoApp Backend" cmd /k "cd backend && dotnet run --urls=http://localhost:5000"

echo ⏳ Esperando a que el backend esté listo...
timeout /t 10 /nobreak >nul

echo.
echo 🎨 Iniciando Frontend (Angular)...
start "FlexoApp Frontend" cmd /k "cd frontend && npm start"

echo ✅ Servicios iniciados en modo local
goto :eof

:start_network_development
echo 🌐 Configurando para acceso desde la red...

REM Crear archivo de configuración para red
echo {> frontend\src\environments\environment.network.ts
echo   production: false,>> frontend\src\environments\environment.network.ts
echo   apiUrl: 'http://%LOCAL_IP%:5000',>> frontend\src\environments\environment.network.ts
echo   enableDevTools: true,>> frontend\src\environments\environment.network.ts
echo   networkMode: true>> frontend\src\environments\environment.network.ts
echo }>> frontend\src\environments\environment.network.ts

echo ✅ Configuración de red creada

echo.
echo 🚀 Iniciando Backend con acceso de red...
start "FlexoApp Backend (Network)" cmd /k "cd backend && dotnet run --urls=http://0.0.0.0:5000"

echo ⏳ Esperando a que el backend esté listo...
timeout /t 10 /nobreak >nul

echo.
echo 🎨 Iniciando Frontend con acceso de red...
start "FlexoApp Frontend (Network)" cmd /k "cd frontend && ng serve --host 0.0.0.0 --port 4200"

echo ✅ Servicios iniciados con acceso de red
goto :eof

:start_docker_full
echo 🐳 Iniciando con Docker Compose completo...

REM Detener contenedores existentes
echo 🛑 Deteniendo contenedores existentes...
docker-compose down --remove-orphans >nul 2>&1

echo 🔧 Construyendo e iniciando servicios...
docker-compose up -d --build

if %errorlevel% neq 0 (
    echo ❌ Error iniciando servicios con Docker
    echo 💡 Verifica que Docker Desktop esté ejecutándose
    pause
    exit /b 1
)

echo ⏳ Esperando a que los servicios estén listos...
timeout /t 30 /nobreak >nul

echo 🗄️ Ejecutando optimizaciones de base de datos...
docker exec flexoapp-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P FlexoApp2024! -i /scripts/OptimizeDatabase.sql >nul 2>&1

echo ✅ Servicios Docker iniciados completamente
goto :eof

:start_quick
echo ⚡ Inicio rápido - Solo servicios esenciales...

echo 🚀 Iniciando Backend (modo rápido)...
start "FlexoApp Backend (Quick)" cmd /k "cd backend && dotnet run --urls=http://localhost:5000 --environment=Development"

echo ⏳ Esperando backend...
timeout /t 8 /nobreak >nul

echo 🎨 Iniciando Frontend (modo rápido)...
start "FlexoApp Frontend (Quick)" cmd /k "cd frontend && ng serve --port 4200 --open"

echo ✅ Inicio rápido completado
goto :eof

:start_advanced_development
echo 🔧 Configurando modo desarrollo avanzado...

REM Configurar variables de entorno para debugging
set ASPNETCORE_ENVIRONMENT=Development
set ASPNETCORE_DETAILEDERRORS=true
set Logging__LogLevel__Default=Debug

echo 🚀 Iniciando Backend con debugging...
start "FlexoApp Backend (Debug)" cmd /k "cd backend && dotnet run --urls=http://0.0.0.0:5000 --verbosity detailed"

echo ⏳ Esperando backend...
timeout /t 10 /nobreak >nul

echo 🎨 Iniciando Frontend con análisis...
start "FlexoApp Frontend (Advanced)" cmd /k "cd frontend && set ANALYZE=true && ng serve --host 0.0.0.0 --port 4200 --source-map --verbose"

echo 📊 Iniciando herramientas de desarrollo...
timeout /t 5 /nobreak >nul

REM Abrir herramientas útiles
start "API Testing" cmd /k "echo 🔧 Herramientas de desarrollo disponibles: && echo - Swagger UI: http://localhost:5000/swagger && echo - Health Checks: http://localhost:5000/health && echo - Metrics: http://localhost:5000/metrics && echo. && echo Presiona cualquier tecla para cerrar... && pause >nul"

echo ✅ Modo desarrollo avanzado iniciado
goto :eof

:show_urls_local
echo.
echo ========================================
echo 🌐 SERVICIOS DISPONIBLES (LOCAL)
echo ========================================
echo.
echo 🎨 Frontend (Angular):
echo    http://localhost:4200
echo.
echo 🔧 Backend API (.NET):
echo    http://localhost:5000
echo    http://localhost:5000/swagger (Documentación API)
echo.
echo 🏥 Health Checks:
echo    http://localhost:5000/health
echo.
echo 📊 Métricas:
echo    http://localhost:5000/metrics
echo.
goto :show_commands

:show_urls_network
echo.
echo ========================================
echo 🌐 SERVICIOS DISPONIBLES (RED LOCAL)
echo ========================================
echo.
echo 🎨 Frontend (Angular):
echo    Local:  http://localhost:4200
echo    Red:    http://%LOCAL_IP%:4200
echo.
echo 🔧 Backend API (.NET):
echo    Local:  http://localhost:5000
echo    Red:    http://%LOCAL_IP%:5000
echo    Swagger: http://%LOCAL_IP%:5000/swagger
echo.
echo 🏥 Health Checks:
echo    http://%LOCAL_IP%:5000/health
echo.
echo 📊 Métricas:
echo    http://%LOCAL_IP%:5000/metrics
echo.
echo 📱 Para acceder desde otros dispositivos:
echo    Asegúrate de que el firewall permita las conexiones
echo    en los puertos 4200 y 5000
echo.
goto :show_commands

:show_urls_docker
echo.
echo ========================================
echo 🌐 SERVICIOS DISPONIBLES (DOCKER)
echo ========================================
echo.
echo 🎨 Frontend (Angular):
echo    http://localhost:4200
echo.
echo 🔧 Backend API (.NET):
echo    http://localhost:5000
echo    http://localhost:5000/swagger
echo.
echo 📊 Monitoreo:
echo    Grafana:    http://localhost:3000 (admin/admin123)
echo    Prometheus: http://localhost:9090
echo.
echo 🏥 Health Checks:
echo    http://localhost:5000/health
echo    http://localhost:5000/health-ui
echo.
echo 🗄️ Base de Datos:
echo    SQL Server: localhost:1433 (sa/FlexoApp2024!)
echo    Redis:      localhost:6379
echo.
goto :show_commands

:show_commands
echo ========================================
echo 🛠️ COMANDOS ÚTILES
echo ========================================
echo.
echo Para detener los servicios:
if "%mode%"=="3" (
    echo    docker-compose down
) else (
    echo    Cierra las ventanas de comandos abiertas
    echo    O presiona Ctrl+C en cada ventana
)
echo.
echo Para ver logs en tiempo real:
if "%mode%"=="3" (
    echo    docker-compose logs -f
) else (
    echo    Los logs aparecen en las ventanas de comandos
)
echo.
echo Para reiniciar servicios:
echo    Ejecuta este script nuevamente
echo.

echo ========================================
echo 🎯 CREDENCIALES DE PRUEBA
echo ========================================
echo.
echo Usuario Administrador:
echo    Código: ADMIN001
echo    Contraseña: Admin123!
echo.
echo Usuario Supervisor:
echo    Código: SUPER001  
echo    Contraseña: Super123!
echo.
echo Usuario Operador:
echo    Código: OPER001
echo    Contraseña: Oper123!
echo.

echo ========================================
echo ✅ FLEXOAPP INICIADO CORRECTAMENTE
echo ========================================
echo.
echo 🚀 La aplicación está lista para usar!
echo.
echo 💡 Consejos:
echo   • Usa Ctrl+Shift+I para abrir DevTools en el navegador
echo   • El backend incluye Swagger para probar la API
echo   • Los health checks muestran el estado de los servicios
echo   • Las métricas están disponibles para monitoreo
echo.

if "%mode%"=="2" (
    echo 📱 Para acceso desde móviles/tablets en la misma red:
    echo    Frontend: http://%LOCAL_IP%:4200
    echo    Backend:  http://%LOCAL_IP%:5000
    echo.
)

echo ¿Quieres abrir la aplicación en el navegador? (s/n)
set /p open="Respuesta: "

if /i "%open%"=="s" (
    if "%mode%"=="3" (
        start http://localhost:4200
        timeout /t 2 /nobreak >nul
        start http://localhost:3000
    ) else if "%mode%"=="2" (
        start http://%LOCAL_IP%:4200
    ) else (
        start http://localhost:4200
    )
    echo 🌐 Aplicación abierta en el navegador
)

echo.
echo 🎉 ¡Disfruta desarrollando con FlexoAPP!
echo.
pause