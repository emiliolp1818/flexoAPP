@echo off
echo ========================================
echo CONFIGURACIÓN DE GITHUB
echo ========================================
echo.

echo 🔐 Para subir el código a GitHub necesitas autenticarte.
echo.
echo Opciones disponibles:
echo.
echo 1. Usar GitHub CLI (recomendado)
echo 2. Usar Personal Access Token
echo 3. Configurar SSH Key
echo 4. Usar GitHub Desktop
echo.

echo ========================================
echo OPCIÓN 1: GITHUB CLI (RECOMENDADO)
echo ========================================
echo.
echo 1. Instala GitHub CLI desde: https://cli.github.com/
echo 2. Ejecuta: gh auth login
echo 3. Sigue las instrucciones para autenticarte
echo 4. Luego ejecuta: git push -u origin main
echo.

echo ========================================
echo OPCIÓN 2: PERSONAL ACCESS TOKEN
echo ========================================
echo.
echo 1. Ve a GitHub → Settings → Developer settings → Personal access tokens
echo 2. Genera un nuevo token con permisos de 'repo'
echo 3. Copia el token
echo 4. Cuando Git pida credenciales:
echo    - Username: emiliolp1818
echo    - Password: [pega tu token aquí]
echo.

echo ========================================
echo OPCIÓN 3: SSH KEY
echo ========================================
echo.
echo 1. Genera una SSH key:
echo    ssh-keygen -t ed25519 -C "emiliolp1818@gmail.com"
echo.
echo 2. Agrega la key al ssh-agent:
echo    eval "$(ssh-agent -s)"
echo    ssh-add ~/.ssh/id_ed25519
echo.
echo 3. Copia la key pública:
echo    cat ~/.ssh/id_ed25519.pub
echo.
echo 4. Agrégala a GitHub → Settings → SSH and GPG keys
echo.
echo 5. Cambia el remote a SSH:
echo    git remote set-url origin git@github.com:emiliolp1818/flexoAPP.git
echo.

echo ========================================
echo OPCIÓN 4: GITHUB DESKTOP
echo ========================================
echo.
echo 1. Descarga GitHub Desktop: https://desktop.github.com/
echo 2. Inicia sesión con tu cuenta de GitHub
echo 3. Clona o agrega este repositorio local
echo 4. Haz push desde la interfaz gráfica
echo.

echo ========================================
echo PASOS ADICIONALES
echo ========================================
echo.
echo 1. Asegúrate de que el repositorio existe en GitHub:
echo    https://github.com/emiliolp1818/flexoAPP
echo.
echo 2. Si no existe, créalo:
echo    - Ve a https://github.com/new
echo    - Nombre: flexoAPP
echo    - Descripción: Sistema de autenticación empresarial
echo    - Público o Privado (tu elección)
echo    - NO inicialices con README (ya tenemos uno)
echo.
echo 3. Verifica tu configuración Git:
echo    git config --global user.name "Emilio López"
echo    git config --global user.email "emiliolp1818@gmail.com"
echo.

echo ========================================
echo COMANDOS PARA DESPUÉS DE AUTENTICARTE
echo ========================================
echo.
echo # Verificar remote
echo git remote -v
echo.
echo # Subir código
echo git push -u origin main
echo.
echo # Verificar en GitHub
echo # Ve a: https://github.com/emiliolp1818/flexoAPP
echo.

echo ========================================
echo SOLUCIÓN RÁPIDA CON GITHUB CLI
echo ========================================
echo.
echo Si tienes GitHub CLI instalado, ejecuta estos comandos:
echo.
echo 1. gh auth login
echo 2. gh repo create flexoAPP --public --source=. --remote=origin --push
echo.
echo Esto creará el repositorio y subirá el código automáticamente.
echo.

echo ¿Quieres que abra la página de GitHub para crear el repositorio? (s/n)
set /p open="Respuesta: "

if /i "%open%"=="s" (
    start https://github.com/new
    echo.
    echo 🌐 Página de GitHub abierta en tu navegador
    echo Crea el repositorio con el nombre: flexoAPP
    echo.
)

echo.
echo 📋 RESUMEN DE LO QUE TIENES LISTO:
echo.
echo ✅ Repositorio Git inicializado
echo ✅ Commit inicial creado con descripción completa
echo ✅ Remote origin configurado
echo ✅ Rama main configurada
echo ✅ README.md profesional creado
echo ✅ .gitignore completo configurado
echo ✅ LICENSE MIT incluida
echo ✅ GitHub Actions CI/CD preparado
echo.
echo 🚀 Solo falta autenticarte con GitHub y hacer push!
echo.
pause