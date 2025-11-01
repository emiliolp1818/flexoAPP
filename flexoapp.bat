@echo off
setlocal enabledelayedexpansion
title FlexoApp - Sistema de Gestión

:main_menu
cls
echo.
echo     ███████╗██╗     ███████╗██╗  ██╗ ██████╗  █████╗ ██████╗ ██████╗ 
echo     ██╔════╝██║     ██╔════╝╚██╗██╔╝██╔═══██╗██╔══██╗██╔══██╗██╔══██╗
echo     █████╗  ██║     █████╗   ╚███╔╝ ██║   ██║███████║██████╔╝██████╔╝
echo     ██╔══╝  ██║     ██╔══╝   ██╔██╗ ██║   ██║██╔══██║██╔═══╝ ██╔═══╝ 
echo     ██║     ███████╗███████╗██╔╝ ██╗╚██████╔╝██║  ██║██║     ██║     
echo     ╚═╝     ╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝     
echo.
echo ========================================================================
echo                    SISTEMA DE AUTENTICACIÓN EMPRESARIAL
echo                         .NET Core 8 + Angular 17
echo ========================================================================
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
echo ⏰ %date% - %time%
echo.

REM Verificar estado actual
call :check_status

echo ========================================================================
echo                              MENÚ PRINCIPAL
echo ========================================================================
echo.
echo  🚀 INICIO Y GESTIÓN:
echo     1. Inicio Rápido (Backend + Frontend)
echo     2. Inicio Completo (con opciones avanzadas)
echo     3. Solo Docker (con monitoreo completo)
echo.
echo  📊 MONITOREO Y ESTADO:
echo     4. Ver Estado de Servicios
echo     5. Abrir URLs en Navegador
echo     6. Ver Logs en Tiempo Real
echo.
echo  🛑 CONTROL:
echo     7. Detener Todos los Servicios
echo     8. Reiniciar Servicios
echo     9. Limpiar y Resetear
echo.
echo  🔧 HERRAMIENTAS:
echo     10. Configurar Base de Datos
echo     11. Ejecutar Tests
echo     12. Análisis de Rendimiento
echo.
echo  📚 INFORMACIÓN:
echo     13. Ver Documentación
echo     14. Credenciales de Prueba
echo     15. Ayuda y Soporte
echo.
echo     0. Salir
echo.
echo ========================================================================

set /p choice="Selecciona una opción (0-15): "

if "%choice%"=="1" goto :quick_start
if "%choice%"=="2" goto :full_start
if "%choice%"=="3" goto :docker_start
if "%choice%"=="4" goto :show_status
if "%choice%"=="5" goto :open_urls
if "%choice%"=="6" goto :show_logs
if "%choice%"=="7" goto :stop_services
if "%choice%"=="8" goto :restart_services
if "%choice%"=="9" goto :clean_reset
if "%choice%"=="10" goto :setup_database
if "%choice%"=="11" goto :run_tests
if "%choice%"=="12" goto :performance_analysis
if "%choice%"=="13" goto :show_documentation
if "%choice%"=="14" goto :show_credentials
if "%choice%"=="15" goto :show_help
if "%choice%"=="0" goto :exit

echo ❌ Opción inválida. Presiona cualquier tecla para continuar...
pause >nul
goto :main_menu

:quick_start
cls
echo 🚀 Iniciando FlexoApp (Modo Rápido)...
call quick-start.bat
pause
goto :main_menu

:full_start
cls
echo 🚀 Iniciando FlexoApp (Modo Completo)...
call start-flexoapp.bat
pause
goto :main_menu

:docker_start
cls
echo 🐳 Iniciando con Docker...
call start-optimized.bat
pause
goto :main_menu

:show_status
cls
call status-flexoapp.bat
goto :main_menu

:open_urls
cls
echo 🌐 Abriendo URLs en el navegador...
echo.

REM Verificar qué servicios están activos y abrir sus URLs
tasklist /fi "imagename eq node.exe" 2>nul | findstr node >nul
if %errorlevel% equ 0 (
    echo 🎨 Abriendo Frontend...
    start http://localhost:4200
    timeout /t 2 /nobreak >nul
)

