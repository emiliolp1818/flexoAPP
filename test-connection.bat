@echo off
echo 🔧 Probando conexión con el backend...
echo.

curl -s http://localhost:5000/api/test
if %errorlevel% == 0 (
    echo.
    echo ✅ Backend funcionando correctamente!
) else (
    echo ❌ Backend no está corriendo
    echo 💡 Ejecuta start-backend.bat primero
)

echo.
pause