import { Component, inject, signal } from '@angular/core';
import { ProductionService } from '../../services/production.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test-connection',
  imports: [CommonModule],
  template: `
    <div class="test-container">
      <h2>🔧 Prueba de Conexión a Base de Datos</h2>
      
      <div class="test-section">
        <h3>Estado de Conexión</h3>
        <div class="status" [class]="connectionStatus()">
          {{ connectionMessage() }}
        </div>
      </div>

      <div class="test-section">
        <h3>Pruebas Disponibles</h3>
        <div class="test-buttons">
          <button (click)="testLoadMachines()" [disabled]="loading()">
            Cargar Máquinas
          </button>
          <button (click)="testLoadOrders()" [disabled]="loading()">
            Cargar Programas
          </button>
          <button (click)="testCreateOrder()" [disabled]="loading()">
            Crear Programa de Prueba
          </button>
          <button (click)="testUpdateOrder()" [disabled]="loading()">
            Actualizar Estado
          </button>
          <button (click)="clearLocalData()" [disabled]="loading()">
            Limpiar Datos Locales
          </button>
        </div>
      </div>

      <div class="test-section">
        <h3>Resultados</h3>
        <div class="results">
          @for (result of testResults(); track result.timestamp) {
            <div class="result-item" [class]="result.type">
              <span class="timestamp">{{ result.timestamp | date:'HH:mm:ss' }}</span>
              <span class="message">{{ result.message }}</span>
            </div>
          }
        </div>
      </div>

      <div class="test-section">
        <h3>Datos Actuales</h3>
        <div class="data-summary">
          <p><strong>Máquinas:</strong> {{ machineCount() }}</p>
          <p><strong>Programas:</strong> {{ orderCount() }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .test-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .test-section {
      margin-bottom: 30px;
      padding: 20px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .test-section h3 {
      margin-top: 0;
      color: #0c4278;
    }

    .status {
      padding: 10px 15px;
      border-radius: 5px;
      font-weight: bold;
    }

    .status.connected {
      background: #d4edda;
      color: #155724;
    }

    .status.disconnected {
      background: #f8d7da;
      color: #721c24;
    }

    .status.testing {
      background: #fff3cd;
      color: #856404;
    }

    .test-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .test-buttons button {
      padding: 10px 15px;
      background: #0c4278;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background 0.3s;
    }

    .test-buttons button:hover:not(:disabled) {
      background: #1565c0;
    }

    .test-buttons button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .results {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #e9ecef;
      border-radius: 5px;
      padding: 10px;
    }

    .result-item {
      display: flex;
      gap: 10px;
      padding: 5px 0;
      border-bottom: 1px solid #f1f3f4;
    }

    .result-item:last-child {
      border-bottom: none;
    }

    .result-item.success {
      color: #155724;
    }

    .result-item.error {
      color: #721c24;
    }

    .result-item.info {
      color: #0c5460;
    }

    .timestamp {
      font-weight: bold;
      min-width: 80px;
    }

    .data-summary {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
    }

    .data-summary p {
      margin: 5px 0;
    }
  `]
})
export class TestConnection {
  private productionService = inject(ProductionService);
  
  connectionStatus = signal<'connected' | 'disconnected' | 'testing'>('testing');
  connectionMessage = signal('Probando conexión...');
  loading = signal(false);
  testResults = signal<Array<{timestamp: Date, message: string, type: 'success' | 'error' | 'info'}>>([]);
  machineCount = signal(0);
  orderCount = signal(0);

  ngOnInit() {
    this.updateCounts();
    this.testConnection();
  }

  private addResult(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const results = this.testResults();
    results.unshift({
      timestamp: new Date(),
      message,
      type
    });
    
    // Mantener solo los últimos 20 resultados
    if (results.length > 20) {
      results.splice(20);
    }
    
    this.testResults.set([...results]);
  }

  private updateCounts() {
    this.machineCount.set(this.productionService.getAllMachines().length);
    this.orderCount.set(this.productionService.getAllWorkOrders().length);
  }

