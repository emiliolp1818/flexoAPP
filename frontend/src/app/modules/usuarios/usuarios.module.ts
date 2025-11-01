import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosRoutingModule } from './usuarios-routing.module';

// Módulo lazy para usuarios con chunks optimizados
@NgModule({
  imports: [
    CommonModule,
    UsuariosRoutingModule
  ],
  providers: []
})
export class UsuariosModule { 

  // Preload de componentes críticos
  static preloadComponents() {
    return Promise.all([
      import('../../components/usuario-list/usuario-list.component'),
      import('../../services/usuario.service')
    ]);
  }
}