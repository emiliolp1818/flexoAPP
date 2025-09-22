@echo off
title FlexoApp - Script Maestro
color 0F

:menu
cls
echo.
echo ████████╗██╗     ███████╗██╗  ██╗ ██████╗  █████╗ ██████╗ ██████╗ 
echo ██╔════╝██║     ██╔════╝╝██╗██╔╝██╔═══██╗██╔══██╗██╔══██╗██╔══██╗
echo █████╗  ██║     █████╗   ╚███╔╝ ██║   ██║███████║██████╔╝██████╔╝
echo ██╔══╝  ██║     ██╔══╝   ██╔██╗ ██║   ██║██╔══██║██╔═══╝ ██╔═══╝ 
echo ██║     ███████╗███████╗██╔╝ ██╗╚██████╔╝██║  ██║██║     ██║     
echo ╚═╝     ╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝     
echo.
echo ═══════════════════════════════════════════════════════════════════
echo                    🚀 FLEXOAPP - SCRIPT MAESTRO
echo ═══════════════════════════════════════════════════════════════════
echo.
echo Selecciona una opción:
echo.
echo  1️⃣  INICIO RAPIDO - Iniciar FlexoApp (recomendado)
echo  2️⃣  VERIFICAR SISTEMA - Comprobar que todo esté instalado
echo  3️⃣  DIAGNOSTICAR ERRORES - Detectar problemas específicos
echo  4️⃣  ARREGLAR ERRORES - Reparar automáticamente
echo  5️⃣  LIMPIAR Y REINSTALAR - Empezar desde cero
echo  6️⃣  COMPILAR Y EJECUTAR - Compilar primero, luego ejecutar
echo  7️⃣  AYUDA - Ver documentación
echo  0️⃣  SALIR
echo.
echo ═══════════════════════════════════════════════════════════════════
echo.
set /p choice="Ingresa tu opción (0-7): "

if "%choice%"=="1" goto inicio_rapido
if "%choice%"=="2" goto verificar
if "%choice%"=="3" goto diagnosticar
if "%choice%"=="4" goto arreglar
if "%choice%"=="5" goto limpiar
if "%choice%"=="6" goto compilar
if "%choice%"=="7" goto ayuda
if "%choice%"=="0" goto salir
goto menu

:inicio_rapido
cls
echo.
echo 🚀 INICIANDO FLEXOAPP...
echo.
call INICIO-SIMPLE.bat
goto menu

:verificar
cls
echo.
echo 🔍 VERIFICANDO SISTEMA...
echo.
call verificar-sistema.bat
echo.
echo Presiona cualquier tecla para volver al menú...
pause >nul
goto menu

:diagnosticar
cls
echo.
echo 🔬 DIAGNOSTICANDO ERRORES...
echo.
call DIAGNOSTICO-ERRORES.bat
echo.
echo Presiona cualquier tecla para volver al menú...
pause >nul
goto menu

:arreglar
cls
echo.
echo 🔧 ARREGLANDO ERRORES...
echo.
call ARREGLAR-ERRORES.bat
echo.
echo Presiona cualquier tecla para volver al menú...
pause >nul
goto menu

:limpiar
cls
echo.
echo 🧹 LIMPIANDO Y REINSTALANDO...
echo.
call limpiar-reinstalar.bat
echo.
echo Presiona cualquier tecla para volver al menú...
pause >nul
goto menu

:compilar
cls
echo.
echo 🔨 COMPILANDO Y EJECUTANDO...
echo.
call COMPILAR-Y-EJECUTAR.bat
goto menu

:ayuda
cls
echo.
echo 📚 AYUDA - FLEXOAPP
echo ═══════════════════════════════════════
echo.
echo 🎯 PARA USUARIOS NUEVOS:
echo    - Ejecuta opción 1 (INICIO RAPIDO)
echo    - Si hay errores, ejecuta opción 2 (VERIFICAR SISTEMA)
echo.
echo 🔧 SI HAY PROBLEMAS:
echo    - Opción 3: Diagnostica errores específicos
echo    - Opción 4: Intenta arreglar automáticamente
echo    - Opción 5: Limpia todo y reinstala
echo.
echo 🚀 URLS DE LA APLICACION:
echo    - Frontend: http://localhost:4200
echo    - Backend:  http://localhost:5000
echo    - Test API: http://localhost:5000/api/test
echo.
echo 📋 FUNCIONALIDADES:
echo    - Dashboard con estadísticas
echo    - Gestión de 11 máquinas (11-21)
echo    - Programas de producción
echo    - Estados y seguimiento
echo    - Sincronización automática
echo.
echo 💡 REQUISITOS:
echo    - Windows 7/8/10/11
echo    - Node.js 16+ (se instala automáticamente)
echo    - Puertos 4200 y 5000 libres
echo.
echo ═══════════════════════════════════════
echo.
echo Presiona cualquier tecla para volver al menú...
pause >nul
goto menu

:salir
cls
echo.
echo 👋 ¡Gracias por usar FlexoApp!
echo.
echo 💡 Para volver a ejecutar, haz doble clic en: FLEXOAPP-MAESTRO.bat
echo.
pause
exit

:error
echo.
echo ❌ Opción no válida. Intenta de nuevo.
timeout /t 2 /nobreak >nul
goto menu