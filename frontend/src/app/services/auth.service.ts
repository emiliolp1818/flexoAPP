import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  codigoUsuario: string;
  nombre: string;
  apellidos: string;
  nombreCompleto: string;
  email: string;
  rol: string;
  permisos: string;
  imagenPerfil?: string;
  expiresAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7000/api/auth';
  private tokenKey = 'flexo_token';
  private userSubject = new BehaviorSubject<any>(null);
  
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkStoredToken();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.tokenKey, response.token);
          }
          this.userSubject.next({
            username: response.username,
            codigoUsuario: response.codigoUsuario,
            nombre: response.nombre,
            apellidos: response.apellidos,
            nombreCompleto: response.nombreCompleto,
            email: response.email,
            rol: response.rol,
            permisos: response.permisos,
            imagenPerfil: response.imagenPerfil
          });
        })
      );
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
    }
    this.userSubject.next(null);
  }

  isAuthenticated(): boolean {
    if (typeof localStorage === 'undefined') return false;
    
    const token = localStorage.getItem(this.tokenKey);
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  updateApiUrl(newUrl: string): void {
    this.apiUrl = newUrl;
  }

  private checkStoredToken(): void {
    if (this.isAuthenticated()) {
      const token = this.getToken();
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          this.userSubject.next({
            username: payload.unique_name || payload.nameid,
            codigoUsuario: payload.nameid,
            nombre: payload.given_name,
            apellidos: payload.family_name,
            nombreCompleto: payload.NombreCompleto,
            email: payload.email,
            rol: payload.role,
            permisos: payload.Permisos
          });
        } catch (error) {
          this.logout();
        }
      }
    }
  }
}