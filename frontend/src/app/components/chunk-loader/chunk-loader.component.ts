import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';
import { ChunkManagerService, LoadingProgress } from '../../services/chunk-manager.service';

@Component({
  selector: 'app-chunk-loader',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule
  ],
  template: `
    <div class="chunk-loader" *ngIf="showLoader">
      <mat-card class="loading-card">
        <mat-card-content>
          <div class="loading-header">
            <mat-icon>cloud_download</mat-icon>
            <h3>Cargando módulos...</h3>
          </div>
          
          <div class="progress-container">
            <mat-progress-bar 
              mode="determinate" 
              [value]="progress.percentage"
              color="primary">
            </mat-progress-bar>
            
            <div class="progress-text">
              <span>{{ progress.current }} de {{ progress.total }} módulos</span>
              <span class="percentage">{{ progress.percentage | number:'1.0-0' }}%</span>
            </div>
          </div>
          
          <div class="current-chunk" *ngIf="progress.currentChunk">
            <mat-spinner diameter="20"></mat-spinner>
            <span>Cargando {{ getChunkDisplayName(progress.currentChunk) }}...</span>
          </div>
          
          <div class="loading-tips" *ngIf="showTips">
            <p class="tip">💡 {{ getCurrentTip() }}</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .chunk-loader {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(4px);
    }

    .loading-card {
      min-width: 400px;
      max-width: 500px;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .loading-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }

    .loading-header mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #1976d2;
    }

    .loading-header h3 {
      margin: 0;
      font-weight: 500;
      color: #333;
    }

    .progress-container {
      margin-bottom: 20px;
    }

    .progress-text {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      font-size: 14px;
      color: #666;
    }

    .percentage {
      font-weight: 600;
      color: #1976d2;
    }

    .current-chunk {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;
      font-size: 14px;
      color: #555;
    }

    .loading-tips {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }

    .tip {
      margin: 0;
      font-size: 13px;
      color: #666;
      font-style: italic;
    }

    @media (max-width: 480px) {
      .loading-card {
        min-width: 300px;
        margin: 20px;
      }
    }
  `]
})
export class ChunkLoaderComponent implements OnInit, OnDestroy {
  @Input() showLoader = false;
  @Input() showTips = true;
  @Input() minDisplayTime = 500; // Tiempo mínimo de visualización

  progress: LoadingProgress = { current: 0, total: 0, percentage: 0 };
  private destroy$ = new Subject<void>();
  private startTime = 0;

  private tips = [
    'Los módulos se cargan de forma inteligente según tu rol y navegación',
    'La aplicación optimiza automáticamente la carga basada en tu conexión',
    'Los módulos más usados se precargan para una experiencia más fluida',
    'El sistema de chunks reduce el tiempo de carga inicial significativamente',
    'Los datos se cachean para mejorar el rendimiento en navegaciones futuras'
  ];

  private currentTipIndex = 0;

  constructor(private chunkManager: ChunkManagerService) {}

  ngOnInit(): void {
    this.startTime = Date.now();
    
    this.chunkManager.getLoadingProgress()
      .pipe(takeUntil(this.destroy$))
      .subscribe(progress => {
        this.progress = progress;
        
        // Ocultar loader cuando se complete la carga y haya pasado el tiempo mínimo
        if (progress.percentage >= 100) {
          const elapsedTime = Date.now() - this.startTime;
          const remainingTime = Math.max(0, this.minDisplayTime - elapsedTime);
          
          setTimeout(() => {
            this.showLoader = false;
          }, remainingTime);
        }
      });

    // Rotar tips cada 3 segundos
    if (this.showTips) {
      setInterval(() => {
        this.currentTipIndex = (this.currentTipIndex + 1) % this.tips.length;
      }, 3000);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getChunkDisplayName(chunkName: string): string {
    const displayNames: { [key: string]: string } = {
      'auth': 'Autenticación',
      'dashboard': 'Panel Principal',
      'usuarios': 'Gestión de Usuarios',
      'usuarios-list': 'Lista de Usuarios',
      'usuarios-form': 'Formulario de Usuario',
      'usuarios-detail': 'Detalle de Usuario',
      'usuarios-stats': 'Estadísticas de Usuarios',
      'reportes': 'Reportes',
      'configuracion': 'Configuración',
      'perfil': 'Perfil de Usuario',
      'error': 'Páginas de Error'
    };

    return displayNames[chunkName] || chunkName;
  }

  getCurrentTip(): string {
    return this.tips[this.currentTipIndex];
  }
}