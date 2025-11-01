import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../../components/usuario-list/usuario-list.component')
      .then(m => m.UsuarioListComponent),
    data: { 
      title: 'Lista de Usuarios',
      preload: true,
      chunkName: 'usuarios-list'
    }
  },
  {
    path: 'crear',
    loadComponent: () => import('../../components/usuario-form/usuario-form.component')
      .then(m => m.UsuarioFormComponent),
    data: { 
      title: 'Crear Usuario',
      chunkName: 'usuarios-form'
    }
  },
  {
    path: 'editar/:id',
    loadComponent: () => import('../../components/usuario-form/usuario-form.component')
      .then(m => m.UsuarioFormComponent),
    data: { 
      title: 'Editar Usuario',
      chunkName: 'usuarios-form'
    }
  },
  {
    path: 'detalle/:id',
    loadComponent: () => import('../../components/usuario-detail/usuario-detail.component')
      .then(m => m.UsuarioDetailComponent),
    data: { 
      title: 'Detalle Usuario',
      chunkName: 'usuarios-detail'
    }
  },
  {
    path: 'estadisticas',
    loadComponent: () => import('../../components/usuario-stats/usuario-stats.component')
      .then(m => m.UsuarioStatsComponent),
    data: { 
      title: 'Estadísticas de Usuarios',
      chunkName: 'usuarios-stats'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuariosRoutingModule { }