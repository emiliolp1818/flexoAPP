@echo off
echo ========================================
echo 📊 ESTADO DE FLEXOAPP
echo ========================================
echo.

REM Obtener IP local
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

echo 🌐 IP Local: %LOCAL_IP%
echo ⏰ Fecha/Hora: %date% %time%
echo.

echo ========================================
echo 🔍 VERIFICANDO SERVICIOS
echo ========================================
echo.

REM Verificar Backend (.NET Core)
echo 🚀 Backend (.NET Core):
tasklist /fi "imagename eq dotnet.exe" 2>nul | findstr dotnet >nul
if %errorlevel% equ 0 (
    echo    ✅ EJECUTÁNDOSE
    
    REM Verificar si responde en el puerto 5000
    powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/health' -TimeoutSec 5 -UseBasicParsing; if($response.StatusCode -eq 200) { Write-Host '    ✅ API respondiendo correctamente' } else { Write-Host '    ⚠️  API no responde correctamente' } } catch { Write-Host '    ❌ API no accesible' }" 2>nul
) else (
    echo    ❌ NO EJECUTÁNDOSE
)

echo.

REM Verificar Frontend (Angular/Node.js)
echo 🎨 Frontend (Angular):
tasklist /fi "imagename eq node.exe" 2>nul | findstr node >nul
if %errorlevel% equ 0 (
    echo    ✅ EJECUTÁNDOSE
    
    REM Verificar si responde en el puerto 4200
    powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:4200' -TimeoutSec 5 -UseBasicParsing; if($response.StatusCode -eq 200) { Write-Host '    ✅ Frontend accesible' } else { Write-Host '    ⚠️  Frontend no responde' } } catch { Write-Host '    ❌ Frontend no accesible' }" 2>nul
) else (
    echo    ❌ NO EJECUTÁNDOSE
)

echo.

REM Verificar Docker
echo 🐳 Servicios Docker:
docker ps --format "table {{.Names}}\t{{.Status}}" 2>nul | findstr flexoapp >nul
if %errorlevel% equ 0 (
    echo    ✅ CONTENEDORES ACTIVOS:
    docker ps --format "    {{.Names}} - {{.Status}}" | findstr flexoapp 2>nul
) else (
    echo    ❌ NO HAY CONTENEDORES ACTIVOS
)

echo.

echo ========================================
echo 🔌 ESTADO DE PUERTOS
echo ========================================
echo.

REM Verificar puertos principales
echo 📡 Puertos en uso:

netstat -an | findstr :4200 >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ Puerto 4200 (Frontend) - OCUPADO
) else (
    echo    ❌ Puerto 4200 (Frontend) - LIBRE
)

netstat -an | findstr :5000 >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ Puerto 5000 (Backend) - OCUPADO
) else (
    echo    ❌ Puerto 5000 (Backend) - LIBRE
)

netstat -an | findstr :1433 >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ Puerto 1433 (SQL Server) - OCUPADO
) else (
    echo    ❌ Puerto 1433 (SQL Server) - LIBRE
)

netstat -an | findstr :6379 >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ Puerto 6379 (Redis) - OCUPADO
) else (
    echo    ❌ Puerto 6379 (Redis) - LIBRE
)

netstat -an | findstr :3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ Puerto 3000 (Grafana) - OCUPADO
) else (
    echo    ❌ Puerto 3000 (Grafana) - LIBRE
)

netstat -an | findstr :9090 >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ Puerto 9090 (Prometheus) - OCUPADO
) else (
    echo    ❌ Puerto 9090 (Prometheus) - LIBRE
)

echo.

echo ========================================
echo 🌐 URLS DE ACCESO
echo ========================================
echo.

REM Mostrar URLs basadas en servicios activos
tasklist /fi "imagename eq node.exe" 2>nul | findstr node >nul
if %errorlevel% equ 0 (
    echo 🎨 Frontend:
    echo    Local:  http://localhost:4200
    echo    Red:    http://%LOCAL_IP%:4200
    echo.
)

tasklist /fi "imagename eq dotnet.exe" 2>nul | findstr dotnet >nul
if %errorlevel% equ 0 (
    echo 🚀 Backend API:
    echo    Local:  http://localhost:5000
    echo    Red:    http://%LOCAL_IP%:5000
    echo    Swagger: http://localhost:5000/swagger
    echo    Health:  http://localhost:5000/health
    echo.
)

docker ps --format "{{.Names}}" 2>nul | findstr grafana >nul
if %errorlevel% equ 0 (
    echo 📊 Monitoreo:
    echo    Grafana:    http://localhost:3000
    echo    Prometheus: http://localhost:9090
    echo.
)

echo ========================================
echo 💻 INFORMACIÓN DEL SISTEMA
echo ========================================
echo.

REM Información del sistema
echo 🖥️  Sistema: %OS%
echo 🏷️  Computador: %COMPUTERNAME%
echo 👤 Usuario: %USERNAME%

REM Verificar recursos
echo.
echo 📊 Uso de recursos:
wmic cpu get loadpercentage /value | findstr LoadPercentage | for /f "tokens=2 delims==" %%a in ('more') do echo    CPU: %%a%%

REM Memoria disponible (aproximada)
for /f "skip=1" %%p in ('wmic os get TotalVisibleMemorySize /value') do for /f "tokens=2 delims==" %%a in ("%%p") do set total_mem=%%a
for /f "skip=1" %%p in ('wmic os get FreePhysicalMemory /value') do for /f "tokens=2 delims==" %%a in ("%%p") do set free_mem=%%a

if defined total_mem if defined free_mem (
    set /a used_mem=%total_mem%-%free_mem%
    set /a mem_percent=(%used_mem%*100)/%total_mem%
    echo    RAM: !mem_percent!%% en uso
)

echo.

echo ========================================
echo 🛠️ ACCIONES DISPONIBLES
echo ========================================
echo.

echo Para gestionar FlexoApp:
echo.
echo 🚀 Iniciar:
echo    start-flexoapp.bat  (inicio completo con opciones)
echo    quick-start.bat     (inicio rápido)
echo.
echo 🛑 Detener:
echo    stop-flexoapp.bat   (detener todos los servicios)
echo.
echo 📊 Monitorear:
echo    status-flexoapp.bat (este script)
echo.

REM Detectar estado general
tasklist /fi "imagename eq dotnet.exe" 2>nul | findstr dotnet >nul
set backend_running=%errorlevel%

tasklist /fi "imagename eq node.exe" 2>nul | findstr node >nul
set frontend_running=%errorlevel%

echo ========================================
if %backend_running% equ 0 if %frontend_running% equ 0 (
    echo ✅ ESTADO: FLEXOAPP COMPLETAMENTE ACTIVO
    echo 🎯 La aplicación está lista para usar
) else if %backend_running% equ 0 (
    echo ⚠️  ESTADO: SOLO BACKEND ACTIVO
    echo 💡 Ejecuta el frontend para completar el sistema
) else if %frontend_running% equ 0 (
    echo ⚠️  ESTADO: SOLO FRONTEND ACTIVO  
    echo 💡 Ejecuta el backend para completar el sistema
) else (
    echo ❌ ESTADO: FLEXOAPP INACTIVO
    echo 💡 Ejecuta start-flexoapp.bat para iniciar
)
echo ========================================
echo.

pause