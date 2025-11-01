import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CustomPreloadingStrategy implements PreloadingStrategy {
  private preloadedModules: Set<string> = new Set();
  private networkSpeed: 'slow' | 'fast' = 'fast';
  
  constructor() {
    this.detectNetworkSpeed();
  }

  preload(route: Route, load: () => Observable<any>): Observable<any> {
    const routeData = route.data || {};
    const chunkName = routeData['chunkName'] || 'unknown';
    
    // Si ya se precargó, no volver a hacerlo
    if (this.preloadedModules.has(chunkName)) {
      return of(null);
    }

    // Estrategias de preloading basadas en prioridad
    if (this.shouldPreload(routeData)) {
      console.log(`🚀 Preloading chunk: ${chunkName}`);
      
      const delay = this.getPreloadDelay(routeData);
      
      return timer(delay).pipe(
        mergeMap(() => {
          this.preloadedModules.add(chunkName);
          return load();
        })
      );
    }

    return of(null);
  }

  private shouldPreload(routeData: any): boolean {
    // Siempre precargar rutas marcadas como críticas
    if (routeData['preload'] === true) {
      return true;
    }

    // No precargar en conexiones lentas para chunks no críticos
    if (this.networkSpeed === 'slow' && !routeData['critical']) {
      return false;
    }

    // Precargar basado en el tipo de chunk
    const chunkName = routeData['chunkName'];
    
    switch (chunkName) {
      case 'auth':
      case 'dashboard':
        return true; // Siempre precargar chunks críticos
      
      case 'usuarios':
        return this.networkSpeed === 'fast'; // Solo en conexiones rápidas
      
      case 'reportes':
      case 'configuracion':
        return false; // Cargar bajo demanda
      
      default:
        return false;
    }
  }

  private getPreloadDelay(routeData: any): number {
    const chunkName = routeData['chunkName'];
    
    // Delays escalonados para evitar saturar la red
    switch (chunkName) {
      case 'auth':
        return 0; // Inmediato
      case 'dashboard':
        return 100; // 100ms
      case 'usuarios':
        return 500; // 500ms
      default:
        return 1000; // 1s
    }
  }

  private detectNetworkSpeed(): void {
    // Detectar velocidad de red usando Navigator API
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      if (connection) {
        const effectiveType = connection.effectiveType;
        
        // Considerar 4g y superior como rápido
        this.networkSpeed = ['4g', '5g'].includes(effectiveType) ? 'fast' : 'slow';
        
        console.log(`📡 Network speed detected: ${this.networkSpeed} (${effectiveType})`);
      }
    }

    // Fallback: detectar basado en tiempo de carga inicial
    const loadTime = performance.now();
    if (loadTime > 3000) {
      this.networkSpeed = 'slow';
    }
  }

  // Método público para precargar chunks específicos
  public preloadChunk(chunkName: string): Promise<any> {
    if (this.preloadedModules.has(chunkName)) {
      return Promise.resolve();
    }

    switch (chunkName) {
      case 'usuarios':
        return import('../modules/usuarios/usuarios.module').then(m => {
          this.preloadedModules.add(chunkName);
          return m.UsuariosModule;
        });
      
      case 'reportes':
        return import('../modules/reportes/reportes.module').then(m => {
          this.preloadedModules.add(chunkName);
          return m.ReportesModule;
        });
      
      default:
        return Promise.resolve();
    }
  }

  // Obtener estadísticas de preloading
  public getPreloadStats(): { loaded: string[], total: number } {
    return {
      loaded: Array.from(this.preloadedModules),
      total: this.preloadedModules.size
    };
  }
}