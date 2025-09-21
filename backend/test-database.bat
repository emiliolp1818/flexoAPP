@echo off
echo ========================================
echo    Flexo Spring - Prueba de Base de Datos
echo ========================================
echo.

echo 1. Verificando conexión a MySQL...
mysql --version
if %errorlevel% neq 0 (
    echo ERROR: MySQL no está instalado o no está en el PATH
    pause
    exit /b 1
)

echo.
echo 2. Creando base de datos flexoBD2...
mysql -u root -p < database/create_database.sql
if %errorlevel% neq 0 (
    echo ERROR: No se pudo crear la base de datos
    pause
    exit /b 1
)

echo.
echo 3. Base de datos creada exitosamente!
echo.
echo 4. Ahora ejecuta el backend con: run-backend.bat
echo 5. Luego prueba la conexión en: https://localhost:7000/api/user/test-connection
echo.

pause