@echo off
echo ========================================
echo INICIANDO FLEXOAUTH CON OPTIMIZACIONES
echo ========================================
echo.

REM Verificar que Docker esté ejecutándose
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker no está instalado o no está ejecutándose
    echo Por favor instala Docker Desktop y asegúrate de que esté ejecutándose
    pause
    exit /b 1
)

echo Verificando Docker Desktop...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker Desktop no está ejecutándose
    echo Por favor inicia Docker Desktop y espera a que esté listo
    pause
    exit /b 1
)

echo ✓ Docker está listo

REM Crear directorios necesarios
echo.
echo Creando directorios necesarios...
if not exist "backend\logs" mkdir "backend\logs"
if not exist "monitoring\grafana\dashboards" mkdir "monitoring\grafana\dashboards"
if not exist "monitoring\grafana\datasources" mkdir "monitoring\grafana\datasources"
if not exist "nginx\ssl" mkdir "nginx\ssl"
echo ✓ Directorios creados

REM Detener contenedores existentes si están ejecutándose
echo.
echo Deteniendo contenedores existentes...
docker-compose down --remove-orphans >nul 2>&1

REM Limpiar volúmenes huérfanos
echo Limpiando recursos no utilizados...
docker system prune -f >nul 2>&1

REM Construir e iniciar servicios con configuración optimizada
echo.
echo ========================================
echo INICIANDO SERVICIOS OPTIMIZADOS
echo ========================================
echo.

echo 1. Iniciando base de datos SQL Server...
docker-compose up -d sqlserver
echo Esperando a que SQL Server esté listo...
timeout /t 30 /nobreak >nul

echo.
echo 2. Iniciando Redis...
docker-compose up -d redis
echo Esperando a que Redis esté listo...
timeout /t 10 /nobreak >nul

echo.
echo 3. Iniciando servicios de monitoreo...
docker-compose up -d prometheus grafana
echo Esperando a que los servicios de monitoreo estén listos...
timeout /t 15 /nobreak >nul

echo.
echo 4. Construyendo y iniciando backend...
docker-compose up -d --build backend
echo Esperando a que el backend esté listo...
timeout /t 20 /nobreak >nul

echo.
echo 5. Construyendo y iniciando frontend...
docker-compose up -d --build frontend
echo Esperando a que el frontend esté listo...
timeout /t 15 /nobreak >nul

echo.
echo 6. Iniciando load balancer (Nginx)...
docker-compose up -d nginx

echo.
echo ========================================
echo EJECUTANDO OPTIMIZACIONES DE BD
echo ========================================
echo.

REM Esperar un poco más para asegurar que SQL Server esté completamente listo
echo Esperando a que SQL Server esté completamente inicializado...
timeout /t 20 /nobreak >nul

echo Ejecutando script de optimización de base de datos...
docker exec flexoapp-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P FlexoApp2024! -i /scripts/OptimizeDatabase.sql

echo.
echo Ejecutando script de optimización de paginación...
docker exec flexoapp-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P FlexoApp2024! -i /scripts/OptimizePagination.sql

echo.
echo ========================================
echo VERIFICANDO ESTADO DE SERVICIOS
echo ========================================
echo.

REM Verificar estado de los contenedores
echo Verificando estado de contenedores...
docker-compose ps

echo.
echo ========================================
echo FLEXOAUTH INICIADO EXITOSAMENTE
echo ========================================
echo.
echo Servicios disponibles:
echo.
echo 🌐 Frontend (Angular):     http://localhost:4200
echo 🔧 Backend API:            http://localhost:5000
echo 📊 Grafana (Monitoreo):    http://localhost:3000 (admin/admin123)
echo 📈 Prometheus (Métricas):  http://localhost:9090
echo 🏥 Health Checks:          http://localhost:5000/health
echo 📋 Health UI:              http://localhost:5000/health-ui
echo 📊 Métricas:               http://localhost:5000/metrics
echo 🔍 MiniProfiler:           http://localhost:5000/profiler (si está habilitado)
echo.
echo 💾 Base de datos SQL Server: localhost:1433
echo 🗄️  Redis Cache:             localhost:6379
echo.
echo ========================================
echo CONFIGURACIONES DE RENDIMIENTO ACTIVAS
echo ========================================
echo.
echo ✓ Caché distribuido con Redis
echo ✓ Compresión de respuestas (Brotli/Gzip)
echo ✓ Rate limiting configurado
echo ✓ Output caching habilitado
echo ✓ Connection pooling optimizado
echo ✓ Índices de base de datos optimizados
echo ✓ Procedimientos almacenados para paginación
echo ✓ Monitoreo con Prometheus y Grafana
echo ✓ Health checks configurados
echo ✓ Logging estructurado con Serilog
echo ✓ Load balancing con Nginx
echo.
echo Para detener todos los servicios, ejecuta: stop-servers.bat
echo Para ver logs en tiempo real: docker-compose logs -f
echo.
echo ¡FlexoAuth está listo para manejar alta carga! 🚀
echo.
pause