tasklist /fi "imagename eq dotnet.exe" 2>nul | findstr dotnet >nul
if %errorlevel% equ 0 (
    echo 🚀 Abriendo API Documentation...
    start http://localhost:5000/swagger
    timeout /t 2 /nobreak >nul
)

docker ps --format "{{.Names}}" 2>nul | findstr grafana >nul
if %errorlevel% equ 0 (
    echo 📊 Abriendo Grafana...
    start http://localhost:3000
)

echo ✅ URLs abiertas en el navegador
pause
goto :main_menu

:show_logs
cls
echo 📋 Logs en Tiempo Real
echo ========================================================================
echo.
echo Selecciona qué logs ver:
echo.
echo 1. Logs del Backend (.NET Core)
echo 2. Logs del Frontend (Angular)
echo 3. Logs de Docker (todos los servicios)
echo 4. Logs de Base de Datos
echo 5. Volver al menú principal
echo.
set /p log_choice="Opción: "

if "%log_choice%"=="1" (
    echo 🚀 Mostrando logs del Backend...
    if exist "backend\logs" (
        powershell -Command "Get-Content 'backend\logs\*.log' -Wait -Tail 50"
    ) else (
        echo ℹ️  No se encontraron logs del backend
    )
) else if "%log_choice%"=="2" (
    echo 🎨 Los logs del Frontend aparecen en la ventana de comandos de Angular
) else if "%log_choice%"=="3" (
    echo 🐳 Mostrando logs de Docker...
    docker-compose logs -f
) else if "%log_choice%"=="4" (
    echo 🗄️  Mostrando logs de SQL Server...
    docker logs flexoapp-sqlserver -f 2>nul || echo ℹ️  SQL Server no está ejecutándose en Docker
) else (
    goto :main_menu
)

pause
goto :main_menu

:stop_services
cls
echo 🛑 Deteniendo todos los servicios...
call stop-flexoapp.bat
goto :main_menu

:restart_services
cls
echo 🔄 Reiniciando servicios...
echo.
echo 1. Reinicio Rápido
echo 2. Reinicio Completo
echo 3. Volver al menú
echo.
set /p restart_choice="Opción: "

if "%restart_choice%"=="1" (
    call stop-flexoapp.bat
    timeout /t 3 /nobreak >nul
    call quick-start.bat
) else if "%restart_choice%"=="2" (
    call stop-flexoapp.bat
    timeout /t 3 /nobreak >nul
    call start-flexoapp.bat
)

pause
goto :main_menu

:clean_reset
cls
echo 🧹 Limpieza y Reset del Sistema
echo ========================================================================
echo.
echo ⚠️  ADVERTENCIA: Esta acción eliminará:
echo    • Caché de aplicaciones
echo    • Logs temporales
echo    • Configuraciones locales
echo    • Contenedores Docker (opcional)
echo.
echo ¿Estás seguro? (s/n)
set /p confirm="Respuesta: "

if /i "%confirm%"=="s" (
    echo.
    echo 🛑 Deteniendo servicios...
    call stop-flexoapp.bat >nul 2>&1
    
    echo 🧹 Limpiando caché del frontend...
    if exist "frontend\.angular" rmdir /s /q "frontend\.angular" >nul 2>&1
    if exist "frontend\node_modules\.cache" rmdir /s /q "frontend\node_modules\.cache" >nul 2>&1
    
    echo 🧹 Limpiando logs...
    if exist "backend\logs" rmdir /s /q "backend\logs" >nul 2>&1
    
    echo 🧹 Limpiando build artifacts...
    if exist "backend\bin" rmdir /s /q "backend\bin" >nul 2>&1
    if exist "backend\obj" rmdir /s /q "backend\obj" >nul 2>&1
    if exist "frontend\dist" rmdir /s /q "frontend\dist" >nul 2>&1
    
    echo.
    echo ¿Eliminar también contenedores Docker? (s/n)
    set /p docker_clean="Respuesta: "
    
    if /i "!docker_clean!"=="s" (
        echo 🐳 Limpiando Docker...
        docker-compose down --volumes --remove-orphans >nul 2>&1
        docker system prune -f >nul 2>&1
    )
    
    echo ✅ Limpieza completada
) else (
    echo ❌ Operación cancelada
)

