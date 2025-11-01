import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withPreloading } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { CustomPreloadingStrategy } from './app/strategies/custom-preloading.strategy';
import { authInterceptor } from './app/interceptors/auth.interceptor';
import { cacheInterceptor } from './app/interceptors/cache.interceptor';
import { loadingInterceptor } from './app/interceptors/loading.interceptor';

// Configuración de performance monitoring
const performanceConfig = {
  // Habilitar métricas de rendimiento
  enablePerformanceMetrics: true,
  
  // Configurar Web Vitals
  enableWebVitals: true,
  
  // Configurar Resource Timing
  enableResourceTiming: true
};

// Inicializar métricas de rendimiento
if (performanceConfig.enablePerformanceMetrics) {
  // Marcar inicio de la aplicación
  performance.mark('app-start');
  
  // Configurar observer para Web Vitals
  if (performanceConfig.enableWebVitals && 'PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log(`📊 ${entry.name}: ${entry.value}ms`);
      }
    });
    
    try {
      observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
    } catch (e) {
      // Fallback para navegadores que no soportan todas las métricas
      console.log('Performance Observer not fully supported');
    }
  }
}

// Función para medir tiempo de carga de chunks
function measureChunkLoad(chunkName: string, loadPromise: Promise<any>): Promise<any> {
  const startMark = `chunk-${chunkName}-start`;
  const endMark = `chunk-${chunkName}-end`;
  const measureName = `chunk-${chunkName}-load`;
  
  performance.mark(startMark);
  
  return loadPromise.then(result => {
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);
    
    const measure = performance.getEntriesByName(measureName)[0];
    console.log(`🚀 Chunk '${chunkName}' loaded in ${measure.duration.toFixed(2)}ms`);
    
    return result;
  });
}

// Configurar interceptores HTTP con optimizaciones
const httpInterceptors = [
  authInterceptor,
  cacheInterceptor,
  loadingInterceptor
];

// Bootstrap de la aplicación con configuración optimizada
bootstrapApplication(AppComponent, {
  providers: [
    // Router con preloading personalizado
    provideRouter(
      routes, 
      withPreloading(CustomPreloadingStrategy)
    ),
    
    // HTTP Client con interceptores
    provideHttpClient(
      withInterceptors(httpInterceptors)
    ),
    
    // Animaciones
    provideAnimations(),
    
    // Material Date Module
    importProvidersFrom(MatNativeDateModule),
    
    // Estrategia de preloading personalizada
    CustomPreloadingStrategy,
    
    // Configuración adicional para chunks
    {
      provide: 'CHUNK_CONFIG',
      useValue: {
        enableLazyLoading: true,
        enablePreloading: true,
        enableCaching: true,
        chunkSizeThreshold: 250000, // 250KB
        preloadDelay: 100, // ms
        maxConcurrentLoads: 3
      }
    }
  ]
}).then(() => {
  // Marcar fin de bootstrap
  performance.mark('app-bootstrapped');
  performance.measure('app-bootstrap-time', 'app-start', 'app-bootstrapped');
  
  const bootstrapTime = performance.getEntriesByName('app-bootstrap-time')[0];
  console.log(`🎯 App bootstrapped in ${bootstrapTime.duration.toFixed(2)}ms`);
  
  // Configurar Service Worker para caché de chunks (si está disponible)
  if ('serviceWorker' in navigator && 'production' === 'production') {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('🔧 Service Worker registered:', registration);
      })
      .catch(error => {
        console.log('❌ Service Worker registration failed:', error);
      });
  }
  
  // Configurar reportes de rendimiento
  if (performanceConfig.enableWebVitals) {
    // Reportar Core Web Vitals
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    }).catch(() => {
      console.log('Web Vitals library not available');
    });
  }
  
}).catch(err => {
  console.error('❌ Error starting app:', err);
});

// Configurar manejo global de errores de chunks
window.addEventListener('error', (event) => {
  if (event.message.includes('Loading chunk')) {
    console.error('🔥 Chunk loading error:', event.error);
    
    // Intentar recargar el chunk después de un delay
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
});

// Configurar manejo de errores de módulos ES
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('Loading module')) {
    console.error('🔥 Module loading error:', event.reason);
    event.preventDefault();
    
    // Mostrar mensaje de error al usuario
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #f44336;
        color: white;
        padding: 20px;
        border-radius: 8px;
        z-index: 10000;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      ">
        <h3>Error de Carga</h3>
        <p>Hubo un problema cargando un módulo. La página se recargará automáticamente.</p>
        <button onclick="window.location.reload()" style="
          background: white;
          color: #f44336;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 10px;
        ">Recargar Ahora</button>
      </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto-reload después de 3 segundos
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }
});

// Exportar función para medición de chunks (para uso en desarrollo)
(window as any).measureChunkLoad = measureChunkLoad;