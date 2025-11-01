@echo off
echo ========================================
echo    DETENIENDO SERVIDORES FLEXOAPP
echo ========================================
echo.

echo Deteniendo procesos de .NET (Backend)...
taskkill /f /im dotnet.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Procesos .NET detenidos
) else (
    echo ℹ No se encontraron procesos .NET ejecutándose
)

echo.
echo Deteniendo procesos de Node.js (Frontend)...
taskkill /f /im node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Procesos Node.js detenidos
) else (
    echo ℹ No se encontraron procesos Node.js ejecutándose
)

echo.
echo Deteniendo procesos de Angular CLI...
taskkill /f /im ng.exe 2>nul 2>nul

echo.
echo Cerrando ventanas de comando relacionadas...
taskkill /f /fi "WINDOWTITLE eq FlexoApp*" 2>nul

echo.
echo ========================================
echo Todos los servidores han sido detenidos
echo ========================================
echo.
pause