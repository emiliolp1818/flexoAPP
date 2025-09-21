import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

export interface LoginRequest {
  codigoUsuario: string;
  contrasena: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: UserInfo;
}

export interface UserInfo {
  codigoUsuario: string;
  nombre: string;
  apellido: string;
  rol: string;
  fotoBase64?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private readonly API_URL = 'https://localhost:7001/api';
  private readonly TOKEN_KEY = 'flexo_token';
  private readonly USER_KEY = 'flexo_user';

  // Signals para el estado de autenticación
  isAuthenticated = signal(false);
  currentUser = signal<UserInfo | null>(null);

  constructor() {
    this.checkAuthStatus();
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
      );

      if (response.success && response.token && response.user) {
        // Guardar token y usuario (solo en el navegador)
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
        }
        
        // Actualizar signals
        this.isAuthenticated.set(true);
        this.currentUser.set(response.user);
      }

      return response;
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.error?.message || 'Error de conexión con el servidor'
      };
    }
  }

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  private checkAuthStatus(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    const token = this.getToken();
    const userStr = localStorage.getItem(this.USER_KEY);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.isAuthenticated.set(true);
        this.currentUser.set(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.logout();
      }
    }
  }

  async validateToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await firstValueFrom(
        this.http.post<boolean>(`${this.API_URL}/auth/validate`, token)
      );
      return response;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }
}