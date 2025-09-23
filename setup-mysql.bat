@echo off
echo 🗄️ Configurando Base de Datos MySQL para FlexoApp
echo ================================================
echo.

echo 📋 Pasos que se ejecutarán:
echo    1. Crear base de datos flexoapp_db
echo    2. Crear tablas: maquinas, programas_produccion, historial_estados
echo    3. Insertar datos iniciales
echo    4. Crear procedimientos almacenados
echo    5. Crear vista optimizada
echo.

echo ⚠️  REQUISITOS:
echo    - MySQL Server instalado y corriendo
echo    - Usuario root con permisos
echo    - Puerto 3306 disponible
echo.

set /p mysql_password="Ingresa la contraseña de MySQL root: "

echo.
echo 🔧 Ejecutando script de creación...
mysql -u root -p%mysql_password% < database/create_flexo_tables.sql

if %errorlevel% == 0 (
    echo.
    echo ✅ Base de datos configurada exitosamente!
    echo.
    echo 📊 Resumen de la configuración:
    echo    - Base de datos: flexoapp_db
    echo    - Tablas creadas: 3
    echo    - Máquinas insertadas: 11
    echo    - Programas insertados: 5
    echo    - Procedimientos: 3
    echo    - Vista: 1
    echo.
    echo 🔗 Cadena de conexión para el backend:
    echo    Server=localhost;Database=flexoapp_db;User=root;Password=%mysql_password%;Port=3306;
    echo.
    echo 💡 Próximos pasos:
    echo    1. Actualizar la configuración del backend con MySQL
    echo    2. Instalar driver MySQL para Node.js: npm install mysql2
    echo    3. Modificar el backend para usar MySQL en lugar de memoria
) else (
    echo.
    echo ❌ Error configurando la base de datos
    echo.
    echo 💡 Posibles soluciones:
    echo    - Verificar que MySQL esté corriendo
    echo    - Comprobar la contraseña de root
    echo    - Asegurar que el puerto 3306 esté disponible
    echo    - Verificar que el archivo database/create_flexo_tables.sql exista
)

echo.
pause