pause
goto :main_menu

:setup_database
cls
echo 🗄️  Configuración de Base de Datos
echo ========================================================================
echo.
echo 1. Inicializar Base de Datos
echo 2. Ejecutar Migraciones
echo 3. Optimizar Base de Datos
echo 4. Crear Datos de Prueba
echo 5. Backup de Base de Datos
echo 6. Volver al menú
echo.
set /p db_choice="Opción: "

if "%db_choice%"=="1" (
    echo 🗄️  Inicializando base de datos...
    docker exec flexoapp-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P FlexoApp2024! -i /scripts/InitializeDatabase.sql
) else if "%db_choice%"=="2" (
    echo 🔄 Ejecutando migraciones...
    cd backend && dotnet ef database update && cd ..
) else if "%db_choice%"=="3" (
    echo ⚡ Optimizando base de datos...
    docker exec flexoapp-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P FlexoApp2024! -i /scripts/OptimizeDatabase.sql
) else if "%db_choice%"=="4" (
    echo 👥 Creando datos de prueba...
    REM Aquí se ejecutaría un script para crear usuarios de prueba
    echo ℹ️  Funcionalidad en desarrollo
) else if "%db_choice%"=="5" (
    echo 💾 Creando backup...
    REM Aquí se ejecutaría un backup de la base de datos
    echo ℹ️  Funcionalidad en desarrollo
) else (
    goto :main_menu
)

pause
goto :main_menu

:run_tests
cls
echo 🧪 Ejecutar Tests
echo ========================================================================
echo.
echo 1. Tests del Backend (.NET)
echo 2. Tests del Frontend (Angular)
echo 3. Tests de Integración
echo 4. Tests de Rendimiento
echo 5. Volver al menú
echo.
set /p test_choice="Opción: "

if "%test_choice%"=="1" (
    echo 🚀 Ejecutando tests del backend...
    cd backend && dotnet test --verbosity normal && cd ..
) else if "%test_choice%"=="2" (
    echo 🎨 Ejecutando tests del frontend...
    cd frontend && npm test -- --watch=false --browsers=ChromeHeadless && cd ..
) else if "%test_choice%"=="3" (
    echo 🔗 Ejecutando tests de integración...
    echo ℹ️  Tests de integración en desarrollo
) else if "%test_choice%"=="4" (
    echo ⚡ Ejecutando tests de rendimiento...
    cd frontend && npm run performance-test && cd ..
) else (
    goto :main_menu
)

pause
goto :main_menu

:performance_analysis
cls
echo 📊 Análisis de Rendimiento
echo ========================================================================
echo.
echo 1. Análisis de Chunks (Frontend)
echo 2. Reporte de Bundle Size
echo 3. Métricas de Base de Datos
echo 4. Test con Lighthouse
echo 5. Volver al menú
echo.
set /p perf_choice="Opción: "

if "%perf_choice%"=="1" (
    echo 📦 Analizando chunks...
    cd frontend && npm run analyze && cd ..
) else if "%perf_choice%"=="2" (
    echo 📊 Generando reporte de bundle...
    cd frontend && npm run chunk-report && cd ..
) else if "%perf_choice%"=="3" (
    echo 🗄️  Analizando métricas de BD...
    echo ℹ️  Funcionalidad en desarrollo
) else if "%perf_choice%"=="4" (
    echo 🚀 Ejecutando Lighthouse...
    cd frontend && npm run performance-test && cd ..
) else (
    goto :main_menu
)

pause
goto :main_menu

:show_documentation
cls
echo 📚 Documentación
echo ========================================================================
echo.
echo 🌐 Abriendo documentación en el navegador...
echo.

if exist "README.md" (
    echo 📖 README Principal
    start https://github.com/emiliolp1818/flexoAPP
)

if exist "OPTIMIZACIONES_ESCALABILIDAD.md" (
    echo ⚡ Documentación de Optimizaciones
    start notepad "OPTIMIZACIONES_ESCALABILIDAD.md"
)

echo ✅ Documentación abierta
pause
goto :main_menu

