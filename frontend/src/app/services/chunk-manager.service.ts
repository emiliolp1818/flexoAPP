import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { CustomPreloadingStrategy } from '../strategies/custom-preloading.strategy';

export interface ChunkInfo {
  name: string;
  size?: number;
  loaded: boolean;
  loading: boolean;
  error?: string;
  loadTime?: number;
}

export interface LoadingProgress {
  current: number;
  total: number;
  percentage: number;
  currentChunk?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChunkManagerService {
  private chunks = new Map<string, ChunkInfo>();
  private loadingProgress$ = new BehaviorSubject<LoadingProgress>({ current: 0, total: 0, percentage: 0 });
  
  constructor(
    private router: Router,
    private preloadingStrategy: CustomPreloadingStrategy
  ) {
    this.initializeChunks();
  }

  private initializeChunks(): void {
    // Definir chunks conocidos
    const knownChunks = [
      'auth',
      'dashboard', 
      'usuarios',
      'usuarios-list',
      'usuarios-form',
      'usuarios-detail',
      'usuarios-stats',
      'reportes',
      'configuracion',
      'perfil',
      'error'
    ];

    knownChunks.forEach(chunkName => {
      this.chunks.set(chunkName, {
        name: chunkName,
        loaded: false,
        loading: false
      });
    });
  }

  /**
   * Precargar chunk específico con progreso
   */
  async preloadChunk(chunkName: string): Promise<void> {
    const chunk = this.chunks.get(chunkName);
    if (!chunk || chunk.loaded || chunk.loading) {
      return;
    }

    chunk.loading = true;
    this.updateLoadingProgress();

    const startTime = performance.now();

    try {
      await this.loadChunkByName(chunkName);
      
      chunk.loaded = true;
      chunk.loading = false;
      chunk.loadTime = performance.now() - startTime;
      
      console.log(`✅ Chunk '${chunkName}' loaded in ${chunk.loadTime.toFixed(2)}ms`);
    } catch (error) {
      chunk.loading = false;
      chunk.error = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`❌ Failed to load chunk '${chunkName}':`, error);
    }

    this.updateLoadingProgress();
  }

  /**
   * Precargar múltiples chunks en paralelo
   */
  async preloadChunks(chunkNames: string[]): Promise<void> {
    const promises = chunkNames.map(name => this.preloadChunk(name));
    await Promise.allSettled(promises);
  }

  /**
   * Precargar chunks críticos al inicio
   */
  async preloadCriticalChunks(): Promise<void> {
    const criticalChunks = ['auth', 'dashboard'];
    await this.preloadChunks(criticalChunks);
  }

  /**
   * Precargar chunks en idle time
   */
  preloadIdleChunks(): void {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.preloadChunks(['usuarios', 'usuarios-list']);
      });
    } else {
      // Fallback para navegadores sin requestIdleCallback
      setTimeout(() => {
        this.preloadChunks(['usuarios', 'usuarios-list']);
      }, 2000);
    }
  }

  /**
   * Cargar chunk por nombre
   */
  private async loadChunkByName(chunkName: string): Promise<any> {
    switch (chunkName) {
      case 'auth':
        return import('../modules/auth/auth.module');
      
      case 'dashboard':
        return import('../components/dashboard/dashboard.component');
      
      case 'usuarios':
        return import('../modules/usuarios/usuarios.module');
      
      case 'usuarios-list':
        return import('../components/usuario-list/usuario-list.component');
      
      case 'usuarios-form':
        return import('../components/usuario-form/usuario-form.component');
      
      case 'usuarios-detail':
        return import('../components/usuario-detail/usuario-detail.component');
      
      case 'usuarios-stats':
        return import('../components/usuario-stats/usuario-stats.component');
      
      case 'reportes':
        return import('../modules/reportes/reportes.module');
      
      case 'configuracion':
        return import('../modules/configuracion/configuracion.module');
      
      case 'perfil':
        return import('../components/user-profile/user-profile.component');
      
      case 'error':
        return import('../modules/error/error.module');
      
      default:
        throw new Error(`Unknown chunk: ${chunkName}`);
    }
  }

  /**
   * Obtener información de chunks
   */
  getChunkInfo(chunkName: string): ChunkInfo | undefined {
    return this.chunks.get(chunkName);
  }

  /**
   * Obtener todos los chunks
   */
  getAllChunks(): ChunkInfo[] {
    return Array.from(this.chunks.values());
  }

  /**
   * Obtener chunks cargados
   */
  getLoadedChunks(): ChunkInfo[] {
    return this.getAllChunks().filter(chunk => chunk.loaded);
  }

  /**
   * Obtener progreso de carga
   */
  getLoadingProgress(): Observable<LoadingProgress> {
    return this.loadingProgress$.asObservable();
  }

  /**
   * Actualizar progreso de carga
   */
  private updateLoadingProgress(): void {
    const allChunks = this.getAllChunks();
    const loadedChunks = allChunks.filter(chunk => chunk.loaded);
    const loadingChunk = allChunks.find(chunk => chunk.loading);

    const progress: LoadingProgress = {
      current: loadedChunks.length,
      total: allChunks.length,
      percentage: (loadedChunks.length / allChunks.length) * 100,
      currentChunk: loadingChunk?.name
    };

    this.loadingProgress$.next(progress);
  }

  /**
   * Limpiar caché de chunks (para desarrollo)
   */
  clearChunkCache(): void {
    this.chunks.forEach(chunk => {
      chunk.loaded = false;
      chunk.loading = false;
      chunk.error = undefined;
      chunk.loadTime = undefined;
    });
    this.updateLoadingProgress();
  }

  /**
   * Obtener estadísticas de rendimiento
   */
  getPerformanceStats(): {
    totalChunks: number;
    loadedChunks: number;
    averageLoadTime: number;
    totalLoadTime: number;
  } {
    const loadedChunks = this.getLoadedChunks();
    const loadTimes = loadedChunks
      .map(chunk => chunk.loadTime || 0)
      .filter(time => time > 0);

    return {
      totalChunks: this.chunks.size,
      loadedChunks: loadedChunks.length,
      averageLoadTime: loadTimes.length > 0 ? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length : 0,
      totalLoadTime: loadTimes.reduce((a, b) => a + b, 0)
    };
  }

  /**
   * Precargar chunks basado en la ruta actual
   */
  preloadForCurrentRoute(): void {
    const currentUrl = this.router.url;
    
    if (currentUrl.includes('/usuarios')) {
      this.preloadChunks(['usuarios-form', 'usuarios-detail', 'usuarios-stats']);
    } else if (currentUrl.includes('/dashboard')) {
      this.preloadChunks(['usuarios', 'reportes']);
    }
  }

  /**
   * Precargar chunks basado en predicción de navegación
   */
  predictivePreload(userRole: string): void {
    const preloadMap: { [key: string]: string[] } = {
      'Administrador': ['usuarios', 'reportes', 'configuracion'],
      'Supervisor': ['usuarios', 'reportes'],
      'Operador': ['usuarios'],
      'Consultor': ['reportes']
    };

    const chunksToPreload = preloadMap[userRole] || [];
    this.preloadChunks(chunksToPreload);
  }
}