@echo off
echo ========================================
echo INICIALIZANDO REPOSITORIO GIT
echo ========================================
echo.

REM Verificar que Git esté instalado
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git no está instalado
    echo Por favor instala Git desde https://git-scm.com/
    pause
    exit /b 1
)

echo ✓ Git está disponible

REM Verificar si ya existe un repositorio Git
if exist ".git" (
    echo.
    echo ⚠️  Ya existe un repositorio Git en este directorio
    echo ¿Deseas reinicializarlo? (s/n)
    set /p reinit="Respuesta: "
    if /i not "%reinit%"=="s" (
        echo Operación cancelada
        pause
        exit /b 0
    )
    echo.
    echo 🗑️  Eliminando repositorio existente...
    rmdir /s /q .git
)

echo.
echo 🚀 Inicializando repositorio Git...

REM Inicializar repositorio
git init
if %errorlevel% neq 0 (
    echo ERROR: Falló la inicialización del repositorio
    pause
    exit /b 1
)

echo ✓ Repositorio inicializado

REM Configurar usuario (opcional)
echo.
echo 👤 Configurando usuario Git...
git config user.name "Emilio López"
git config user.email "emiliolp1818@gmail.com"
echo ✓ Usuario configurado

REM Configurar rama principal
echo.
echo 🌿 Configurando rama principal...
git branch -M main
echo ✓ Rama principal configurada como 'main'

REM Agregar archivos al staging
echo.
echo 📁 Agregando archivos al repositorio...
git add .
if %errorlevel% neq 0 (
    echo ERROR: Falló al agregar archivos
    pause
    exit /b 1
)

echo ✓ Archivos agregados al staging

REM Mostrar estado del repositorio
echo.
echo 📊 Estado del repositorio:
git status --short

REM Crear commit inicial
echo.
echo 💾 Creando commit inicial...
git commit -m "🚀 Initial commit: FlexoAPP - Sistema de autenticación empresarial

✨ Características implementadas:
- Backend .NET Core 8 con JWT authentication
- Frontend Angular 17 con lazy loading optimizado
- Sistema de roles granular
- Caché distribuido con Redis
- Monitoreo con Prometheus + Grafana
- Optimizaciones de rendimiento avanzadas
- Load balancing con Nginx
- Health checks automáticos
- Logging estructurado con Serilog
- Docker Compose para orquestación

🚀 Optimizaciones de rendimiento:
- Lazy loading con chunks inteligentes
- Preloading estratégico
- Connection pooling optimizado
- Índices de base de datos especializados
- Compresión automática de respuestas
- Rate limiting configurado

📊 Métricas objetivo:
- Tiempo de respuesta < 200ms (P95)
- Throughput 500-1000 req/s
- Cache hit rate 80-95%
- Bundle size < 500KB (gzip)"

if %errorlevel% neq 0 (
    echo ERROR: Falló al crear el commit
    pause
    exit /b 1
)

echo ✓ Commit inicial creado

REM Agregar remote origin
echo.
echo 🌐 Configurando repositorio remoto...
git remote add origin https://github.com/emiliolp1818/flexoAPP.git
if %errorlevel% neq 0 (
    echo ⚠️  Advertencia: No se pudo agregar el remote origin
    echo Puedes agregarlo manualmente más tarde con:
    echo git remote add origin https://github.com/emiliolp1818/flexoAPP.git
) else (
    echo ✓ Remote origin configurado
)

echo.
echo ========================================
echo REPOSITORIO GIT CONFIGURADO EXITOSAMENTE
echo ========================================
echo.
echo 📋 Resumen:
echo   • Repositorio inicializado en rama 'main'
echo   • Usuario configurado: Emilio López
echo   • Commit inicial creado con descripción completa
echo   • Remote origin: https://github.com/emiliolp1818/flexoAPP.git
echo.
echo 🚀 Próximos pasos:
echo.
echo 1. Crear el repositorio en GitHub (si no existe):
echo    https://github.com/new
echo    Nombre: flexoAPP
echo    Descripción: Sistema de autenticación empresarial con .NET Core y Angular
echo.
echo 2. Subir el código al repositorio:
echo    git push -u origin main
echo.
echo 3. Configurar GitHub Pages (opcional):
echo    Settings → Pages → Source: GitHub Actions
echo.
echo 4. Configurar GitHub Actions para CI/CD (próximamente)
echo.
echo 📊 Estadísticas del repositorio:
git log --oneline | wc -l > nul 2>&1 && echo   • Commits: 1
git ls-files | wc -l > nul 2>&1 && echo   • Archivos: && git ls-files | find /c /v ""
echo.
echo ¿Deseas subir el código a GitHub ahora? (s/n)
set /p upload="Respuesta: "

if /i "%upload%"=="s" (
    echo.
    echo 📤 Subiendo código a GitHub...
    git push -u origin main
    if %errorlevel% equ 0 (
        echo ✅ Código subido exitosamente a GitHub!
        echo 🌐 Repositorio disponible en: https://github.com/emiliolp1818/flexoAPP
    ) else (
        echo ❌ Error al subir el código
        echo Verifica que el repositorio exista en GitHub y tengas permisos
        echo Comando para intentar nuevamente: git push -u origin main
    )
) else (
    echo.
    echo 📝 Para subir el código más tarde, ejecuta:
    echo    git push -u origin main
)

echo.
echo 🎉 ¡Repositorio Git configurado correctamente!
echo.
pause