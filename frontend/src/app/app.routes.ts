import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Ruta por defecto - redirigir al login
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },

  // Módulo de autenticación (eager loading para login rápido)
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule),
    data: { 
      preload: true,
      chunkName: 'auth'
    }
  },

  // Dashboard principal (preload para navegación rápida)
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [AuthGuard],
    data: { 
      title: 'Dashboard',
      preload: true,
      chunkName: 'dashboard'
    }
  },

  // Módulo de usuarios (lazy loading con chunks)
  {
    path: 'usuarios',
    loadChildren: () => import('./modules/usuarios/usuarios.module').then(m => m.UsuariosModule),
    canActivate: [AuthGuard],
    data: { 
      title: 'Gestión de Usuarios',
      chunkName: 'usuarios'
    }
  },

  // Módulo de reportes (lazy loading)
  {
    path: 'reportes',
    loadChildren: () => import('./modules/reportes/reportes.module').then(m => m.ReportesModule),
    canActivate: [AuthGuard],
    data: { 
      title: 'Reportes',
      chunkName: 'reportes'
    }
  },

  // Módulo de configuración (lazy loading)
  {
    path: 'configuracion',
    loadChildren: () => import('./modules/configuracion/configuracion.module').then(m => m.ConfiguracionModule),
    canActivate: [AuthGuard],
    data: { 
      title: 'Configuración',
      chunkName: 'configuracion'
    }
  },

  // Módulo de perfil de usuario (lazy loading)
  {
    path: 'perfil',
    loadComponent: () => import('./components/user-profile/user-profile.component')
      .then(m => m.UserProfileComponent),
    canActivate: [AuthGuard],
    data: { 
      title: 'Mi Perfil',
      chunkName: 'perfil'
    }
  },

  // Páginas de error (lazy loading)
  {
    path: 'error',
    loadChildren: () => import('./modules/error/error.module').then(m => m.ErrorModule),
    data: { 
      chunkName: 'error'
    }
  },

  // Página 404
  {
    path: '404',
    loadComponent: () => import('./components/not-found/not-found.component')
      .then(m => m.NotFoundComponent),
    data: { 
      title: 'Página no encontrada',
      chunkName: 'error'
    }
  },

  // Wildcard route - debe ir al final
  {
    path: '**',
    redirectTo: '/404'
  }
];

// Configuración de preloading personalizada
export const routingConfig = {
  // Habilitar tracing para debugging (solo en desarrollo)
  enableTracing: false,
  
  // Estrategia de preloading personalizada
  preloadingStrategy: 'custom',
  
  // Configuración de chunks
  chunkConfig: {
    // Chunks críticos que se precargan
    critical: ['auth', 'dashboard'],
    
    // Chunks que se precargan en idle time
    preload: ['usuarios'],
    
    // Chunks que se cargan bajo demanda
    onDemand: ['reportes', 'configuracion', 'perfil', 'error']
  }
};