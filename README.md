# FlexoAPP 🚀

Sistema de autenticación y gestión de usuarios empresarial con arquitectura escalable y optimizaciones de rendimiento avanzadas.

## 📋 Descripción

FlexoAPP es una aplicación web completa que combina un backend robusto en .NET Core con un frontend moderno en Angular, diseñada para manejar alta carga y escalar horizontalmente. Incluye autenticación JWT, gestión de usuarios, sistema de roles, caché distribuido, monitoreo en tiempo real y optimizaciones de rendimiento.

## ✨ Características Principales

### 🔐 Autenticación y Seguridad
- **JWT Authentication** con refresh tokens
- **Sistema de roles** granular (Administrador, Supervisor, Operador, Consultor)
- **Rate limiting** por IP y endpoint
- **Headers de seguridad** configurados
- **Validación robusta** de datos

### 👥 Gestión de Usuarios
- **CRUD completo** de usuarios
- **Búsqueda avanzada** con filtros múltiples
- **Paginación optimizada** (tradicional y por cursor)
- **Estadísticas en tiempo real**
- **Exportación de datos**

### 🚀 Optimizaciones de Rendimiento
- **Caché distribuido** multi-nivel (Memory + Redis)
- **Lazy loading** con chunks inteligentes
- **Preloading estratégico** basado en navegación
- **Compresión** Brotli/Gzip automática
- **Connection pooling** optimizado
- **Índices de base de datos** especializados

### 📊 Monitoreo y Observabilidad
- **Prometheus + Grafana** para métricas
- **Application Insights** para telemetría
- **Serilog** para logging estructurado
- **Health checks** automáticos
- **MiniProfiler** para desarrollo
- **Alertas automáticas** por umbrales

### 🔄 Escalabilidad
- **Load balancing** con Nginx
- **Sharding de base de datos** preparado
- **Microservicios** ready
- **Docker + Kubernetes** compatible
- **Auto-scaling** configurado

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Load Balancer │    │   Backend API   │
│   Angular 17    │◄──►│   Nginx         │◄──►│   .NET Core 8   │
│   Lazy Loading  │    │   Rate Limiting │    │   JWT + Cache   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   Monitoring    │              │
         └──────────────►│ Prometheus +    │◄─────────────┘
                        │ Grafana         │
                        └─────────────────┘
                                 │
         ┌─────────────────┬─────────────────┬─────────────────┐
         │                 │                 │                 │
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   Database      │ │   Cache         │ │   Logs          │ │   Metrics       │
│   SQL Server    │ │   Redis         │ │   Serilog       │ │   App Insights  │
│   Optimized     │ │   Distributed   │ │   Structured    │ │   Real-time     │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

## 🛠️ Tecnologías

### Backend
- **.NET Core 8** - Framework principal
- **Entity Framework Core** - ORM con optimizaciones
- **SQL Server** - Base de datos principal
- **Redis** - Caché distribuido
- **JWT** - Autenticación
- **Serilog** - Logging estructurado
- **MiniProfiler** - Profiling de rendimiento

### Frontend
- **Angular 17** - Framework SPA
- **Angular Material** - UI Components
- **RxJS** - Programación reactiva
- **TypeScript** - Lenguaje tipado
- **Webpack** - Bundling optimizado
- **Service Worker** - Caché offline

### DevOps & Monitoring
- **Docker** - Containerización
- **Nginx** - Load balancer y proxy
- **Prometheus** - Métricas
- **Grafana** - Dashboards
- **Application Insights** - APM
- **GitHub Actions** - CI/CD (próximamente)

## 🚀 Inicio Rápido

### Prerrequisitos
- **Docker Desktop** instalado y ejecutándose
- **Node.js 18+** para desarrollo del frontend
- **Git** para clonar el repositorio

### 1. Clonar el Repositorio
```bash
git clone https://github.com/emiliolp1818/flexoAPP.git
cd flexoAPP
```

### 2. Inicio con Optimizaciones Completas
```bash
# Iniciar todos los servicios optimizados
start-optimized.bat

# O manualmente con Docker Compose
docker-compose up -d
```

### 3. Acceder a los Servicios
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:5000
- **Grafana**: http://localhost:3000 (admin/admin123)
- **Prometheus**: http://localhost:9090
- **Health Checks**: http://localhost:5000/health-ui

## 📊 Métricas de Rendimiento

### Objetivos Alcanzados
- **Tiempo de respuesta**: < 200ms (P95)
- **Throughput**: 500-1000 req/s
- **Cache hit rate**: 80-95%
- **Tiempo de carga inicial**: < 2s
- **Bundle size**: < 500KB (gzip)

### Optimizaciones Implementadas
- ✅ **6 índices especializados** en base de datos
- ✅ **Connection pooling** de 128 conexiones
- ✅ **Caché L1 + L2** (Memory + Redis)
- ✅ **Lazy loading** con chunks de 250KB máx
- ✅ **Preloading inteligente** basado en navegación
- ✅ **Compresión automática** de respuestas
- ✅ **Rate limiting** configurado
- ✅ **Health checks** automáticos

