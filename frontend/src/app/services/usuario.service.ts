import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UsuarioDto {
  codigoUsuario: string;
  nombre: string;
  apellidos: string;
  nombreCompleto: string;
  correo?: string;
  rol: string;
  telefono?: string;
  permisos: string;
  imagenPerfil?: string;
  activo: boolean;
  fechaCreacion: Date;
  fechaUpdate: Date;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CursorPagedResult<T> {
  items: T[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor?: string;
  previousCursor?: string;
  pageSize: number;
}

export interface UsuarioPaginationRequest {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  rol?: string;
  activo?: boolean;
  fechaCreacionDesde?: Date;
  fechaCreacionHasta?: Date;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface CursorPaginationRequest {
  pageSize?: number;
  lastId?: string;
  searchTerm?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface UsuarioSearchRequest {
  codigoUsuario?: string;
  nombre?: string;
  apellidos?: string;
  correo?: string;
  rol?: string;
  telefono?: string;
  activo?: boolean;
  fechaCreacionDesde?: Date;
  fechaCreacionHasta?: Date;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'https://localhost:7000/api/usuario';

  constructor(private http: HttpClient) {}

  /**
   * Obtener usuarios con paginación tradicional
   * Recomendado para volúmenes pequeños a medianos
   */
  getUsuarios(request: UsuarioPaginationRequest = {}): Observable<PagedResult<UsuarioDto>> {
    let params = new HttpParams();
    
    if (request.page) params = params.set('page', request.page.toString());
    if (request.pageSize) params = params.set('pageSize', request.pageSize.toString());
    if (request.searchTerm) params = params.set('searchTerm', request.searchTerm);
    if (request.rol) params = params.set('rol', request.rol);
    if (request.activo !== undefined) params = params.set('activo', request.activo.toString());
    if (request.fechaCreacionDesde) params = params.set('fechaCreacionDesde', request.fechaCreacionDesde.toISOString());
    if (request.fechaCreacionHasta) params = params.set('fechaCreacionHasta', request.fechaCreacionHasta.toISOString());
    if (request.sortBy) params = params.set('sortBy', request.sortBy);
    if (request.sortDescending !== undefined) params = params.set('sortDescending', request.sortDescending.toString());

    return this.http.get<PagedResult<UsuarioDto>>(this.apiUrl, { params });
  }

  /**
   * Obtener usuarios con paginación basada en cursor
   * Recomendado para grandes volúmenes de datos
   */
  getUsuariosCursor(request: CursorPaginationRequest = {}): Observable<CursorPagedResult<UsuarioDto>> {
    let params = new HttpParams();
    
    if (request.pageSize) params = params.set('pageSize', request.pageSize.toString());
    if (request.lastId) params = params.set('lastId', request.lastId);
    if (request.searchTerm) params = params.set('searchTerm', request.searchTerm);
    if (request.sortBy) params = params.set('sortBy', request.sortBy);
    if (request.sortDescending !== undefined) params = params.set('sortDescending', request.sortDescending.toString());

    return this.http.get<CursorPagedResult<UsuarioDto>>(`${this.apiUrl}/cursor`, { params });
  }

  /**
   * Búsqueda avanzada de usuarios
   */
  searchUsuarios(request: UsuarioSearchRequest): Observable<PagedResult<UsuarioDto>> {
    return this.http.post<PagedResult<UsuarioDto>>(`${this.apiUrl}/search`, request);
  }

  /**
   * Obtener usuario específico por código
   */
  getUsuario(codigoUsuario: string): Observable<UsuarioDto> {
    return this.http.get<UsuarioDto>(`${this.apiUrl}/${codigoUsuario}`);
  }

  /**
   * Obtener estadísticas de usuarios
   */
  getUsuarioStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }

  /**
   * Obtener usuarios por rol
   */
  getUsuariosByRol(rol: string, page: number = 1, pageSize: number = 10): Observable<PagedResult<UsuarioDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PagedResult<UsuarioDto>>(`${this.apiUrl}/by-role/${rol}`, { params });
  }

  /**
   * Crear nuevo usuario
   */
  createUsuario(usuario: any): Observable<UsuarioDto> {
    return this.http.post<UsuarioDto>(this.apiUrl, usuario);
  }
}