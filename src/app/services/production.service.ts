import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface WorkOrder {
  id: number;
  articulo: string;
  otSap: string;
  cliente: string;
  referencia: string;
  td: string;
  colores: number;
  kilosSustrato: number;
  kilos: number;
  estado: 'listo' | 'suspendido' | 'corriendo' | 'terminado';
  motivoSuspension?: string;
  maquina: number;
  sustrato: string;
  coloresDetalle: { nombre: string; hex: string; tipo: 'primario' | 'pantone' }[];
  fechaCreacion: Date;
  fechaActualizacion: Date;
  usuarioActualizacion: string;
}

export interface Machine {
  numero: number;
  nombre: string;
  estado: 'activa' | 'mantenimiento' | 'parada';
  eficiencia: number;
  horasOperacion: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductionService {
  private apiUrl = 'http://localhost:5000/api'; // URL del backend C#
  
  // Signals para estado reactivo
  private _workOrders = signal<WorkOrder[]>([]);
  private _machines = signal<Machine[]>([]);
  
  // BehaviorSubjects para sincronización en tiempo real
  private workOrdersSubject = new BehaviorSubject<WorkOrder[]>([]);
  private machinesSubject = new BehaviorSubject<Machine[]>([]);
  
  public workOrders$ = this.workOrdersSubject.asObservable();
  public machines$ = this.machinesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeData();
    this.startRealTimeSync();
  }

  // Inicializar datos desde el servidor
  private initializeData() {
    this.loadWorkOrders();
    this.loadMachines();
  }

  // Cargar órdenes de trabajo desde el servidor
  loadWorkOrders(): Observable<WorkOrder[]> {
    return new Observable(observer => {
      console.log('🔄 Cargando programas desde:', `${this.apiUrl}/workorders`);
      
      this.http.get<WorkOrder[]>(`${this.apiUrl}/workorders`).subscribe({
        next: (orders) => {
          console.log('✅ Programas cargados desde servidor:', orders.length);
          this._workOrders.set(orders);
          this.workOrdersSubject.next(orders);
          observer.next(orders);
          observer.complete();
        },
        error: (error) => {
          console.warn('⚠️ Servidor no disponible, usando datos locales:', error.message);
          console.log('💡 Para conectar con el backend, ejecuta: start-backend.bat');
          // Fallback a datos locales si el servidor no está disponible
          const fallbackOrders = this.getFallbackWorkOrders();
          this._workOrders.set(fallbackOrders);
          this.workOrdersSubject.next(fallbackOrders);
          observer.next(fallbackOrders);
          observer.complete();
        }
      });
    });
  }

  // Cargar máquinas desde el servidor
  loadMachines(): Observable<Machine[]> {
    return new Observable(observer => {
      console.log('🔄 Cargando máquinas desde:', `${this.apiUrl}/machines`);
      
      this.http.get<Machine[]>(`${this.apiUrl}/machines`).subscribe({
        next: (machines) => {
          console.log('✅ Máquinas cargadas desde servidor:', machines.length);
          this._machines.set(machines);
          this.machinesSubject.next(machines);
          observer.next(machines);
          observer.complete();
        },
        error: (error) => {
          console.warn('⚠️ Servidor no disponible, usando datos locales:', error.message);
          // Fallback a datos locales si el servidor no está disponible
          const fallbackMachines = this.getFallbackMachines();
          this._machines.set(fallbackMachines);
          this.machinesSubject.next(fallbackMachines);
          observer.next(fallbackMachines);
          observer.complete();
        }
      });
    });
  }

