import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { Header } from '../header/header';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductionService, WorkOrder, Machine } from '../../services/production.service';

interface ProductionData {
  tinasProducidas: number;
  kilosProducidos: number;
  tintasGastadas: number;
  mes: string;
}

interface OrderData {
  maquinaMasEficiente: string;
  tiempoPromedio: number;
  eficiencia: number;
}

interface MachineTime {
  maquina: string;
  tiempoAjuste: number;
  posicion: number;
}

interface FailureTime {
  maquina: string;
  tiempoParada: number;
  causa: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [Header, DecimalPipe, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  productionService = inject(ProductionService);

  // Estado de la aplicación
  currentView = signal<'estadisticas' | 'maquinas' | 'programaciones' | 'productos' | 'reportes' | 'configuracion'>('estadisticas');
  selectedMachine = signal<number | null>(null);
  showSuspensionModal = signal(false);
  suspensionReason = signal('');
  selectedWorkOrder = signal<WorkOrder | null>(null);
  adminPassword = signal('');
  showPasswordModal = signal(false);

  // Datos simulados para desarrollo (reemplazar con datos reales del backend)
  productionData = signal<ProductionData>({
    tinasProducidas: 1250,
    kilosProducidos: 45680,
    tintasGastadas: 320,
    mes: 'Diciembre 2024'
  });

  orderData = signal<OrderData>({
    maquinaMasEficiente: 'Máquina #3',
    tiempoPromedio: 12.5,
    eficiencia: 94.2
  });

  machinesTimes = signal<MachineTime[]>([
    { maquina: 'Máquina #1', tiempoAjuste: 8.2, posicion: 1 },
    { maquina: 'Máquina #5', tiempoAjuste: 9.1, posicion: 2 },
    { maquina: 'Máquina #3', tiempoAjuste: 10.5, posicion: 3 }
  ]);

  failureTimes = signal<FailureTime[]>([
    { maquina: 'Máquina #2', tiempoParada: 2.5, causa: 'Falta de tinta azul' },
    { maquina: 'Máquina #4', tiempoParada: 1.8, causa: 'Falta de tinta roja' },
    { maquina: 'Máquina #7', tiempoParada: 3.2, causa: 'Falta de tinta amarilla' }
  ]);

  // Signals reactivos conectados al servicio
  machines = signal<Machine[]>([]);
  workOrders = signal<WorkOrder[]>([]);

  ngOnInit() {
    // Cargar datos desde el servicio
    this.productionService.loadMachines().subscribe(machines => {
      this.machines.set(machines);
    });
    
    this.productionService.loadWorkOrders().subscribe(orders => {
      this.workOrders.set(orders);
    });
    
    // Suscribirse a cambios en tiempo real
    this.productionService.workOrders$.subscribe(orders => {
      this.workOrders.set(orders);
    });
    
    this.productionService.machines$.subscribe(machines => {
      this.machines.set(machines);
    });
  }

  // Computed para obtener el nombre del usuario
  userName = computed(() => {
    const user = this.authService.currentUser();
    return user ? `${user.nombre} ${user.apellido}` : 'Usuario';
  });

  // Computed para obtener máquinas activas
  activeMachinesCount = computed(() => {
    return this.machines().filter(m => m.estado === 'activa').length;
  });

  // Computed para obtener órdenes de trabajo de la máquina seleccionada
  selectedMachineOrders = computed(() => {
    const machineNum = this.selectedMachine();
    if (!machineNum) return [];
    return this.workOrders().filter(order => order.maquina === machineNum);
  });

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  selectMachine(machineNumber: number) {
    this.selectedMachine.set(machineNumber);
  }

  changeOrderStatus(orderId: number, newStatus: 'listo' | 'suspendido' | 'corriendo' | 'terminado') {
    if (newStatus === 'suspendido') {
      this.selectedWorkOrder.set(this.workOrders().find(order => order.id === orderId) || null);
      this.showSuspensionModal.set(true);
      return;
    }

    const orders = this.workOrders();
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, estado: newStatus } : order
    );
    this.workOrders.set(updatedOrders);
  }

  confirmSuspension() {
    const order = this.selectedWorkOrder();
    if (!order || !this.suspensionReason().trim()) return;

    const orders = this.workOrders();
    const updatedOrders = orders.map(o => 
      o.id === order.id ? { ...o, estado: 'suspendido' as const, motivoSuspension: this.suspensionReason() } : o
    );
    this.workOrders.set(updatedOrders);
    
    this.closeSuspensionModal();
  }

  closeSuspensionModal() {
    this.showSuspensionModal.set(false);
    this.suspensionReason.set('');
    this.selectedWorkOrder.set(null);
  }

  requestPasswordChange(orderId: number) {
    this.selectedWorkOrder.set(this.workOrders().find(order => order.id === orderId) || null);
    this.showPasswordModal.set(true);
  }

  validatePasswordAndReset() {
    // Contraseña de admin (en producción debería venir del backend)
    if (this.adminPassword() === 'admin123') {
      const order = this.selectedWorkOrder();
      if (order) {
        const orders = this.workOrders();
        const updatedOrders = orders.map(o => 
          o.id === order.id ? { ...o, estado: 'listo' as const, motivoSuspension: undefined } : o
        );
        this.workOrders.set(updatedOrders);
      }
      this.closePasswordModal();
    } else {
      alert('Contraseña incorrecta');
    }
  }

  closePasswordModal() {
    this.showPasswordModal.set(false);
    this.adminPassword.set('');
    this.selectedWorkOrder.set(null);
  }

  // Funciones para los botones adicionales
  printOrder(orderId: number) {
    console.log('Imprimiendo orden:', orderId);
    alert('Función de impresión - En desarrollo');
  }

  editOrder(orderId: number) {
    console.log('Editando orden:', orderId);
    alert('Función de edición - En desarrollo');
  }

  duplicateOrder(orderId: number) {
    const order = this.workOrders().find(o => o.id === orderId);
    if (order) {
      const newOrder = { 
        ...order, 
        id: Math.max(...this.workOrders().map(o => o.id)) + 1,
        otSap: order.otSap + '-COPY',
        estado: 'listo' as const
      };
      this.workOrders.set([...this.workOrders(), newOrder]);
    }
  }

  deleteOrder(orderId: number) {
    if (confirm('¿Está seguro de eliminar esta orden de trabajo?')) {
      const orders = this.workOrders().filter(order => order.id !== orderId);
      this.workOrders.set(orders);
    }
  }
}
