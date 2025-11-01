@echo off
echo ========================================
echo INICIANDO FRONTEND CON LAZY LOADING
echo ========================================
echo.

REM Verificar que Node.js esté instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no está instalado
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar que npm esté disponible
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm no está disponible
    pause
    exit /b 1
)

echo ✓ Node.js y npm están disponibles

REM Cambiar al directorio del frontend
cd frontend

REM Verificar si node_modules existe
if not exist "node_modules" (
    echo.
    echo 📦 Instalando dependencias...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Falló la instalación de dependencias
        pause
        exit /b 1
    )
    echo ✓ Dependencias instaladas
)

REM Verificar si Angular CLI está instalado globalmente
ng version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo 🔧 Instalando Angular CLI globalmente...
    npm install -g @angular/cli
    if %errorlevel% neq 0 (
        echo ERROR: Falló la instalación de Angular CLI
        pause
        exit /b 1
    )
    echo ✓ Angular CLI instalado
)

echo.
echo ========================================
echo CONFIGURACIONES DE OPTIMIZACIÓN ACTIVAS
echo ========================================
echo.
echo ✅ Lazy Loading de módulos habilitado
echo ✅ Chunks optimizados por funcionalidad
echo ✅ Preloading inteligente configurado
echo ✅ Tree shaking habilitado
echo ✅ Code splitting automático
echo ✅ Compresión gzip/brotli
echo ✅ Service Worker para caché
echo ✅ Bundle size monitoring
echo.

REM Mostrar opciones de inicio
echo Selecciona el modo de inicio:
echo.
echo 1. Desarrollo (con HMR y source maps)
echo 2. Desarrollo con análisis de chunks
echo 3. Producción local
echo 4. Generar reporte de chunks
echo 5. Análisis de bundle
echo 6. Test de rendimiento
echo.
set /p choice="Ingresa tu opción (1-6): "

if "%choice%"=="1" (
    echo.
    echo 🚀 Iniciando en modo desarrollo...
    echo 📍 URL: http://localhost:4200
    echo 🔥 Hot Module Replacement habilitado
    echo 🗺️  Source maps habilitados
    echo.
    npm start
) else if "%choice%"=="2" (
    echo.
    echo 🔍 Iniciando con análisis de chunks...
    set ANALYZE=true
    npm start
) else if "%choice%"=="3" (
    echo.
    echo 🏭 Construyendo para producción...
    npm run build:prod
    if %errorlevel% equ 0 (
        echo ✓ Build completado
        echo.
        echo 🌐 Iniciando servidor de producción...
        npm run serve:sw
    )
) else if "%choice%"=="4" (
    echo.
    echo 📊 Generando reporte de chunks...
    npm run build:prod
    if %errorlevel% equ 0 (
        npm run chunk-report
    )
) else if "%choice%"=="5" (
    echo.
    echo 📈 Analizando bundle...
    npm run analyze
) else if "%choice%"=="6" (
    echo.
    echo ⚡ Ejecutando test de rendimiento...
    echo Asegúrate de que la aplicación esté ejecutándose en http://localhost:4200
    pause
    npm run performance-test
) else (
    echo.
    echo ❌ Opción inválida. Iniciando en modo desarrollo por defecto...
    npm start
)

echo.
echo ========================================
echo INFORMACIÓN DE CHUNKS LAZY
echo ========================================
echo.
echo 📦 Chunks principales:
echo   • main.js - Código principal de la aplicación
echo   • vendors.js - Librerías de terceros
echo   • material.js - Angular Material
echo   • runtime.js - Runtime de webpack
echo.
echo 🔄 Chunks lazy (carga bajo demanda):
echo   • usuarios.js - Módulo de gestión de usuarios
echo   • reportes.js - Módulo de reportes
echo   • configuracion.js - Módulo de configuración
echo   • auth.js - Módulo de autenticación
echo.
echo 🚀 Optimizaciones activas:
echo   • Preloading inteligente basado en navegación
echo   • Cache de chunks en Service Worker
echo   • Compresión automática de assets
echo   • Tree shaking para eliminar código no usado
echo.
echo Para monitorear el rendimiento:
echo   • Abre DevTools → Network → JS para ver chunks
echo   • Usa Lighthouse para métricas de rendimiento
echo   • Ejecuta "npm run chunk-report" para análisis detallado
echo.
pause