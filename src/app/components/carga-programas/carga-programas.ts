import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { Header } from '../header/header';
import { PageBanner } from '../../shared/components/page-banner/page-banner';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ProductionService, WorkOrder, Machine } from '../../services/production.service';

@Component({
  selector: 'app-carga-programas',
  imports: [Header, PageBanner, FormsModule, DecimalPipe],
  templateUrl: './carga-programas.html',
  styleUrls: ['./carga-programas.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CargaProgramas implements OnInit {
  private productionService = inject(ProductionService);
  
  machines = signal<Machine[]>([]);
  selectedMachines = signal<number[]>([]);
  isLoading = signal(false);
  loadingProgress = signal(0);
  showSuccessModal = signal(false);
  loadedPrograms = signal<WorkOrder[]>([]);
  
  // Configuración de programas por defecto
  defaultPrograms = signal<Omit<WorkOrder, 'id' | 'maquina' | 'fechaCreacion' | 'fechaActualizacion'>[]>([
    {
      articulo: 'ART-001',
      otSap: 'OT-2025-001',
      cliente: 'Cliente Premium',
      referencia: 'REF-001',
      td: 'TD-A',
      colores: 4,
      kilosSustrato: 1000,
      kilos: 950,
      estado: 'listo',
      sustrato: 'BOPP 20 micras',
      coloresDetalle: [
        { nombre: 'Cyan', hex: '#00FFFF', tipo: 'primario' },
        { nombre: 'Magenta', hex: '#FF00FF', tipo: 'primario' },
        { nombre: 'Yellow', hex: '#FFFF00', tipo: 'primario' },
        { nombre: 'Black', hex: '#000000', tipo: 'primario' }
      ],
      usuarioActualizacion: 'admin'
    }
  ]);

  ngOnInit() {
    this.loadMachines();
  }

  private loadMachines() {
    this.productionService.loadMachines().subscribe(machines => {
      this.machines.set(machines.filter(m => m.estado === 'activa'));
    });
  }  
toggleMachineSelection(machineNumber: number) {
    const current = this.selectedMachines();
    if (current.includes(machineNumber)) {
      this.selectedMachines.set(current.filter(m => m !== machineNumber));
    } else {
      this.selectedMachines.set([...current, machineNumber]);
    }
  }

  selectAllMachines() {
    const allMachineNumbers = this.machines().map(m => m.numero);
    this.selectedMachines.set(allMachineNumbers);
  }

  clearSelection() {
    this.selectedMachines.set([]);
  }

  async loadProgramsToMachines() {
    if (this.selectedMachines().length === 0) {
      alert('Selecciona al menos una máquina');
      return;
    }

    this.isLoading.set(true);
    this.loadingProgress.set(0);
    const loadedPrograms: WorkOrder[] = [];
    
    const totalOperations = this.selectedMachines().length * 10;
    let completedOperations = 0;

    for (const machineNumber of this.selectedMachines()) {
      for (let i = 1; i <= 10; i++) {
        const program = this.createProgramForMachine(machineNumber, i);
        
        try {
          const createdProgram = await new Promise<WorkOrder>((resolve, reject) => {
            this.productionService.createWorkOrder(program).subscribe({
              next: (result) => resolve(result),
              error: (error) => reject(error)
            });
          });
          loadedPrograms.push(createdProgram);
          
          completedOperations++;
          this.loadingProgress.set((completedOperations / totalOperations) * 100);
          
          // Pequeña pausa para mostrar progreso
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error cargando programa ${i} en máquina ${machineNumber}:`, error);
        }
      }
    }

    this.loadedPrograms.set(loadedPrograms);
    this.isLoading.set(false);
    this.showSuccessModal.set(true);
  }

  private createProgramForMachine(machineNumber: number, programIndex: number): Omit<WorkOrder, 'id' | 'fechaCreacion' | 'fechaActualizacion'> {
    const baseProgram = this.defaultPrograms()[0];
    
    return {
      ...baseProgram,
      articulo: `${baseProgram.articulo}-M${machineNumber}-P${programIndex}`,
      otSap: `${baseProgram.otSap}-M${machineNumber}-${programIndex.toString().padStart(2, '0')}`,
      referencia: `${baseProgram.referencia}-M${machineNumber}`,
      maquina: machineNumber,
      kilos: baseProgram.kilos + (programIndex * 50), // Variación en kilos
      usuarioActualizacion: 'sistema-carga'
    };
  }

  closeSuccessModal() {
    this.showSuccessModal.set(false);
    this.selectedMachines.set([]);
    this.loadedPrograms.set([]);
  }

  // Computed properties
  selectedMachinesCount = computed(() => this.selectedMachines().length);
  totalProgramsToLoad = computed(() => this.selectedMachines().length * 10);
}