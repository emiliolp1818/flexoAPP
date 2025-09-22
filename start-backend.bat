@echo off
echo 🚀 Iniciando Backend FlexoApp...
echo.

cd simple-backend

echo 📦 Instalando dependencias...
npm install

echo.
echo 🔥 Iniciando servidor...
echo.
echo ✅ El backend estará disponible en: http://localhost:5000
echo 🔗 Prueba la conexión en: http://localhost:5000/api/test
echo.
echo 💡 Para detener el servidor presiona Ctrl+C
echo.

npm start