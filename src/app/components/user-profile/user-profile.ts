import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserPhotoService } from '../../services/user-photo.service';

@Component({
  selector: 'app-user-profile',
  imports: [FormsModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfile {
  authService = inject(AuthService);
  userPhotoService = inject(UserPhotoService);
  
  isEditing = signal(false);
  isSaving = signal(false);
  
  profileData = {
    nombre: '',
    apellido: '',
    rol: ''
  };

  constructor() {
    const user = this.authService.currentUser();
    if (user) {
      this.profileData = {
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol
      };
    }
  }

  toggleEdit() {
    this.isEditing.set(!this.isEditing());
  }

  async saveProfile() {
    this.isSaving.set(true);
    
    try {
      // TODO: Implementar guardado en backend
      console.log('Guardando perfil:', this.profileData);
      
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizar usuario en el servicio
      const currentUser = this.authService.currentUser();
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          nombre: this.profileData.nombre,
          apellido: this.profileData.apellido,
          rol: this.profileData.rol
        };
        this.authService.currentUser.set(updatedUser);
        
        // Actualizar localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('flexo_user', JSON.stringify(updatedUser));
        }
      }
      
      this.isEditing.set(false);
      alert('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error al guardar el perfil');
    } finally {
      this.isSaving.set(false);
    }
  }

  cancelEdit() {
    const user = this.authService.currentUser();
    if (user) {
      this.profileData = {
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol
      };
    }
    this.isEditing.set(false);
  }

  getUserPhotoUrl(): string {
    const user = this.authService.currentUser();
    return this.userPhotoService.getUserPhotoUrl(user?.fotoBase64);
  }
}