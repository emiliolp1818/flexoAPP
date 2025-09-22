@echo off
echo 🚀 Iniciando FlexoApp Completo...
echo.

echo 📦 Paso 1: Instalando dependencias del backend...
cd simple-backend
npm install
cd ..

echo.
echo 🔥 Paso 2: Iniciando backend en segundo plano...
start /B cmd /c "cd simple-backend && npm start"

echo.
echo ⏳ Esperando que el backend inicie...
timeout /t 3 /nobreak > nul

echo.
echo 🧪 Paso 3: Probando conexión...
curl -s http://localhost:5000/api/test > nul
if %errorlevel% == 0 (
    echo ✅ Backend funcionando correctamente!
) else (
    echo ⚠️ Backend tardando en iniciar, continuando...
)

echo.
echo 🅰️ Paso 4: Iniciando Angular...
echo.
echo 💡 La aplicación se abrirá en: http://localhost:4200
echo 💡 El backend está en: http://localhost:5000
echo.
echo 🛑 Para detener todo, cierra esta ventana
echo.

ng serve --open