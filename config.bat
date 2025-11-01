@echo off
echo ========================================
echo    CONFIGURACIÓN FLEXOAPP
echo ========================================
echo.

:config_menu
echo Opciones de configuración:
echo.
echo [1] Verificar requisitos del sistema
echo [2] Instalar dependencias del frontend
echo [3] Restaurar paquetes del backend
echo [4] Configurar base de datos
echo [5] Generar certificado SSL para desarrollo
echo [6] Verificar puertos disponibles
echo [0] Volver al menú principal
echo.
set /p config_choice="Selecciona una opción: "

if "%config_choice%"=="1" goto check_requirements
if "%config_choice%"=="2" goto install_frontend
if "%config_choice%"=="3" goto restore_backend
if "%config_choice%"=="4" goto setup_database
if "%config_choice%"=="5" goto setup_ssl
if "%config_choice%"=="6" goto check_ports
if "%config_choice%"=="0" exit /b
echo Opción inválida.
goto config_menu

:check_requirements
echo.
echo Verificando requisitos del sistema...
echo.

echo Verificando .NET SDK...
dotnet --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ .NET SDK instalado
    dotnet --version
) else (
    echo ✗ .NET SDK no encontrado
    echo   Descarga desde: https://dotnet.microsoft.com/download
)

echo.
echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Node.js instalado
    node --version
) else (
    echo ✗ Node.js no encontrado
    echo   Descarga desde: https://nodejs.org/
)

echo.
echo Verificando Angular CLI...
ng version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Angular CLI instalado
) else (
    echo ✗ Angular CLI no encontrado
    echo   Instala con: npm install -g @angular/cli
)

echo.
echo Verificando SQL Server...
sqlcmd -S localhost -E -Q "SELECT @@VERSION" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ SQL Server disponible
) else (
    echo ✗ SQL Server no disponible
    echo   Verifica que SQL Server esté ejecutándose
)

pause
goto config_menu

:install_frontend
echo.
echo Instalando dependencias del frontend...
cd frontend
npm install
if %errorlevel% equ 0 (
    echo ✓ Dependencias instaladas correctamente
) else (
    echo ✗ Error al instalar dependencias
)
cd ..
pause
goto config_menu

:restore_backend
echo.
echo Restaurando paquetes del backend...
cd backend
dotnet restore
if %errorlevel% equ 0 (
    echo ✓ Paquetes restaurados correctamente
) else (
    echo ✗ Error al restaurar paquetes
)
cd ..
pause
goto config_menu

:setup_database
echo.
echo Configurando base de datos...
if exist "backend\Scripts\InitializeDatabase.sql" (
    sqlcmd -S localhost -E -i "backend\Scripts\InitializeDatabase.sql"
    if %errorlevel% equ 0 (
        echo ✓ Base de datos configurada correctamente
    ) else (
        echo ✗ Error al configurar la base de datos
    )
) else (
    echo ✗ Script de base de datos no encontrado
)
pause
goto config_menu

:setup_ssl
echo.
echo Configurando certificado SSL para desarrollo...
dotnet dev-certs https --trust
if %errorlevel% equ 0 (
    echo ✓ Certificado SSL configurado
) else (
    echo ✗ Error al configurar certificado SSL
)
pause
goto config_menu

:check_ports
echo.
echo Verificando puertos disponibles...
echo.
echo Puerto 4200 (Frontend):
netstat -an | findstr ":4200" >nul
if %errorlevel% equ 0 (
    echo ✗ Puerto 4200 en uso
    netstat -an | findstr ":4200"
) else (
    echo ✓ Puerto 4200 disponible
)

echo.
echo Puerto 7000 (Backend HTTPS):
netstat -an | findstr ":7000" >nul
if %errorlevel% equ 0 (
    echo ✗ Puerto 7000 en uso
    netstat -an | findstr ":7000"
) else (
    echo ✓ Puerto 7000 disponible
)

echo.
echo Puerto 5000 (Backend HTTP):
netstat -an | findstr ":5000" >nul
if %errorlevel% equ 0 (
    echo ✗ Puerto 5000 en uso
    netstat -an | findstr ":5000"
) else (
    echo ✓ Puerto 5000 disponible
)

pause
goto config_menu