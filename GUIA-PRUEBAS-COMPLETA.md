# 🧪 Guía Completa de Pruebas - FlexoApp

## 🎯 Objetivo
Esta guía te ayudará a verificar que el backend y frontend de FlexoApp se conecten correctamente y funcionen sin problemas.

## 📋 Prerrequisitos

### Software necesario:
- ✅ **Node.js** (versión 16 o superior)
- ✅ **Angular CLI** (`npm install -g @angular/cli`)
- ✅ **Git** (opcional, para clonar el proyecto)

### Verificar instalación:
```bash
node --version
npm --version
ng version
```

## 🚀 Métodos de Prueba

### Método 1: Pruebas Automáticas (Recomendado)

#### Opción A: Sistema completo
```bash
# Ejecuta todo el sistema de una vez
start-full-system.bat
```

#### Opción B: Solo pruebas
```bash
# Ejecuta todas las pruebas
run-all-tests.bat
```

### Método 2: Paso a Paso Manual

#### Paso 1: Iniciar Backend
```bash
# Opción 1: Usar script
start-backend.bat

# Opción 2: Manual
cd simple-backend
npm install
npm start
```

#### Paso 2: Probar Backend
```bash
# Opción 1: Usar script de prueba
node test-backend.js

# Opción 2: Probar en navegador
# Abrir: http://localhost:5000/api/test
```

#### Paso 3: Probar Conexión Frontend
```bash
node test-frontend-connection.js
```

#### Paso 4: Iniciar Angular
```bash
ng serve
```

#### Paso 5: Verificar en Navegador
1. Abrir: http://localhost:4200
2. Ir a sección "Máquinas"
3. Seleccionar una máquina
4. Verificar que aparezcan programas de producción

## 🔍 Qué Verificar

### En el Backend (Consola)
```
✅ Mensajes esperados:
🚀 Backend FlexoApp iniciado en http://localhost:5000
📊 Datos cargados:
   - Máquinas: 11
   - Programas de producción: 5
✅ Listo para recibir conexiones desde Angular!
```

### En Angular (Consola del Navegador - F12)
```
✅ Mensajes esperados:
✅ Programas cargados desde servidor: X
✅ Máquinas cargadas desde servidor: 11
🔄 Cargando programas desde: http://localhost:5000/api/workorders
🔄 Cargando máquinas desde: http://localhost:5000/api/machines
```

### En la Interfaz Web
- ✅ Dashboard muestra información
- ✅ Sección "Máquinas" lista las máquinas (11-21)
- ✅ Al seleccionar una máquina, aparecen programas
- ✅ Los programas muestran estados: listo, corriendo, suspendido, terminado
- ✅ Se pueden cambiar estados de programas
- ✅ Los cambios se reflejan inmediatamente

## 🧪 Pruebas Funcionales

### Prueba 1: Cambiar Estado de Programa
1. Seleccionar una máquina
2. Encontrar un programa en estado "listo"
3. Cambiar a "corriendo"
4. Verificar que el cambio se refleje inmediatamente

### Prueba 2: Suspender Programa
1. Seleccionar un programa en estado "corriendo"
2. Cambiar a "suspendido"
3. Escribir un motivo de suspensión
4. Confirmar
5. Verificar que aparezca el motivo

### Prueba 3: Resetear con Contraseña
1. Seleccionar un programa "terminado"
2. Hacer clic en "Resetear"
3. Ingresar contraseña: `admin123`
4. Verificar que vuelva a estado "listo"

### Prueba 4: Crear Programas de Prueba
1. Seleccionar una máquina
2. Hacer clic en "Crear Datos de Prueba"
3. Confirmar la creación
4. Verificar que aparezcan 5 nuevos programas

## ❌ Solución de Problemas

### Error: "Backend no disponible"
```bash
# Verificar que el backend esté corriendo
curl http://localhost:5000/api/test

# Si no responde, reiniciar:
cd simple-backend
npm start
```

### Error: "CORS"
- ✅ El backend ya está configurado para Angular
- ✅ Verificar que Angular esté en puerto 4200
- ✅ Verificar que backend esté en puerto 5000

### Error: "ng serve" no funciona
```bash
# Instalar dependencias
npm install

# Verificar Angular CLI
ng version

# Si falla, reinstalar CLI
npm install -g @angular/cli@latest
```

### Error: Datos no aparecen en Angular
1. Abrir herramientas de desarrollador (F12)
2. Ir a pestaña "Console"
3. Buscar errores en rojo
4. Verificar mensajes que empiecen con ⚠️

### Error: Puerto ocupado
```bash
# Para backend (puerto 5000)
netstat -ano | findstr :5000
taskkill /PID [PID_NUMBER] /F

# Para Angular (puerto 4200)
netstat -ano | findstr :4200
taskkill /PID [PID_NUMBER] /F
```

## 📊 Datos de Prueba Incluidos

### Máquinas (11 total)
- Máquinas 11-21
- Estados: activa, mantenimiento, parada
- Con datos de eficiencia y horas de operación

### Programas de Producción (5 iniciales)
- Cliente: "Productos Vicky"
- Productos: Kythos (Mixtos, Premium, Especial, Deluxe, Classic)
- Estados variados: listo, corriendo, suspendido, terminado
- Colores configurados con paleta visual

### Usuarios de Prueba (para login)
- `admin` / `admin123` (Administrador)
- `user` / `user123` (Usuario)
- `test` / `test123` (Usuario)

## 🔄 Flujo de Datos

```
Angular Frontend (puerto 4200)
    ↕️ HTTP Requests
Backend Node.js (puerto 5000)
    ↕️ JSON Data
Memoria (simulando base de datos)
```

## 📝 Logs Importantes

### Backend Logs
```
GET /api/machines - Enviando 11 máquinas
GET /api/workorders - Enviando X programas
POST /api/workorders - Programa creado con ID: X
PUT /api/workorders/X - Estado actualizado a: corriendo
```

### Frontend Logs
```
🔄 Cargando programas desde: http://localhost:5000/api/workorders
✅ Programas cargados desde servidor: X
🔄 Cargando máquinas desde: http://localhost:5000/api/machines
✅ Máquinas cargadas desde servidor: 11
```

## 🎉 Éxito Confirmado

Si ves estos indicadores, todo está funcionando:

### ✅ Backend
- Servidor iniciado en puerto 5000
- Responde a `/api/test`
- Logs de requests aparecen en consola

### ✅ Frontend
- Angular compilado sin errores
- Página carga en http://localhost:4200
- Datos aparecen en la interfaz
- Sin errores en consola del navegador

### ✅ Conexión
- Cambios en Angular se reflejan inmediatamente
- No hay errores de CORS
- Requests HTTP aparecen en Network tab (F12)

## 🆘 Soporte

Si las pruebas fallan:

1. **Revisar logs** en todas las consolas
2. **Verificar puertos** 5000 y 4200
3. **Comprobar dependencias** con `npm install`
4. **Reiniciar servicios** backend y frontend
5. **Limpiar caché** del navegador

## 📞 Comandos Útiles

```bash
# Verificar procesos en puertos
netstat -ano | findstr :5000
netstat -ano | findstr :4200

# Limpiar caché npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Verificar conectividad
ping localhost
curl http://localhost:5000/api/test
```

---

**¡Listo!** Con esta guía deberías poder verificar completamente que tu sistema FlexoApp funciona correctamente. 🚀