  // Actualizar estado de orden de trabajo
  updateWorkOrderStatus(orderId: number, newStatus: WorkOrder['estado'], suspensionReason?: string): Observable<WorkOrder> {
    const updateData = {
      estado: newStatus,
      motivoSuspension: suspensionReason,
      usuarioActualizacion: 'current-user' // Obtener del servicio de auth
    };

    return new Observable(observer => {
      console.log('Actualizando orden:', orderId, 'a estado:', newStatus);
      
      this.http.put<WorkOrder>(`${this.apiUrl}/workorders/${orderId}`, updateData).subscribe({
        next: (updatedOrder) => {
          console.log('Orden actualizada en servidor:', updatedOrder);
          // Actualizar estado local
          const currentOrders = this._workOrders();
          const updatedOrders = currentOrders.map(order => 
            order.id === orderId ? updatedOrder : order
          );
          this._workOrders.set(updatedOrders);
          this.workOrdersSubject.next(updatedOrders);
          observer.next(updatedOrder);
          observer.complete();
        },
        error: (error) => {
          console.warn('Error en servidor, actualizando localmente:', error.message);
          // Actualizar localmente como fallback
          const updatedOrder = this.updateLocalWorkOrder(orderId, newStatus, suspensionReason);
          if (updatedOrder) {
            observer.next(updatedOrder);
            observer.complete();
          } else {
            observer.error(error);
          }
        }
      });
    });
  }

