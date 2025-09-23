@echo off
echo 🗄️ Iniciando Backend FlexoApp con MySQL...
echo ==========================================
echo.

echo 📋 Verificando configuración...

if not exist "mysql-backend\.env" (
    echo ⚠️  Archivo .env no encontrado
    echo 📝 Creando archivo .env desde plantilla...
    copy "mysql-backend\.env.example" "mysql-backend\.env"
    echo.
    echo ✅ Archivo .env creado
    echo 💡 IMPORTANTE: Edita mysql-backend\.env con tus credenciales de MySQL
    echo.
    pause
)

echo 📦 Instalando dependencias...
cd mysql-backend
npm install

echo.
echo 🔥 Iniciando servidor MySQL...
echo.
echo ✅ El backend estará disponible en: http://localhost:5000
echo 🗄️  Conectando a MySQL en: localhost:3306
echo 🔗 Prueba la conexión en: http://localhost:5000/api/test
echo.
echo 💡 Para detener el servidor presiona Ctrl+C
echo.

npm start