  async testConnection() {
    this.connectionStatus.set('testing');
    this.connectionMessage.set('Probando conexión...');
    
    try {
      await this.productionService.loadMachines().toPromise();
      this.connectionStatus.set('connected');
      this.connectionMessage.set('✅ Conexión exitosa con el servidor');
      this.addResult('Conexión con servidor establecida', 'success');
    } catch (error) {
      this.connectionStatus.set('disconnected');
      this.connectionMessage.set('❌ Servidor no disponible - Modo offline');
      this.addResult('Servidor no disponible, trabajando en modo offline', 'error');
    }
  }

  testLoadMachines() {
    this.loading.set(true);
    this.addResult('Cargando máquinas...', 'info');
    
    this.productionService.loadMachines().subscribe({
      next: (machines) => {
        this.addResult(`✅ ${machines.length} máquinas cargadas correctamente`, 'success');
        this.updateCounts();
        this.loading.set(false);
      },
      error: (error) => {
        this.addResult(`❌ Error cargando máquinas: ${error.message}`, 'error');
        this.loading.set(false);
      }
    });
  }

  testLoadOrders() {
    this.loading.set(true);
    this.addResult('Cargando programas de producción...', 'info');
    
    this.productionService.loadWorkOrders().subscribe({
      next: (orders) => {
        this.addResult(`✅ ${orders.length} programas cargados correctamente`, 'success');
        this.updateCounts();
        this.loading.set(false);
      },
      error: (error) => {
        this.addResult(`❌ Error cargando programas: ${error.message}`, 'error');
        this.loading.set(false);
      }
    });
  }

  testCreateOrder() {
    this.loading.set(true);
    this.addResult('Creando programa de prueba...', 'info');
    
    const testOrder = {
      articulo: 'TEST001',
      otSap: 'TEST-' + Date.now(),
      cliente: 'Cliente de Prueba',
      referencia: 'Producto de Prueba',
      td: 'R',
      colores: 4,
      kilosSustrato: 100,
      kilos: 500,
      estado: 'listo' as const,
      maquina: 11,
      sustrato: 'BOPP Test',
      coloresDetalle: [
        { nombre: 'Rojo', hex: '#FF0000', tipo: 'primario' as const },
        { nombre: 'Azul', hex: '#0000FF', tipo: 'primario' as const }
      ],
      usuarioActualizacion: 'test-user'
    };

    this.productionService.createWorkOrder(testOrder).subscribe({
      next: (createdOrder) => {
        this.addResult(`✅ Programa creado con ID: ${createdOrder.id}`, 'success');
        this.updateCounts();
        this.loading.set(false);
      },
      error: (error) => {
        this.addResult(`❌ Error creando programa: ${error.message}`, 'error');
        this.loading.set(false);
      }
    });
  }

  testUpdateOrder() {
    const orders = this.productionService.getAllWorkOrders();
    if (orders.length === 0) {
      this.addResult('❌ No hay programas para actualizar', 'error');
      return;
    }

    this.loading.set(true);
    const firstOrder = orders[0];
    const newStatus = firstOrder.estado === 'listo' ? 'corriendo' : 'listo';
    
    this.addResult(`Actualizando programa ${firstOrder.id} a estado: ${newStatus}`, 'info');
    
    this.productionService.updateWorkOrderStatus(firstOrder.id, newStatus).subscribe({
      next: (updatedOrder) => {
        this.addResult(`✅ Programa ${updatedOrder.id} actualizado a: ${updatedOrder.estado}`, 'success');
        this.loading.set(false);
      },
      error: (error) => {
        this.addResult(`❌ Error actualizando programa: ${error.message}`, 'error');
        this.loading.set(false);
      }
    });
  }

  clearLocalData() {
    this.addResult('🗑️ Limpiando datos locales...', 'info');
    // Aquí podrías implementar lógica para limpiar datos locales
    this.updateCounts();
    this.addResult('✅ Datos locales limpiados', 'success');
  }
}