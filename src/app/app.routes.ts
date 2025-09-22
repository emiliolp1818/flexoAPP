import { Routes } from '@angular/router';
import { Login } from './components/auth/login/login';
import { authGuard, loginGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Ruta de login (solo accesible si no está autenticado)
  {
    path: 'login',
    component: Login,
    canActivate: [loginGuard]
  },
  
  // Dashboard principal (requiere autenticación)
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },

  // Estadísticas (requiere autenticación)
  {
    path: 'estadisticas',
    loadComponent: () => import('./components/estadisticas/estadisticas').then(m => m.Estadisticas),
    canActivate: [authGuard]
  },

  // Máquinas (requiere autenticación)
  {
    path: 'maquinas',
    loadComponent: () => import('./components/maquinas/maquinas').then(m => m.Maquinas),
    canActivate: [authGuard]
  },

  // Programaciones (requiere autenticación)
  {
    path: 'programaciones',
    loadComponent: () => import('./components/programaciones/programaciones').then(m => m.Programaciones),
    canActivate: [authGuard]
  },

  // Carga de Programas (requiere autenticación)
  {
    path: 'carga-programas',
    loadComponent: () => import('./components/carga-programas/carga-programas').then(m => m.CargaProgramas),
    canActivate: [authGuard]
  },

  // Productos (requiere autenticación)
  {
    path: 'productos',
    loadComponent: () => import('./components/productos/productos').then(m => m.Productos),
    canActivate: [authGuard]
  },

  // Reportes (requiere autenticación)
  {
    path: 'reportes',
    loadComponent: () => import('./components/reportes/reportes').then(m => m.Reportes),
    canActivate: [authGuard]
  },
  
  // Perfil de usuario (requiere autenticación)
  {
    path: 'profile',
    loadComponent: () => import('./components/user-profile/user-profile').then(m => m.UserProfile),
    canActivate: [authGuard]
  },
  
  // Configuraciones (requiere autenticación)
  {
    path: 'settings',
    loadComponent: () => import('./components/settings/settings').then(m => m.Settings),
    canActivate: [authGuard]
  },

  // Prueba de conexión (requiere autenticación)
  {
    path: 'test-connection',
    loadComponent: () => import('./components/test-connection/test-connection').then(m => m.TestConnection),
    canActivate: [authGuard]
  },
  
  // Ruta por defecto redirige al dashboard si está autenticado, sino al login
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  
  // Rutas no encontradas redirigen al dashboard
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
