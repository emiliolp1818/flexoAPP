import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { Header } from '../header/header';
import { PageBanner } from '../../shared/components/page-banner/page-banner';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ProductionService, WorkOrder, Machine } from '../../services/production.service';

// Las interfaces ahora están en el servicio

@Component({
  selector: 'app-maquinas',
  imports: [Header, PageBanner, FormsModule, DecimalPipe],
  templateUrl: './maquinas.html',
  styleUrls: ['./maquinas.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Maquinas implements OnInit {
  private productionService = inject(ProductionService);
  
  selectedMachine = signal<number | null>(null);
  showSuspensionModal = signal(false);
  suspensionReason = signal('');
  selectedWorkOrder = signal<WorkOrder | null>(null);
  adminPassword = signal('');
  showPasswordModal = signal(false);
  hoveredOrderId = signal<number | null>(null);
  
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

  // Crear datos de prueba - 10 programas por máquina
  private createTestData() {
    const testOrders: Omit<WorkOrder, 'id' | 'fechaCreacion' | 'fechaActualizacion'>[] = [];
    const machines = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
    
    machines.forEach(machineNum => {
      for (let i = 1; i <= 10; i++) {
        const estado = this.getRandomStatus();
        const order: Omit<WorkOrder, 'id' | 'fechaCreacion' | 'fechaActualizacion'> = {
          articulo: `F20345${i}`,
          otSap: `29657${i}`,
          cliente: `Cliente ${i}`,
          referencia: `Producto ${i} - Máquina ${machineNum}`,
          td: 'R',
          colores: Math.floor(Math.random() * 8) + 1,
          kilosSustrato: Math.floor(Math.random() * 500) + 100,
          kilos: Math.floor(Math.random() * 2000) + 500,
          estado: estado,
          maquina: machineNum,
          sustrato: 'BOPP Sell Transp',
          coloresDetalle: this.getRandomColors(),
          usuarioActualizacion: 'system',
          motivoSuspension: estado === 'suspendido' ? 'Falta de material' : undefined
        };
        
        testOrders.push(order);
      }
    });

    // Crear todas las órdenes de prueba
    testOrders.forEach(order => {
      this.productionService.createWorkOrder(order).subscribe({
        next: (createdOrder) => {
          console.log('Programa de prueba creado:', createdOrder.id);
        },
        error: (error) => {
          console.error('Error creando programa de prueba:', error);
        }
      });
    });
  }

  private getRandomStatus(): 'listo' | 'suspendido' | 'corriendo' | 'terminado' {
    const statuses: ('listo' | 'suspendido' | 'corriendo' | 'terminado')[] = 
      ['listo', 'suspendido', 'corriendo', 'terminado'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private getRandomColors(): { nombre: string; hex: string; tipo: 'primario' | 'pantone' }[] {
    const allColors = [
      { nombre: 'Amarillo', hex: '#FFFF00', tipo: 'primario' as const },
      { nombre: 'Blanco', hex: '#FFFFFF', tipo: 'primario' as const },
      { nombre: 'Cyan', hex: '#00FFFF', tipo: 'primario' as const },
      { nombre: 'Magenta', hex: '#FF00FF', tipo: 'primario' as const },
      { nombre: 'Negro', hex: '#000000', tipo: 'primario' as const },
      { nombre: 'Rojo', hex: '#FF0000', tipo: 'primario' as const },
      { nombre: 'Verde', hex: '#00FF00', tipo: 'primario' as const },
      { nombre: 'Azul', hex: '#0000FF', tipo: 'primario' as const },
      { nombre: 'Pantone V179', hex: '#E6194B', tipo: 'pantone' as const },
      { nombre: 'Pantone C299', hex: '#3CB44B', tipo: 'pantone' as const },
      { nombre: 'Pantone 185C', hex: '#E4002B', tipo: 'pantone' as const },
      { nombre: 'Pantone 286C', hex: '#003DA5', tipo: 'pantone' as const },
      { nombre: 'Crema', hex: '#FFFDD0', tipo: 'primario' as const }
    ];
    
    const numColors = Math.floor(Math.random() * 6) + 2; // Entre 2 y 8 colores
    const selectedColors: { nombre: string; hex: string; tipo: 'primario' | 'pantone' }[] = [];
    
    for (let i = 0; i < numColors && i < allColors.length; i++) {
      const randomIndex = Math.floor(Math.random() * allColors.length);
      const color = allColors[randomIndex];
      if (!selectedColors.find(c => c.nombre === color.nombre)) {
        selectedColors.push(color);
      }
    }
    
    return selectedColors;
  }

  // Computed para obtener órdenes de trabajo de la máquina seleccionada
  selectedMachineOrders = computed(() => {
    const machineNum = this.selectedMachine();
    if (!machineNum) return [];
    return this.workOrders().filter(order => order.maquina === machineNum);
  });

  // Método para obtener el conteo de órdenes activas
  getActiveOrdersCount(): number {
    return this.selectedMachineOrders().filter(o => o.estado === 'corriendo').length;
  }

  // Métodos para mostrar/ocultar paleta de colores
  showColorPalette(orderId: number) {
    this.hoveredOrderId.set(orderId);
  }

  hideColorPalette() {
    this.hoveredOrderId.set(null);
  }

  // Crear datos de prueba para la máquina seleccionada
  createTestDataForMachine() {
    const machineNum = this.selectedMachine();
    if (!machineNum) {
      alert('Selecciona una máquina primero');
      return;
    }

    if (confirm(`¿Crear 5 programas de prueba para la Máquina #${machineNum}?`)) {
      for (let i = 1; i <= 5; i++) {
        const estado = this.getRandomStatus();
        const order: Omit<WorkOrder, 'id' | 'fechaCreacion' | 'fechaActualizacion'> = {
          articulo: `F20345${i}`,
          otSap: `29657${i}-M${machineNum}`,
          cliente: `Cliente ${i}`,
          referencia: `Producto ${i} - Máquina ${machineNum}`,
          td: 'R',
          colores: Math.floor(Math.random() * 8) + 1,
          kilosSustrato: Math.floor(Math.random() * 500) + 100,
          kilos: Math.floor(Math.random() * 2000) + 500,
          estado: estado,
          maquina: machineNum,
          sustrato: 'BOPP Sell Transp',
          coloresDetalle: this.getRandomColors(),
          usuarioActualizacion: 'user-test',
          motivoSuspension: estado === 'suspendido' ? 'Falta de material' : undefined
        };
        
        this.productionService.createWorkOrder(order).subscribe({
          next: (createdOrder) => {
            console.log('Programa de prueba creado:', createdOrder.id);
          },
          error: (error) => {
            console.error('Error creando programa de prueba:', error);
          }
        });
      }
    }
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

    // Actualizar a través del servicio para sincronizar con la base de datos
    this.productionService.updateWorkOrderStatus(orderId, newStatus).subscribe({
      next: (updatedOrder) => {
        console.log('Estado actualizado correctamente:', updatedOrder);
      },
      error: (error) => {
        console.error('Error al actualizar estado:', error);
        alert('Error al actualizar el estado. Inténtalo de nuevo.');
      }
    });
  }

  confirmSuspension() {
    const order = this.selectedWorkOrder();
    if (!order || !this.suspensionReason().trim()) return;

    // Actualizar a través del servicio
    this.productionService.updateWorkOrderStatus(order.id, 'suspendido', this.suspensionReason()).subscribe({
      next: (updatedOrder) => {
        console.log('Orden suspendida correctamente:', updatedOrder);
        this.closeSuspensionModal();
      },
      error: (error) => {
        console.error('Error al suspender orden:', error);
        alert('Error al suspender la orden. Inténtalo de nuevo.');
      }
    });
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
    if (this.adminPassword() === 'admin123') {
      const order = this.selectedWorkOrder();
      if (order) {
        // Resetear a través del servicio
        this.productionService.updateWorkOrderStatus(order.id, 'listo').subscribe({
          next: (updatedOrder) => {
            console.log('Estado reseteado correctamente:', updatedOrder);
            this.closePasswordModal();
          },
          error: (error) => {
            console.error('Error al resetear estado:', error);
            alert('Error al resetear el estado. Inténtalo de nuevo.');
          }
        });
      }
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
    const order = this.workOrders().find(o => o.id === orderId);
    if (order) {
      // Implementar lógica de impresión
      console.log('Imprimiendo programa de producción:', order);
      
      // Crear contenido para imprimir
      const printContent = `
        PROGRAMA DE PRODUCCIÓN
        =====================
        Artículo: ${order.articulo}
        OT SAP: ${order.otSap}
        Cliente: ${order.cliente}
        Referencia: ${order.referencia}
        TD: ${order.td}
        Colores: ${order.colores}
        Sustrato: ${order.sustrato}
        Kilos: ${order.kilos}
        Estado: ${order.estado}
        Máquina: ${order.maquina}
      `;
      
      // Abrir ventana de impresión
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`<pre>${printContent}</pre>`);
        printWindow.document.close();
        printWindow.print();
      }
    }
  }

  editOrder(orderId: number) {
    console.log('Editando programa de producción:', orderId);
    // Implementar modal de edición o navegación a página de edición
    alert('Función de edición - Próximamente disponible');
  }

  duplicateOrder(orderId: number) {
    const order = this.workOrders().find(o => o.id === orderId);
    if (order && confirm('¿Desea duplicar este programa de producción?')) {
      const newOrder: Omit<WorkOrder, 'id' | 'fechaCreacion' | 'fechaActualizacion'> = { 
        ...order, 
        otSap: order.otSap + '-COPY',
        estado: 'listo' as const,
        usuarioActualizacion: 'current-user',
        motivoSuspension: undefined
      };
      
      // Crear a través del servicio
      this.productionService.createWorkOrder(newOrder).subscribe({
        next: (createdOrder) => {
          console.log('Programa duplicado correctamente:', createdOrder);
          alert('Programa de producción duplicado exitosamente');
        },
        error: (error) => {
          console.error('Error al duplicar programa:', error);
          alert('Error al duplicar el programa. Inténtalo de nuevo.');
        }
      });
    }
  }

  deleteOrder(orderId: number) {
    if (confirm('¿Está seguro de eliminar este programa de producción?')) {
      this.productionService.deleteWorkOrder(orderId).subscribe({
        next: () => {
          console.log('Programa eliminado correctamente');
          alert('Programa de producción eliminado exitosamente');
        },
        error: (error) => {
          console.error('Error al eliminar programa:', error);
          alert('Error al eliminar el programa. Inténtalo de nuevo.');
        }
      });
    }
  }
}