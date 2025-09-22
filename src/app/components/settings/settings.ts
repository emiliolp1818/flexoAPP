import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Header } from '../header/header';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, Header],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Settings {
  authService = inject(AuthService);
  
  isSaving = signal(false);
  activeTab = signal('general');
  showAddUserModal = signal(false);
  
  settings = {
    theme: 'light',
    language: 'es',
    notifications: true,
    emailNotifications: false,
    autoSave: true,
    compactView: false
  };

  newUser = {
    codigoUsuario: '',
    nombre: '',
    apellido: '',
    rol: 'Usuario',
    contrasena: '',
    confirmarContrasena: ''
  };

  // Lista de usuarios simulada (reemplazar con datos del backend)
  users = signal([
    { codigoUsuario: 'admin', nombre: 'Administrador', apellido: 'Sistema', rol: 'Administrador', activo: true },
    { codigoUsuario: 'user', nombre: 'Usuario', apellido: 'Demo', rol: 'Usuario', activo: true },
    { codigoUsuario: 'test', nombre: 'Test', apellido: 'User', rol: 'Usuario', activo: false }
  ]);

  async saveSettings() {
    this.isSaving.set(true);
    
    try {
      // TODO: Implementar guardado en backend
      console.log('Guardando configuraciones:', this.settings);
      
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Guardar en localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('flexo_settings', JSON.stringify(this.settings));
      }
      
      alert('Configuraciones guardadas exitosamente');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error al guardar las configuraciones');
    } finally {
      this.isSaving.set(false);
    }
  }

  resetSettings() {
    if (confirm('¿Estás seguro de que quieres restaurar la configuración por defecto?')) {
      this.settings = {
        theme: 'light',
        language: 'es',
        notifications: true,
        emailNotifications: false,
        autoSave: true,
        compactView: false
      };
    }
  }

  setActiveTab(tab: string) {
    this.activeTab.set(tab);
  }

  openAddUserModal() {
    this.showAddUserModal.set(true);
    this.newUser = {
      codigoUsuario: '',
      nombre: '',
      apellido: '',
      rol: 'Usuario',
      contrasena: '',
      confirmarContrasena: ''
    };
  }

  closeAddUserModal() {
    this.showAddUserModal.set(false);
  }

  async addUser() {
    if (this.newUser.contrasena !== this.newUser.confirmarContrasena) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (!this.newUser.codigoUsuario || !this.newUser.nombre || !this.newUser.apellido || !this.newUser.contrasena) {
      alert('Por favor complete todos los campos');
      return;
    }

    try {
      // TODO: Implementar creación de usuario en backend
      console.log('Creando usuario:', this.newUser);
      
      // Simular creación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Agregar a la lista local
      const currentUsers = this.users();
      this.users.set([...currentUsers, {
        codigoUsuario: this.newUser.codigoUsuario,
        nombre: this.newUser.nombre,
        apellido: this.newUser.apellido,
        rol: this.newUser.rol,
        activo: true
      }]);
      
      this.closeAddUserModal();
      alert('Usuario creado exitosamente');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error al crear el usuario');
    }
  }

  toggleUserStatus(codigoUsuario: string) {
    const currentUsers = this.users();
    const updatedUsers = currentUsers.map(user => 
      user.codigoUsuario === codigoUsuario 
        ? { ...user, activo: !user.activo }
        : user
    );
    this.users.set(updatedUsers);
  }

  deleteUser(codigoUsuario: string) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      const currentUsers = this.users();
      const updatedUsers = currentUsers.filter(user => user.codigoUsuario !== codigoUsuario);
      this.users.set(updatedUsers);
    }
  }

  constructor() {
    // Cargar configuraciones guardadas
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedSettings = localStorage.getItem('flexo_settings');
      if (savedSettings) {
        try {
          this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      }
    }
  }
}