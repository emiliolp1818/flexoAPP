@echo off
echo ========================================
echo    Flexo Spring API - Iniciando Backend
echo ========================================
echo.

cd FlexoSpringAPI

echo Restaurando paquetes NuGet...
dotnet restore

echo.
echo Iniciando la aplicación...
echo La API estará disponible en:
echo - HTTPS: https://localhost:7000
echo - HTTP:  http://localhost:5000
echo - Swagger: https://localhost:7000/swagger
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

dotnet run

pause