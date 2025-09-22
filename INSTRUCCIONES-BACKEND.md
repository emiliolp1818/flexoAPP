# 🚀 Instrucciones para Iniciar el Backend

## Pasos Rápidos:

### 1. Iniciar el Backend
```bash
# Doble clic en el archivo:
start-backend.bat
```

O manualmente:
```bash
cd simple-backend
npm install
npm start
```

### 2. Verificar que Funciona
```bash
# Doble clic en el archivo:
test-connection.bat
```

O abrir en el navegador: http://localhost:5000/api/test

### 3. Iniciar Angular
```bash
ng serve
```

## ✅ Verificación:

1. **Backend corriendo**: Deberías ver en la consola:
   ```
   🚀 Backend FlexoApp iniciado en http://localhost:5000
   📊 Datos cargados:
      - Máquinas: 11
      - Programas de producción: 5
   ✅ Listo para recibir conexiones desde Angular!
   ```

2. **Angular conectado**: En la consola del navegador (F12) deberías ver:
   ```
   ✅ Programas cargados desde servidor: 5
   ✅ Máquinas cargadas desde servidor: 11
   ```

3. **Datos visibles**: En la aplicación deberías ver:
   - Dashboard con información
   - Máquinas con programas de producción
   - Cambios de estado que se guardan

## 🔧 Solución de Problemas:

### Si no se conecta:
1. Verificar que el backend esté corriendo en puerto 5000
2. Verificar que Angular esté en puerto 4200
3. Revisar la consola del navegador para errores

### Si no aparecen datos:
1. Abrir consola del navegador (F12)
2. Buscar mensajes que empiecen con ✅ o ⚠️
3. Si ves ⚠️, el backend no está corriendo

### Dashboard sin scroll:
- El problema del scroll ya está arreglado
- Si persiste, recargar la página (F5)

## 📊 Datos Incluidos:

- **11 máquinas** (números 11-21)
- **5 programas de producción** iniciales
- **Colores con paleta visual**
- **Estados**: listo, corriendo, suspendido, terminado

## 🔄 Funcionalidades que Funcionan:

- ✅ Cambiar estados de programas
- ✅ Suspender con motivo
- ✅ Resetear con contraseña admin (admin123)
- ✅ Crear nuevos programas
- ✅ Duplicar programas
- ✅ Eliminar programas
- ✅ Imprimir programas
- ✅ Sincronización automática

## 💡 Consejos:

1. **Mantén el backend corriendo** mientras usas la aplicación
2. **Los cambios se guardan automáticamente** en el servidor
3. **Puedes abrir múltiples pestañas** y ver los cambios sincronizados
4. **Para crear más datos**, usa el botón "Crear Datos de Prueba" en máquinas