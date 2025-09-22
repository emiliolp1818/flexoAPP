# 📋 Carga Masiva de Programas de Producción

## Descripción
Nueva funcionalidad que permite cargar automáticamente 10 programas de producción a cada máquina seleccionada, optimizando el proceso de configuración inicial de las máquinas.

## Características

### ✅ Funcionalidades Implementadas
- **Selección múltiple de máquinas**: Interfaz intuitiva para seleccionar las máquinas donde cargar los programas
- **Carga masiva**: Genera automáticamente 10 programas únicos por cada máquina seleccionada
- **Progreso en tiempo real**: Barra de progreso que muestra el avance de la carga
- **Programas personalizados**: Cada programa tiene identificadores únicos por máquina
- **Modal de confirmación**: Resumen detallado de los programas cargados exitosamente

### 🎯 Beneficios
- **Ahorro de tiempo**: Reduce significativamente el tiempo de configuración inicial
- **Consistencia**: Garantiza que todas las máquinas tengan programas base similares
- **Escalabilidad**: Puede manejar múltiples máquinas simultáneamente
- **Trazabilidad**: Cada programa generado tiene identificadores únicos para seguimiento

## Acceso a la Funcionalidad

### Desde el Dashboard
1. Ir al Dashboard principal
2. Buscar el botón "Carga de Programas" en la sección "Accesos Rápidos"
3. Hacer clic para acceder a la funcionalidad

### URL Directa
```
http://localhost:4200/carga-programas
```

## Uso de la Funcionalidad

### Paso 1: Selección de Máquinas
- **Vista de máquinas**: Se muestran todas las máquinas activas disponibles
- **Selección individual**: Clic en cada máquina para seleccionar/deseleccionar
- **Seleccionar todas**: Botón para seleccionar todas las máquinas de una vez
- **Limpiar selección**: Botón para deseleccionar todas las máquinas

### Paso 2: Revisión del Resumen
- **Máquinas seleccionadas**: Contador de máquinas seleccionadas
- **Total de programas**: Cálculo automático (máquinas × 10)
- **Programas por máquina**: Confirmación de 10 programas por máquina

### Paso 3: Ejecución de la Carga
- **Botón de carga**: Inicia el proceso de carga masiva
- **Barra de progreso**: Muestra el progreso en tiempo real
- **Indicador de porcentaje**: Porcentaje de completitud

### Paso 4: Confirmación de Éxito
- **Modal de éxito**: Confirmación visual de la carga completada
- **Resumen detallado**: Cantidad de programas cargados por máquina
- **Programas totales**: Total de programas creados exitosamente

## Estructura de Programas Generados

### Nomenclatura
- **Artículo**: `ART-BULK-M{NUMERO_MAQUINA}-P{NUMERO_PROGRAMA}`
- **OT SAP**: `OT-BULK-M{NUMERO_MAQUINA}-{NUMERO_PROGRAMA_PADDED}`
- **Referencia**: `REF-BULK-M{NUMERO_MAQUINA}`

### Ejemplo para Máquina 11
```
Programa 1: ART-BULK-M11-P1, OT-BULK-M11-01
Programa 2: ART-BULK-M11-P2, OT-BULK-M11-02
...
Programa 10: ART-BULK-M11-P10, OT-BULK-M11-10
```

### Configuración Base de Programas
- **Cliente**: Cliente Estándar
- **TD**: TD-STD
- **Colores**: 4 (Cyan, Magenta, Yellow, Black)
- **Sustrato**: BOPP 20 micras
- **Kilos base**: 950 + (índice_programa × 50)
- **Estado inicial**: Listo
- **Usuario**: sistema-carga

## Integración con el Sistema

### Servicios Utilizados
- **ProductionService**: Manejo de órdenes de trabajo y máquinas
- **AuthGuard**: Protección de ruta (requiere autenticación)

### Componentes Relacionados
- **Header**: Navegación y autenticación
- **PageBanner**: Banner de página con título y subtítulo
- **Dashboard**: Punto de acceso principal

### Base de Datos
- Los programas se almacenan en la tabla de órdenes de trabajo
- Sincronización automática con el backend C# .NET 8
- Fallback local en caso de problemas de conectividad

## Consideraciones Técnicas

### Performance
- **Carga asíncrona**: Los programas se crean de forma asíncrona
- **Progreso incremental**: Actualización de progreso por cada programa creado
- **Manejo de errores**: Continúa la carga aunque algunos programas fallen

### Seguridad
- **Autenticación requerida**: Solo usuarios autenticados pueden acceder
- **Validación de entrada**: Verificación de máquinas seleccionadas
- **Trazabilidad**: Registro del usuario que ejecutó la carga

### Escalabilidad
- **Múltiples máquinas**: Soporta carga en múltiples máquinas simultáneamente
- **Configuración flexible**: Fácil modificación del número de programas por máquina
- **Extensibilidad**: Base para futuras funcionalidades de carga masiva

## Próximas Mejoras

### Funcionalidades Planificadas
- **Plantillas personalizadas**: Permitir diferentes tipos de programas base
- **Programación temporal**: Agendar cargas para horarios específicos
- **Importación desde Excel**: Cargar programas desde archivos externos
- **Validación avanzada**: Verificar capacidad de máquinas antes de cargar

### Optimizaciones
- **Carga en lotes**: Optimizar la creación de múltiples programas
- **Cache inteligente**: Mejorar la velocidad de carga
- **Notificaciones**: Alertas por email cuando se complete la carga

## Soporte y Mantenimiento

### Logs y Monitoreo
- Los errores se registran en la consola del navegador
- Seguimiento de progreso en tiempo real
- Confirmación visual de operaciones exitosas

### Resolución de Problemas
- **Error de conectividad**: Fallback a creación local de programas
- **Máquinas no disponibles**: Solo se muestran máquinas activas
- **Fallos parciales**: La carga continúa aunque algunos programas fallen

---

**Desarrollado para Flexo Spring - Sistema de Gestión de Empaques Flexibles**