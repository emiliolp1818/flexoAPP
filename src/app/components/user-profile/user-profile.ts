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
  isUploadingPhoto = signal(false);
  
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

  async onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor seleccione un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 5MB');
      return;
    }

    const user = this.authService.currentUser();
    if (!user) return;

    this.isUploadingPhoto.set(true);

    try {
      const result = await this.userPhotoService.updateUserPhoto(user.codigoUsuario, file);
      
      if (result.success) {
        // Convertir archivo a base64 para mostrar inmediatamente
        const base64 = await this.fileToBase64(file);
        
        // Actualizar usuario con nueva foto
        const updatedUser = {
          ...user,
          fotoBase64: base64
        };
        
        this.authService.currentUser.set(updatedUser);
        
        // Actualizar localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('flexo_user', JSON.stringify(updatedUser));
        }
        
        alert('Foto actualizada exitosamente');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error inesperado al subir la foto');
    } finally {
      this.isUploadingPhoto.set(false);
      // Limpiar el input
      input.value = '';
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1]; // Remover el prefijo data:image/...;base64,
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }
}