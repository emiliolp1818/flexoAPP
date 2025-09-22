@echo off
title FlexoApp - Limpieza y Reinstalacion
color 0C

echo.
echo 🧹 LIMPIEZA Y REINSTALACION FLEXOAPP
echo ═══════════════════════════════════════
echo.
echo ⚠️  ADVERTENCIA: Esto eliminará todas las dependencias instaladas
echo    y las reinstalará desde cero. Puede tomar varios minutos.
echo.
set /p confirm="¿Continuar? (S/N): "
if /i not "%confirm%"=="S" (
    echo Operación cancelada.
    pause
    exit /b 0
)

echo.
echo [1/6] 🗑️  Eliminando node_modules de Angular...
if exist "node_modules" (
    rmdir /s /q "node_modules"
    echo ✅ node_modules eliminado
) else (
    echo ℹ️  node_modules no existía
)

echo [2/6] 🗑️  Eliminando node_modules del backend...
if exist "simple-backend\node_modules" (
    rmdir /s /q "simple-backend\node_modules"
    echo ✅ node_modules del backend eliminado
) else (
    echo ℹ️  node_modules del backend no existía
)

echo [3/6] 🗑️  Eliminando archivos de cache...
if exist "package-lock.json" del "package-lock.json"
if exist "simple-backend\package-lock.json" del "simple-backend\package-lock.json"
if exist ".angular" rmdir /s /q ".angular"
echo ✅ Cache eliminado

echo [4/6] 📦 Reinstalando dependencias de Angular...
npm install
if %errorlevel% neq 0 (
    echo ❌ ERROR: No se pudieron instalar las dependencias de Angular
    pause
    exit /b 1
)
echo ✅ Dependencias de Angular instaladas

echo [5/6] 📦 Reinstalando dependencias del backend...
cd simple-backend
npm install
if %errorlevel% neq 0 (
    echo ❌ ERROR: No se pudieron instalar las dependencias del backend
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ Dependencias del backend instaladas

echo [6/6] 🧪 Verificando instalación...
echo.
call verificar-sistema.bat

echo.
echo ═══════════════════════════════════════
echo ✅ LIMPIEZA Y REINSTALACION COMPLETADA
echo ═══════════════════════════════════════
echo.
echo 🚀 Ahora puedes ejecutar: INICIAR-FLEXOAPP.bat
echo.
pause