:show_credentials
cls
echo 👤 Credenciales de Prueba
echo ========================================================================
echo.
echo 🔐 USUARIOS DE PRUEBA DISPONIBLES:
echo.
echo 👑 ADMINISTRADOR:
echo    Código: ADMIN001
echo    Contraseña: Admin123!
echo    Permisos: Acceso completo al sistema
echo.
echo 👨‍💼 SUPERVISOR:
echo    Código: SUPER001
echo    Contraseña: Super123!
echo    Permisos: Gestión de usuarios y reportes
echo.
echo 👨‍🔧 OPERADOR:
echo    Código: OPER001
echo    Contraseña: Oper123!
echo    Permisos: Operaciones básicas
echo.
echo 👨‍💻 CONSULTOR:
echo    Código: CONS001
echo    Contraseña: Cons123!
echo    Permisos: Solo lectura y consultas
echo.
echo 🗄️  BASE DE DATOS:
echo    Servidor: localhost:1433
echo    Usuario: sa
echo    Contraseña: FlexoApp2024!
echo    Base de Datos: flexoBD
echo.
echo 🔄 REDIS:
echo    Host: localhost:6379
echo    Sin contraseña
echo.
echo 📊 GRAFANA:
echo    URL: http://localhost:3000
echo    Usuario: admin
echo    Contraseña: admin123
echo.
pause
goto :main_menu

:show_help
cls
echo 🆘 Ayuda y Soporte
echo ========================================================================
echo.
echo 📋 COMANDOS RÁPIDOS:
echo.
echo    flexoapp.bat          - Este menú principal
echo    quick-start.bat       - Inicio rápido
echo    start-flexoapp.bat    - Inicio con opciones
echo    stop-flexoapp.bat     - Detener servicios
echo    status-flexoapp.bat   - Ver estado
echo.
echo 🔗 ENLACES ÚTILES:
echo.
echo    📚 Repositorio: https://github.com/emiliolp1818/flexoAPP
echo    🐛 Issues: https://github.com/emiliolp1818/flexoAPP/issues
echo    📖 Wiki: https://github.com/emiliolp1818/flexoAPP/wiki
echo.
echo 🛠️  SOLUCIÓN DE PROBLEMAS COMUNES:
echo.
echo    ❌ Puerto ocupado:
echo       Ejecuta stop-flexoapp.bat y vuelve a intentar
echo.
echo    ❌ Docker no responde:
echo       Reinicia Docker Desktop
echo.
echo    ❌ Base de datos no conecta:
echo       Verifica que SQL Server esté ejecutándose
echo.
echo    ❌ Frontend no carga:
echo       Verifica que Node.js esté instalado
echo.
echo 📧 CONTACTO:
echo    Email: emiliolp1818@gmail.com
echo    GitHub: @emiliolp1818
echo.
pause
goto :main_menu

:check_status
REM Verificar estado de servicios silenciosamente
tasklist /fi "imagename eq dotnet.exe" 2>nul | findstr dotnet >nul
if %errorlevel% equ 0 (
    set "backend_status=✅ ACTIVO"
) else (
    set "backend_status=❌ INACTIVO"
)

tasklist /fi "imagename eq node.exe" 2>nul | findstr node >nul
if %errorlevel% equ 0 (
    set "frontend_status=✅ ACTIVO"
) else (
    set "frontend_status=❌ INACTIVO"
)

docker ps --format "{{.Names}}" 2>nul | findstr flexoapp >nul
if %errorlevel% equ 0 (
    set "docker_status=✅ ACTIVO"
) else (
    set "docker_status=❌ INACTIVO"
)

echo 📊 Estado Actual: Backend %backend_status% ^| Frontend %frontend_status% ^| Docker %docker_status%
goto :eof

:exit
cls
echo.
echo ========================================
echo 👋 GRACIAS POR USAR FLEXOAPP
echo ========================================
echo.
echo 🎯 Sistema de Autenticación Empresarial
echo 🚀 .NET Core 8 + Angular 17
echo 📊 Con optimizaciones de rendimiento
echo.
echo 💡 Para volver a ejecutar: flexoapp.bat
echo.
echo ¡Hasta la próxima! 🎉
echo.
pause
exit /b 0