## 🔧 Desarrollo

### Estructura del Proyecto
```
flexoAPP/
├── backend/                 # API .NET Core
│   ├── Configuration/       # Configuraciones de escalabilidad
│   ├── Controllers/         # Controladores API
│   ├── Services/           # Lógica de negocio
│   ├── Data/               # Entity Framework
│   └── Scripts/            # Scripts de optimización DB
├── frontend/               # Aplicación Angular
│   ├── src/app/
│   │   ├── components/     # Componentes UI
│   │   ├── services/       # Servicios Angular
│   │   ├── modules/        # Módulos lazy
│   │   └── strategies/     # Estrategias de preloading
│   └── scripts/            # Scripts de análisis
├── monitoring/             # Configuración de monitoreo
│   ├── prometheus.yml      # Métricas
│   ├── alert_rules.yml     # Alertas
│   └── grafana/           # Dashboards
├── nginx/                  # Load balancer
└── docker-compose.yml      # Orquestación de servicios
```

### Scripts Disponibles

#### Backend
```bash
# Desarrollo
dotnet run --project backend

# Optimización de BD
docker exec flexoapp-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P FlexoApp2024! -i /scripts/OptimizeDatabase.sql
```

#### Frontend
```bash
cd frontend

# Desarrollo con lazy loading
npm start

# Análisis de chunks
npm run analyze

# Reporte de rendimiento
npm run chunk-report

# Test de performance
npm run performance-test
```

### Configuración de Desarrollo

#### Variables de Entorno
```bash
# Backend
ASPNETCORE_ENVIRONMENT=Development
ConnectionStrings__FlexoBD=Server=localhost;Database=flexoBD;...
ConnectionStrings__Redis=localhost:6379
JWT_SECRET_KEY=your-secret-key

# Frontend
NODE_ENV=development
API_URL=http://localhost:5000
```

## 📈 Monitoreo

### Dashboards Disponibles
- **Sistema**: CPU, memoria, disco, red
- **Aplicación**: Requests, errores, latencia
- **Base de datos**: Consultas, conexiones, locks
- **Caché**: Hit rate, memoria, operaciones
- **Negocio**: Usuarios activos, logins, acciones

### Alertas Configuradas
- **Servicio caído** (>1min)
- **Alto tiempo de respuesta** (>2s)
- **Alta tasa de errores** (>5%)
- **Uso alto de memoria** (>1GB)
- **Baja tasa de caché** (<70%)

## 🔒 Seguridad

### Medidas Implementadas
- **JWT con expiración** configurable
- **Rate limiting** por IP (100 req/min)
- **Headers de seguridad** (HSTS, CSP, etc.)
- **Validación de entrada** robusta
- **Logging de seguridad** completo
- **Secrets management** con variables de entorno

## 🚀 Despliegue

### Desarrollo
```bash
# Inicio completo con optimizaciones
start-optimized.bat
```

### Producción
```bash
# Docker Compose
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Kubernetes (próximamente)
kubectl apply -f k8s/
```

## 📊 Análisis de Rendimiento

### Herramientas Incluidas
- **Webpack Bundle Analyzer** - Análisis de chunks
- **Lighthouse** - Métricas web vitals
- **MiniProfiler** - Profiling de consultas
- **Application Insights** - APM completo
- **Custom metrics** - Métricas de negocio

### Comandos de Análisis
```bash
# Análisis de frontend
npm run analyze
npm run chunk-report
npm run performance-test

# Métricas en tiempo real
curl http://localhost:5000/metrics
```

## 🤝 Contribución

### Proceso de Desarrollo
1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### Estándares de Código
- **Backend**: Seguir convenciones de C#/.NET
- **Frontend**: Seguir Angular Style Guide
- **Commits**: Conventional Commits
- **Testing**: Cobertura mínima 80%

## 📝 Roadmap

### v1.1 (Próximo)
- [ ] Autenticación con OAuth2/OpenID
- [ ] API GraphQL
- [ ] Notificaciones en tiempo real
- [ ] Audit trail completo

### v1.2 (Futuro)
- [ ] Microservicios
- [ ] Event sourcing
- [ ] Machine learning para predicciones
- [ ] Mobile app (Ionic)

### v2.0 (Visión)
- [ ] Multi-tenancy
- [ ] Blockchain integration
- [ ] AI-powered analytics
- [ ] Global CDN

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Emilio López**
- GitHub: [@emiliolp1818](https://github.com/emiliolp1818)
- Email: emilio.lopez@flexoapp.com

## 🙏 Agradecimientos

- Comunidad de .NET Core
- Equipo de Angular
- Contribuidores de open source
- Beta testers y early adopters

---

## 📞 Soporte

Para soporte técnico o preguntas:
- **Issues**: [GitHub Issues](https://github.com/emiliolp1818/flexoAPP/issues)
- **Documentación**: [Wiki del proyecto](https://github.com/emiliolp1818/flexoAPP/wiki)
- **Email**: support@flexoapp.com

---

**¡FlexoAPP - Escalable, Rápido, Confiable! 🚀**