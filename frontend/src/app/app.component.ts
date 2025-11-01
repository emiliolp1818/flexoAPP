import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { filter } from 'rxjs/operators';

import { ChunkLoaderComponent } from './components/chunk-loader/chunk-loader.component';
import { ChunkManagerService } from './services/chunk-manager.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatProgressBarModule,
    ChunkLoaderComponent
  ],
  template: `
    <div class="app-container">
      <!-- Chunk Loader -->
      <app-chunk-loader 
        [showLoader]="showChunkLoader"
        [showTips]="true">
      </app-chunk-loader>

      <!-- Main App Layout -->
      <mat-toolbar color="primary" class="app-toolbar">
        <button mat-icon-button (click)="toggleSidenav()" *ngIf="isAuthenticated">
          <mat-icon>menu</mat-icon>
        </button>
        
        <span class="app-title">FlexoAuth</span>
        
        <span class="spacer"></span>
        
        <!-- Performance Indicator -->
        <div class="performance-indicator" *ngIf="showPerformanceInfo">
          <mat-icon class="perf-icon">speed</mat-icon>
          <span class="perf-text">{{ loadedChunks }}/{{ totalChunks }} módulos</span>
        </div>
        
        <button mat-icon-button *ngIf="isAuthenticated" (click)="logout()">
          <mat-icon>logout</mat-icon>
        </button>
      </mat-toolbar>

      <mat-sidenav-container class="sidenav-container" *ngIf="isAuthenticated">
        <mat-sidenav #sidenav mode="side" opened class="sidenav">
          <mat-nav-list>
            <a mat-list-item routerLink="/dashboard" (click)="preloadForRoute('/dashboard')">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>Dashboard</span>
            </a>
            
            <a mat-list-item routerLink="/usuarios" (click)="preloadForRoute('/usuarios')">
              <mat-icon matListItemIcon>people</mat-icon>
              <span matListItemTitle>Usuarios</span>
              <span matListItemLine class="chunk-status" *ngIf="getChunkStatus('usuarios')">
                {{ getChunkStatus('usuarios') }}
              </span>
            </a>
            
            <a mat-list-item routerLink="/reportes" (click)="preloadForRoute('/reportes')">
              <mat-icon matListItemIcon>assessment</mat-icon>
              <span matListItemTitle>Reportes</span>
              <span matListItemLine class="chunk-status" *ngIf="getChunkStatus('reportes')">
                {{ getChunkStatus('reportes') }}
              </span>
            </a>
            
            <a mat-list-item routerLink="/configuracion" (click)="preloadForRoute('/configuracion')">
              <mat-icon matListItemIcon>settings</mat-icon>
              <span matListItemTitle>Configuración</span>
            </a>
            
            <a mat-list-item routerLink="/perfil" (click)="preloadForRoute('/perfil')">
              <mat-icon matListItemIcon>account_circle</mat-icon>
              <span matListItemTitle>Mi Perfil</span>
            </a>
          </mat-nav-list>
          
          <!-- Performance Stats (Development) -->
          <div class="performance-stats" *ngIf="isDevelopment">
            <mat-divider></mat-divider>
            <div class="stats-content">
              <h4>Performance Stats</h4>
              <p>Chunks cargados: {{ loadedChunks }}/{{ totalChunks }}</p>
              <p>Tiempo promedio: {{ averageLoadTime | number:'1.0-2' }}ms</p>
              <p>Tiempo total: {{ totalLoadTime | number:'1.0-2' }}ms</p>
              <button mat-stroked-button (click)="clearChunkCache()" size="small">
                Limpiar Cache
              </button>
            </div>
          </div>
        </mat-sidenav>

        <mat-sidenav-content class="main-content">
          <!-- Loading bar para navegación -->
          <mat-progress-bar 
            mode="indeterminate" 
            *ngIf="isNavigating"
            class="navigation-progress">
          </mat-progress-bar>
          
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>

      <!-- Content for non-authenticated users -->
      <div class="auth-content" *ngIf="!isAuthenticated">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .app-title {
      font-weight: 600;
      font-size: 1.2em;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .performance-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-right: 16px;
      padding: 4px 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      font-size: 0.85em;
    }

    .perf-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .sidenav-container {
      flex: 1;
    }

    .sidenav {
      width: 250px;
      border-right: 1px solid #e0e0e0;
    }

    .main-content {
      padding: 0;
      position: relative;
    }

    .auth-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .navigation-progress {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }

    .chunk-status {
      font-size: 0.7em;
      color: #666;
      font-style: italic;
    }

    .performance-stats {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 16px;
      background: #f5f5f5;
      border-top: 1px solid #e0e0e0;
    }

    .stats-content h4 {
      margin: 0 0 8px 0;
      font-size: 0.9em;
      color: #333;
    }

    .stats-content p {
      margin: 4px 0;
      font-size: 0.8em;
      color: #666;
    }

    .stats-content button {
      margin-top: 8px;
      font-size: 0.7em;
    }

    @media (max-width: 768px) {
      .sidenav {
        width: 200px;
      }
      
      .performance-indicator {
        display: none;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'FlexoAuth';
  showChunkLoader = false;
  isNavigating = false;
  isAuthenticated = false;
  showPerformanceInfo = false;
  isDevelopment = false;

  // Performance stats
  loadedChunks = 0;
  totalChunks = 0;
  averageLoadTime = 0;
  totalLoadTime = 0;

  constructor(
    private router: Router,
    private chunkManager: ChunkManagerService,
    private authService: AuthService
  ) {
    this.isDevelopment = !environment.production;
    this.showPerformanceInfo = this.isDevelopment;
  }

  ngOnInit(): void {
    this.initializeApp();
    this.setupRouterEvents();
    this.setupChunkManager();
    this.checkAuthentication();
  }

  private async initializeApp(): Promise<void> {
    this.showChunkLoader = true;

    try {
      // Precargar chunks críticos
      await this.chunkManager.preloadCriticalChunks();
      
      // Precargar chunks en idle time
      this.chunkManager.preloadIdleChunks();
      
      // Precargar basado en el usuario autenticado
      const user = this.authService.getCurrentUser();
      if (user) {
        this.chunkManager.predictivePreload(user.rol);
      }
      
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      // El loader se ocultará automáticamente cuando se complete la carga
    }
  }

  private setupRouterEvents(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isNavigating = false;
        
        // Precargar chunks para la ruta actual
        this.chunkManager.preloadForCurrentRoute();
        
        // Actualizar estadísticas
        this.updatePerformanceStats();
      });

    // Mostrar loading durante navegación
    this.router.events.subscribe(event => {
      if (event.constructor.name === 'NavigationStart') {
        this.isNavigating = true;
      }
    });
  }

  private setupChunkManager(): void {
    // Suscribirse al progreso de carga
    this.chunkManager.getLoadingProgress().subscribe(progress => {
      if (progress.percentage > 0 && progress.percentage < 100) {
        this.showChunkLoader = true;
      }
    });

    // Actualizar estadísticas periódicamente
    setInterval(() => {
      this.updatePerformanceStats();
    }, 5000);
  }

  private checkAuthentication(): void {
    this.authService.isAuthenticated().subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });
  }

  private updatePerformanceStats(): void {
    const stats = this.chunkManager.getPerformanceStats();
    this.loadedChunks = stats.loadedChunks;
    this.totalChunks = stats.totalChunks;
    this.averageLoadTime = stats.averageLoadTime;
    this.totalLoadTime = stats.totalLoadTime;
  }

  toggleSidenav(): void {
    // Implementar toggle del sidenav
  }

  preloadForRoute(route: string): void {
    // Precargar chunks específicos basados en la ruta
    if (route.includes('/usuarios')) {
      this.chunkManager.preloadChunks(['usuarios-list', 'usuarios-form']);
    } else if (route.includes('/reportes')) {
      this.chunkManager.preloadChunk('reportes');
    }
  }

  getChunkStatus(chunkName: string): string | null {
    const chunk = this.chunkManager.getChunkInfo(chunkName);
    if (!chunk) return null;

    if (chunk.loading) return 'Cargando...';
    if (chunk.loaded) return 'Listo';
    if (chunk.error) return 'Error';
    
    return null;
  }

  clearChunkCache(): void {
    this.chunkManager.clearChunkCache();
    this.updatePerformanceStats();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}

// Environment import (necesario para el check de desarrollo)
declare const environment: any;