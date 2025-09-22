@echo off
title FlexoApp - Prueba Rapida
color 0A

echo.
echo 🧪 PRUEBA RAPIDA FLEXOAPP
echo ═══════════════════════════════════════
echo.

echo [1/3] 🔍 Verificando sistema...
call verificar-sistema.bat >nul 2>&1

echo [2/3] 🚀 Iniciando backend de prueba...
cd simple-backend
start /B cmd /c "node server.js"
cd ..

echo [3/3] ⏳ Esperando backend...
timeout /t 3 /nobreak >nul

echo.
echo 🧪 Probando endpoints...
echo.

REM Probar endpoint de test
echo 📡 Probando /api/test...
curl -s http://localhost:5000/api/test
if %errorlevel% equ 0 (
    echo ✅ Endpoint de prueba OK
) else (
    echo ❌ Endpoint de prueba FALLO
)

echo.
echo 📡 Probando /api/machines...
curl -s http://localhost:5000/api/machines | find "numero" >nul
if %errorlevel% equ 0 (
    echo ✅ Endpoint de máquinas OK
) else (
    echo ❌ Endpoint de máquinas FALLO
)

echo.
echo 📡 Probando /api/workorders...
curl -s http://localhost:5000/api/workorders | find "articulo" >nul
if %errorlevel% equ 0 (
    echo ✅ Endpoint de programas OK
) else (
    echo ❌ Endpoint de programas FALLO
)

echo.
echo ═══════════════════════════════════════
echo ✅ PRUEBA COMPLETADA
echo ═══════════════════════════════════════
echo.
echo 💡 Si todos los endpoints están OK, ejecuta: INICIAR-FLEXOAPP.bat
echo.

REM Matar el proceso del backend de prueba
taskkill /F /IM node.exe >nul 2>&1

pause