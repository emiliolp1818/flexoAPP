@echo off
echo ========================================
echo 🛑 DETENIENDO FLEXOAPP
echo ========================================
echo.

echo 🔍 Buscando procesos de FlexoApp...

REM Detener procesos de .NET (Backend)
echo 🚀 Deteniendo Backend (.NET Core)...
taskkill /f /im dotnet.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend detenido
) else (
    echo ℹ️  No se encontraron procesos del backend
)

REM Detener procesos de Node.js (Frontend)
echo 🎨 Deteniendo Frontend (Angular)...
taskkill /f /im node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend detenido
) else (
    echo ℹ️  No se encontraron procesos del frontend
)

REM Detener procesos específicos de Angular CLI
taskkill /f /fi "WINDOWTITLE eq FlexoApp*" >nul 2>&1

REM Detener contenedores Docker si existen
echo 🐳 Verificando contenedores Docker...
docker ps -q --filter "name=flexoapp" >nul 2>&1
if %errorlevel% equ 0 (
    echo 🛑 Deteniendo contenedores Docker...
    docker-compose down --remove-orphans >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Contenedores Docker detenidos
    ) else (
        echo ⚠️  Error deteniendo contenedores Docker
    )
) else (
    echo ℹ️  No se encontraron contenedores Docker
)

REM Liberar puertos específicos si están ocupados
echo 🔌 Liberando puertos...

REM Puerto 4200 (Frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4200') do (
    taskkill /f /pid %%a >nul 2>&1
)

REM Puerto 5000 (Backend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    taskkill /f /pid %%a >nul 2>&1
)

REM Puerto 3000 (Grafana)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo ✅ Puertos liberados

REM Limpiar archivos temporales
echo 🧹 Limpiando archivos temporales...

if exist "frontend\src\environments\environment.local.ts" (
    del "frontend\src\environments\environment.local.ts" >nul 2>&1
    echo ✅ Configuración local eliminada
)

if exist "frontend\src\environments\environment.network.ts" (
    del "frontend\src\environments\environment.network.ts" >nul 2>&1
    echo ✅ Configuración de red eliminada
)

REM Limpiar caché de Angular si existe
if exist "frontend\.angular\cache" (
    rmdir /s /q "frontend\.angular\cache" >nul 2>&1
    echo ✅ Caché de Angular limpiado
)

echo.
echo ========================================
echo ✅ FLEXOAPP DETENIDO COMPLETAMENTE
echo ========================================
echo.
echo 🔍 Verificación final de puertos:

REM Verificar que los puertos estén libres
netstat -an | findstr :4200 >nul 2>&1
if %errorlevel% neq 0 (
    echo ✅ Puerto 4200 (Frontend) libre
) else (
    echo ⚠️  Puerto 4200 aún ocupado
)

netstat -an | findstr :5000 >nul 2>&1
if %errorlevel% neq 0 (
    echo ✅ Puerto 5000 (Backend) libre
) else (
    echo ⚠️  Puerto 5000 aún ocupado
)

netstat -an | findstr :3000 >nul 2>&1
if %errorlevel% neq 0 (
    echo ✅ Puerto 3000 (Grafana) libre
) else (
    echo ⚠️  Puerto 3000 aún ocupado
)

echo.
echo 📋 Resumen:
echo   • Procesos de backend y frontend terminados
echo   • Contenedores Docker detenidos (si existían)
echo   • Puertos liberados
echo   • Archivos temporales limpiados
echo   • Sistema listo para nuevo inicio
echo.

echo 💡 Para reiniciar FlexoApp:
echo    • Ejecuta: start-flexoapp.bat (completo)
echo    • O ejecuta: quick-start.bat (rápido)
echo.

echo 🎯 ¡FlexoApp detenido correctamente!
echo.
pause