  // Crear nueva orden de trabajo
  createWorkOrder(workOrder: Omit<WorkOrder, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Observable<WorkOrder> {
    const newOrder = {
      ...workOrder,
      coloresDetalle: JSON.stringify(workOrder.coloresDetalle), // Convertir a JSON string para el servidor
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      usuarioActualizacion: workOrder.usuarioActualizacion || 'current-user'
    };

    return new Observable(observer => {
      console.log('Creando nueva orden:', newOrder);
      
      this.http.post<WorkOrder>(`${this.apiUrl}/workorders`, newOrder).subscribe({
        next: (createdOrder) => {
          console.log('Orden creada en servidor:', createdOrder);
          // Parsear coloresDetalle si viene como string
          if (typeof createdOrder.coloresDetalle === 'string') {
            createdOrder.coloresDetalle = JSON.parse(createdOrder.coloresDetalle);
          }
          
          const currentOrders = this._workOrders();
          const updatedOrders = [...currentOrders, createdOrder];
          this._workOrders.set(updatedOrders);
          this.workOrdersSubject.next(updatedOrders);
          observer.next(createdOrder);
          observer.complete();
        },
        error: (error) => {
          console.warn('Error en servidor, creando localmente:', error.message);
          // Crear localmente como fallback
          const localOrder = this.createLocalWorkOrder(workOrder);
          observer.next(localOrder);
          observer.complete();
        }
      });
    });
  }

  // Eliminar orden de trabajo
  deleteWorkOrder(orderId: number): Observable<boolean> {
    return new Observable(observer => {
      this.http.delete(`${this.apiUrl}/workorders/${orderId}`).subscribe({
        next: () => {
          const currentOrders = this._workOrders();
          const updatedOrders = currentOrders.filter(order => order.id !== orderId);
          this._workOrders.set(updatedOrders);
          this.workOrdersSubject.next(updatedOrders);
          observer.next(true);
          observer.complete();
        },
        error: (error) => {
          console.error('Error deleting work order:', error);
          observer.error(error);
        }
      });
    });
  }

  // Carga masiva de programas a múltiples máquinas
  bulkLoadPrograms(machineNumbers: number[], programsPerMachine: number = 10): Observable<WorkOrder[]> {
    const bulkData = {
      machineNumbers,
      programsPerMachine,
      baseProgram: {
        articulo: 'ART-BULK',
        cliente: 'Cliente Estándar',
        referencia: 'REF-BULK',
        td: 'TD-STD',
        colores: 4,
        kilosSustrato: 1000,
        kilos: 950,
        estado: 'listo' as const,
        sustrato: 'BOPP 20 micras',
        coloresDetalle: [
          { nombre: 'Cyan', hex: '#00FFFF', tipo: 'primario' as const },
          { nombre: 'Magenta', hex: '#FF00FF', tipo: 'primario' as const },
          { nombre: 'Yellow', hex: '#FFFF00', tipo: 'primario' as const },
          { nombre: 'Black', hex: '#000000', tipo: 'primario' as const }
        ]
      }
    };

    return new Observable(observer => {
      this.http.post<WorkOrder[]>(`${this.apiUrl}/workorders/bulk`, bulkData).subscribe({
        next: (createdOrders) => {
          const currentOrders = this._workOrders();
          const updatedOrders = [...currentOrders, ...createdOrders];
          this._workOrders.set(updatedOrders);
          this.workOrdersSubject.next(updatedOrders);
          observer.next(createdOrders);
          observer.complete();
        },
        error: (error) => {
          console.error('Error bulk loading programs:', error);
          // Fallback: crear programas localmente
          this.createProgramsLocally(machineNumbers, programsPerMachine).then(programs => {
            observer.next(programs);
            observer.complete();
          });
        }
      });
    });
  }

  // Método auxiliar para crear programas localmente como fallback
  private async createProgramsLocally(machineNumbers: number[], programsPerMachine: number): Promise<WorkOrder[]> {
    const createdPrograms: WorkOrder[] = [];
    
    for (const machineNumber of machineNumbers) {
      for (let i = 1; i <= programsPerMachine; i++) {
        const program: Omit<WorkOrder, 'id' | 'fechaCreacion' | 'fechaActualizacion'> = {
          articulo: `ART-BULK-M${machineNumber}-P${i}`,
          otSap: `OT-BULK-M${machineNumber}-${i.toString().padStart(2, '0')}`,
          cliente: 'Cliente Estándar',
          referencia: `REF-BULK-M${machineNumber}`,
          td: 'TD-STD',
          colores: 4,
          kilosSustrato: 1000,
          kilos: 950 + (i * 50),
          estado: 'listo',
          maquina: machineNumber,
          sustrato: 'BOPP 20 micras',
          coloresDetalle: [
            { nombre: 'Cyan', hex: '#00FFFF', tipo: 'primario' },
            { nombre: 'Magenta', hex: '#FF00FF', tipo: 'primario' },
            { nombre: 'Yellow', hex: '#FFFF00', tipo: 'primario' },
            { nombre: 'Black', hex: '#000000', tipo: 'primario' }
          ],
          usuarioActualizacion: 'sistema-carga'
        };

        try {
          const createdProgram = await new Promise<WorkOrder>((resolve, reject) => {
            this.createWorkOrder(program).subscribe({
              next: (result) => resolve(result),
              error: (error) => reject(error)
            });
          });
          createdPrograms.push(createdProgram);
        } catch (error) {
          console.error(`Error creating program ${i} for machine ${machineNumber}:`, error);
        }
      }
    }

    return createdPrograms;
  }

  // Obtener órdenes por máquina
  getWorkOrdersByMachine(machineNumber: number): WorkOrder[] {
    return this._workOrders().filter(order => order.maquina === machineNumber);
  }

  // Obtener todas las órdenes
  getAllWorkOrders(): WorkOrder[] {
    return this._workOrders();
  }

  // Obtener todas las máquinas
  getAllMachines(): Machine[] {
    return this._machines();
  }

  // Sincronización en tiempo real (WebSocket o polling)
  private startRealTimeSync() {
    // Polling cada 30 segundos para mantener datos actualizados
    setInterval(() => {
      this.loadWorkOrders();
      this.loadMachines();
    }, 30000);
  }

  // Actualización local como fallback
  private updateLocalWorkOrder(orderId: number, newStatus: WorkOrder['estado'], suspensionReason?: string): WorkOrder | null {
    const currentOrders = this._workOrders();
    const orderIndex = currentOrders.findIndex(order => order.id === orderId);
    
    if (orderIndex === -1) {
      console.error('Orden no encontrada:', orderId);
      return null;
    }
    
    const updatedOrder = {
      ...currentOrders[orderIndex],
      estado: newStatus,
      motivoSuspension: suspensionReason,
      fechaActualizacion: new Date()
    };
    
    const updatedOrders = [...currentOrders];
    updatedOrders[orderIndex] = updatedOrder;
    
    this._workOrders.set(updatedOrders);
    this.workOrdersSubject.next(updatedOrders);
    
    console.log('Orden actualizada localmente:', updatedOrder);
    return updatedOrder;
  }

  // Creación local como fallback
  private createLocalWorkOrder(workOrder: Omit<WorkOrder, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): WorkOrder {
    const currentOrders = this._workOrders();
    const newId = currentOrders.length > 0 ? Math.max(...currentOrders.map(o => o.id)) + 1 : 1;
    
    const newOrder: WorkOrder = {
      ...workOrder,
      id: newId,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      usuarioActualizacion: workOrder.usuarioActualizacion || 'current-user'
    };
    
    const updatedOrders = [...currentOrders, newOrder];
    this._workOrders.set(updatedOrders);
    this.workOrdersSubject.next(updatedOrders);
    
    console.log('Orden creada localmente:', newOrder);
    return newOrder;
  }

  // Datos de fallback cuando el servidor no está disponible
  private getFallbackWorkOrders(): WorkOrder[] {
    return [
      { 
        id: 1, 
        articulo: 'F203456', 
        otSap: '296571', 
        cliente: 'Productos Vicky', 
        referencia: 'Kythos Mixtos Natural', 
        td: 'R', 
        colores: 8, 
        kilosSustrato: 250,
        kilos: 1200,
        estado: 'listo', 
        maquina: 11,
        sustrato: 'BOPP Sell Transp',
        coloresDetalle: [
          { nombre: 'Amarillo', hex: '#FFFF00', tipo: 'primario' },
          { nombre: 'Blanco', hex: '#FFFFFF', tipo: 'primario' },
          { nombre: 'Cyan', hex: '#00FFFF', tipo: 'primario' },
          { nombre: 'Magenta', hex: '#FF00FF', tipo: 'primario' },
          { nombre: 'Negro', hex: '#000000', tipo: 'primario' },
          { nombre: 'Pantone V179', hex: '#E6194B', tipo: 'pantone' },
          { nombre: 'Pantone C299', hex: '#3CB44B', tipo: 'pantone' },
          { nombre: 'Crema', hex: '#FFFDD0', tipo: 'primario' }
        ],
        fechaCreacion: new Date('2024-01-01'),
        fechaActualizacion: new Date('2024-01-01'),
        usuarioActualizacion: 'system'
      },
      { 
        id: 2, 
        articulo: 'F203457', 
        otSap: '296572', 
        cliente: 'Productos Vicky', 
        referencia: 'Kythos Premium', 
        td: 'R', 
        colores: 6, 
        kilosSustrato: 180,
        kilos: 850,
        estado: 'corriendo', 
        maquina: 12,
        sustrato: 'BOPP Sell Transp',
        coloresDetalle: [
          { nombre: 'Amarillo', hex: '#FFFF00', tipo: 'primario' },
          { nombre: 'Blanco', hex: '#FFFFFF', tipo: 'primario' },
          { nombre: 'Cyan', hex: '#00FFFF', tipo: 'primario' },
          { nombre: 'Magenta', hex: '#FF00FF', tipo: 'primario' },
          { nombre: 'Negro', hex: '#000000', tipo: 'primario' },
          { nombre: 'Pantone V179', hex: '#E6194B', tipo: 'pantone' }
        ],
        fechaCreacion: new Date('2024-01-01'),
        fechaActualizacion: new Date('2024-01-01'),
        usuarioActualizacion: 'system'
      },
      { 
        id: 3, 
        articulo: 'F203458', 
        otSap: '296573', 
        cliente: 'Productos Vicky', 
        referencia: 'Kythos Especial', 
        td: 'R', 
        colores: 4, 
        kilosSustrato: 320,
        kilos: 950,
        estado: 'suspendido', 
        motivoSuspension: 'Falta material', 
        maquina: 14,
        sustrato: 'BOPP Sell Transp',
        coloresDetalle: [
          { nombre: 'Amarillo', hex: '#FFFF00', tipo: 'primario' },
          { nombre: 'Blanco', hex: '#FFFFFF', tipo: 'primario' },
          { nombre: 'Cyan', hex: '#00FFFF', tipo: 'primario' },
          { nombre: 'Negro', hex: '#000000', tipo: 'primario' }
        ],
        fechaCreacion: new Date('2024-01-01'),
        fechaActualizacion: new Date('2024-01-01'),
        usuarioActualizacion: 'system'
      },
      { 
        id: 4, 
        articulo: 'F203459', 
        otSap: '296574', 
        cliente: 'Productos Vicky', 
        referencia: 'Kythos Deluxe', 
        td: 'R', 
        colores: 5, 
        kilosSustrato: 200,
        kilos: 750,
        estado: 'terminado', 
        maquina: 15,
        sustrato: 'BOPP Sell Transp',
        coloresDetalle: [
          { nombre: 'Amarillo', hex: '#FFFF00', tipo: 'primario' },
          { nombre: 'Blanco', hex: '#FFFFFF', tipo: 'primario' },
          { nombre: 'Cyan', hex: '#00FFFF', tipo: 'primario' },
          { nombre: 'Negro', hex: '#000000', tipo: 'primario' },
          { nombre: 'Pantone C299', hex: '#3CB44B', tipo: 'pantone' }
        ],
        fechaCreacion: new Date('2024-01-01'),
        fechaActualizacion: new Date('2024-01-01'),
        usuarioActualizacion: 'system'
      },
      { 
        id: 5, 
        articulo: 'F203460', 
        otSap: '296575', 
        cliente: 'Productos Vicky', 
        referencia: 'Kythos Classic', 
        td: 'R', 
        colores: 3, 
        kilosSustrato: 150,
        kilos: 600,
        estado: 'listo', 
        maquina: 17,
        sustrato: 'BOPP Sell Transp',
        coloresDetalle: [
          { nombre: 'Amarillo', hex: '#FFFF00', tipo: 'primario' },
          { nombre: 'Negro', hex: '#000000', tipo: 'primario' },
          { nombre: 'Pantone V179', hex: '#E6194B', tipo: 'pantone' }
        ],
        fechaCreacion: new Date('2024-01-01'),
        fechaActualizacion: new Date('2024-01-01'),
        usuarioActualizacion: 'system'
      }
    ];
  }

  private getFallbackMachines(): Machine[] {
    return [
      { numero: 11, nombre: 'Máquina #11', estado: 'activa', eficiencia: 94.2, horasOperacion: 156 },
      { numero: 12, nombre: 'Máquina #12', estado: 'activa', eficiencia: 91.8, horasOperacion: 142 },
      { numero: 13, nombre: 'Máquina #13', estado: 'mantenimiento', eficiencia: 0, horasOperacion: 0 },
      { numero: 14, nombre: 'Máquina #14', estado: 'activa', eficiencia: 88.5, horasOperacion: 178 },
      { numero: 15, nombre: 'Máquina #15', estado: 'activa', eficiencia: 92.3, horasOperacion: 165 },
      { numero: 16, nombre: 'Máquina #16', estado: 'parada', eficiencia: 0, horasOperacion: 0 },
      { numero: 17, nombre: 'Máquina #17', estado: 'activa', eficiencia: 89.7, horasOperacion: 134 },
      { numero: 18, nombre: 'Máquina #18', estado: 'activa', eficiencia: 93.1, horasOperacion: 187 },
      { numero: 19, nombre: 'Máquina #19', estado: 'activa', eficiencia: 90.4, horasOperacion: 145 },
      { numero: 20, nombre: 'Máquina #20', estado: 'mantenimiento', eficiencia: 0, horasOperacion: 0 },
      { numero: 21, nombre: 'Máquina #21', estado: 'activa', eficiencia: 87.9, horasOperacion: 198 }
    ];
  }
}