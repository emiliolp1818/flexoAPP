@echo off
echo 🚀 Iniciando sistema completo FlexoApp
echo ======================================
echo.

echo 📋 Pasos que se ejecutarán:
echo    1. Iniciar backend en puerto 5000
echo    2. Esperar a que el backend esté listo
echo    3. Ejecutar pruebas de conexión
echo    4. Iniciar Angular en puerto 4200
echo.

echo ⚠️  IMPORTANTE: Este script abrirá múltiples ventanas
echo    - Una para el backend (Node.js)
echo    - Una para Angular (ng serve)
echo    - Una para las pruebas
echo.

pause

echo 🔥 Iniciando backend...
start "FlexoApp Backend" cmd /k "cd simple-backend && npm install && npm start"

echo ⏳ Esperando 10 segundos para que el backend inicie...
timeout /t 10 /nobreak

echo 🧪 Ejecutando pruebas de conexión...
start "Pruebas FlexoApp" cmd /k "node test-frontend-connection.js && pause"

echo ⏳ Esperando 5 segundos antes de iniciar Angular...
timeout /t 5 /nobreak

echo 🅰️ Iniciando Angular...
start "FlexoApp Frontend" cmd /k "ng serve"

echo.
echo ✅ Sistema iniciado!
echo.
echo 🌐 URLs disponibles:
echo    - Backend: http://localhost:5000
echo    - Frontend: http://localhost:4200 (tardará unos minutos en compilar)
echo    - API Test: http://localhost:5000/api/test
echo.
echo 💡 Para verificar que todo funciona:
echo    1. Espera a que Angular termine de compilar
echo    2. Abre http://localhost:4200 en tu navegador
echo    3. Ve a la sección "Máquinas"
echo    4. Selecciona una máquina y verifica que aparezcan programas
echo    5. Prueba cambiar el estado de un programa
echo.
echo 🔍 Para ver logs y errores:
echo    - Backend: Ventana "FlexoApp Backend"
echo    - Frontend: Ventana "FlexoApp Frontend"
echo    - Navegador: Herramientas de desarrollador (F12)
echo.

pause