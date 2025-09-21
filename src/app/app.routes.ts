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
  
  // Dashboard (requiere autenticación)
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then(m => m.Dashboard),
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
  
  // Ruta por defecto redirige al login
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  
  // Rutas no encontradas redirigen al login
  {
    path: '**',
    redirectTo: '/login'
  }
];
