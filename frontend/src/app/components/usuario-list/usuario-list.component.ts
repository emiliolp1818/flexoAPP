import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';

import { UsuarioService, UsuarioDto, PagedResult, CursorPagedResult } from '../../services/usuario.service';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatTabsModule
  ],
  templateUrl: './usuario-list.component.html',
  styleUrl: './usuario-list.component.scss'
})
export class UsuarioListComponent implements OnInit {
  // Signals para el estado del componente
  usuarios = signal<UsuarioDto[]>([]);
  loading = signal(false);
  totalCount = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(0);
  
  // Para paginación por cursor
  cursorUsuarios = signal<UsuarioDto[]>([]);
  cursorLoading = signal(false);
  hasNextPage = signal(false);
  hasPreviousPage = signal(false);
  nextCursor = signal<string | undefined>(undefined);
  previousCursor = signal<string | undefined>(undefined);
  
  // Estadísticas
  stats = signal<any>(null);
  
  // Formularios
  searchForm: FormGroup;
  advancedSearchForm: FormGroup;
  
  // Configuración de tabla
  displayedColumns: string[] = [
    'codigoUsuario', 
    'nombreCompleto', 
    'correo', 
    'rol', 
    'activo', 
    'fechaCreacion',
    'acciones'
  ];
  
  roles = ['Administrador', 'Supervisor', 'Operador', 'Consultor'];

  constructor(
    private usuarioService: UsuarioService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      rol: [''],
      activo: [''],
      sortBy: ['fechaCreacion'],
      sortDescending: [true]
    });

    this.advancedSearchForm = this.fb.group({
      codigoUsuario: [''],
      nombre: [''],
      apellidos: [''],
      correo: [''],
      rol: [''],
      telefono: [''],
      activo: [''],
      fechaCreacionDesde: [''],
      fechaCreacionHasta: ['']
    });
  }

  ngOnInit(): void {
    this.loadUsuarios();
    this.loadStats();
  }

  /**
   * Cargar usuarios con paginación tradicional
   */
  loadUsuarios(): void {
    this.loading.set(true);
    
    const formValue = this.searchForm.value;
    const request = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      searchTerm: formValue.searchTerm || undefined,
      rol: formValue.rol || undefined,
      activo: formValue.activo !== '' ? formValue.activo : undefined,
      sortBy: formValue.sortBy,
      sortDescending: formValue.sortDescending
    };

    this.usuarioService.getUsuarios(request).subscribe({
      next: (result: PagedResult<UsuarioDto>) => {
        this.usuarios.set(result.items);
        this.totalCount.set(result.totalCount);
        this.totalPages.set(result.totalPages);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading usuarios:', error);
        this.loading.set(false);
      }
    });
  }

  /**
   * Cargar usuarios con paginación por cursor
   */
  loadUsuariosCursor(lastId?: string): void {
    this.cursorLoading.set(true);
    
    const request = {
      pageSize: this.pageSize(),
      lastId: lastId,
      searchTerm: this.searchForm.value.searchTerm || undefined,
      sortDescending: this.searchForm.value.sortDescending
    };

    this.usuarioService.getUsuariosCursor(request).subscribe({
      next: (result: CursorPagedResult<UsuarioDto>) => {
        this.cursorUsuarios.set(result.items);
        this.hasNextPage.set(result.hasNextPage);
        this.hasPreviousPage.set(result.hasPreviousPage);
        this.nextCursor.set(result.nextCursor);
        this.previousCursor.set(result.previousCursor);
        this.cursorLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading usuarios with cursor:', error);
        this.cursorLoading.set(false);
      }
    });
  }

  /**
   * Búsqueda avanzada
   */
  advancedSearch(): void {
    this.loading.set(true);
    
    const formValue = this.advancedSearchForm.value;
    const request = {
      ...formValue,
      page: 1,
      pageSize: this.pageSize(),
      sortBy: 'fechaCreacion',
      sortDescending: true
    };

    // Limpiar campos vacíos
    Object.keys(request).forEach(key => {
      if (request[key] === '' || request[key] === null) {
        delete request[key];
      }
    });

    this.usuarioService.searchUsuarios(request).subscribe({
      next: (result: PagedResult<UsuarioDto>) => {
        this.usuarios.set(result.items);
        this.totalCount.set(result.totalCount);
        this.totalPages.set(result.totalPages);
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error in advanced search:', error);
        this.loading.set(false);
      }
    });
  }

  /**
   * Cargar estadísticas
   */
  loadStats(): void {
    this.usuarioService.getUsuarioStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  /**
   * Manejar cambio de página
   */
  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadUsuarios();
  }

  /**
   * Buscar usuarios
   */
  onSearch(): void {
    this.currentPage.set(1);
    this.loadUsuarios();
  }

  /**
   * Limpiar búsqueda
   */
  clearSearch(): void {
    this.searchForm.reset({
      searchTerm: '',
      rol: '',
      activo: '',
      sortBy: 'fechaCreacion',
      sortDescending: true
    });
    this.currentPage.set(1);
    this.loadUsuarios();
  }

  /**
   * Limpiar búsqueda avanzada
   */
  clearAdvancedSearch(): void {
    this.advancedSearchForm.reset();
  }

  /**
   * Navegación por cursor - Siguiente página
   */
  nextPageCursor(): void {
    if (this.hasNextPage() && this.nextCursor()) {
      this.loadUsuariosCursor(this.nextCursor());
    }
  }

  /**
   * Navegación por cursor - Página anterior
   */
  previousPageCursor(): void {
    if (this.hasPreviousPage() && this.previousCursor()) {
      this.loadUsuariosCursor(this.previousCursor());
    }
  }

  /**
   * Reiniciar paginación por cursor
   */
  resetCursorPagination(): void {
    this.loadUsuariosCursor();
  }

  /**
   * Obtener color del chip según el rol
   */
  getRoleColor(rol: string): string {
    const colors: { [key: string]: string } = {
      'Administrador': 'primary',
      'Supervisor': 'accent',
      'Operador': 'warn',
      'Consultor': ''
    };
    return colors[rol] || '';
  }

  /**
   * Formatear fecha
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Ver detalles del usuario
   */
  viewUser(usuario: UsuarioDto): void {
    console.log('Ver usuario:', usuario);
    // Implementar navegación a detalles
  }

  /**
   * Editar usuario
   */
  editUser(usuario: UsuarioDto): void {
    console.log('Editar usuario:', usuario);
    // Implementar edición
  }

  /**
   * Eliminar usuario
   */
  deleteUser(usuario: UsuarioDto): void {
    console.log('Eliminar usuario:', usuario);
    // Implementar eliminación
  }
}