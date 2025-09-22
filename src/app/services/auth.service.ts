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
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API_URL = 'https://localhost:7001/api';
  private readonly TOKEN_KEY = 'flexo_token';
  private readonly USER_KEY = 'flexo_user';
  
  // Credenciales temporales para desarrollo (eliminar cuando el backend esté listo)
  private readonly DEV_CREDENTIALS = [
    { codigoUsuario: 'admin', contrasena: 'admin123', nombre: 'Administrador', apellido: 'Sistema', rol: 'Administrador' },
    { codigoUsuario: 'user', contrasena: 'user123', nombre: 'Usuario', apellido: 'Demo', rol: 'Usuario' },
    { codigoUsuario: 'test', contrasena: 'test123', nombre: 'Test', apellido: 'User', rol: 'Usuario' }
  ];

  // Signals para el estado de autenticación
  isAuthenticated = signal(false);
  currentUser = signal<UserInfo | null>(null);

  constructor() {
    this.checkAuthStatus();
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // Intentar conectar al backend real
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
      console.error('Backend connection failed, trying development mode:', error);

      // Si el backend no está disponible, usar credenciales de desarrollo
      if (error.status === 0 || error.name === 'TypeError') {
        console.log('🔧 Modo desarrollo activado - Backend no disponible');
        return this.developmentLogin(credentials);
      }

      // Otros errores del backend
      let errorMessage = 'Error de conexión con el servidor';

      if (error.status === 401) {
        errorMessage = 'Credenciales incorrectas.';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  private async developmentLogin(credentials: LoginRequest): Promise<LoginResponse> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));

    // Limpiar credenciales
    const cleanCredentials = {
      codigoUsuario: credentials.codigoUsuario?.trim() || '',
      contrasena: credentials.contrasena?.trim() || ''
    };

    // Buscar credenciales válidas
    const validUser = this.DEV_CREDENTIALS.find(
      user => user.codigoUsuario === cleanCredentials.codigoUsuario && 
              user.contrasena === cleanCredentials.contrasena
    );

    if (validUser) {
      const user: UserInfo = {
        codigoUsuario: validUser.codigoUsuario,
        nombre: validUser.nombre,
        apellido: validUser.apellido,
        rol: validUser.rol,
        fotoBase64: undefined
      };

      const token = 'dev-token-' + Date.now();

      // Guardar en localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      }

      // Actualizar signals
      this.isAuthenticated.set(true);
      this.currentUser.set(user);

      return {
        success: true,
        message: 'Login exitoso (modo desarrollo)',
        token,
        user
      };
    } else {
      return {
        success: false,
        message: 'Credenciales incorrectas. Pruebe: admin/admin123, user/user123, o test/test123'
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
        this.http.post<boolean>(`${this.API_URL}/auth/validate`, { token })
      );
      return response;
    } catch (error) {
      console.error('Token validation error:', error);
      
      // En modo desarrollo, validar tokens que empiecen con 'dev-token-'
      if (token.startsWith('dev-token-')) {
        console.log('🔧 Validación en modo desarrollo');
        return true;
      }
      
      return false;
    }
  }
}
