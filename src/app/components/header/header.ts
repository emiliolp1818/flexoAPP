import { Component, ChangeDetectionStrategy, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserPhotoService } from '../../services/user-photo.service';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Header {
  authService = inject(AuthService);
  userPhotoService = inject(UserPhotoService);
  router = inject(Router);
  
  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;
  
  showUserMenu = signal(false);
  isUploadingPhoto = signal(false);

  onLogout() {
    this.authService.logout();
    this.showUserMenu.set(false);
  }

  getUserPhotoUrl(user: any): string {
    return this.userPhotoService.getUserPhotoUrl(user.fotoBase64);
  }

  onImageError(event: any) {
    event.target.src = '/assets/default-avatar.png';
  }

  toggleUserMenu() {
    this.showUserMenu.set(!this.showUserMenu());
  }

  openProfile() {
    this.router.navigate(['/profile']);
    this.showUserMenu.set(false);
  }

  openSettings() {
    this.router.navigate(['/settings']);
    this.showUserMenu.set(false);
  }

  openPhotoUpload() {
    this.photoInput.nativeElement.click();
    this.showUserMenu.set(false);
  }

  async onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es muy grande. Por favor selecciona una imagen menor a 5MB');
      return;
    }

    const user = this.authService.currentUser();
    if (!user) return;

    this.isUploadingPhoto.set(true);

    try {
      const success = await this.userPhotoService.updateUserPhoto(user.codigoUsuario, file);
      
      if (success) {
        // Convertir archivo a base64 para actualizar la UI inmediatamente
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = (e.target?.result as string)?.split(',')[1];
          if (base64) {
            // Actualizar el usuario en el servicio de auth
            const updatedUser = { ...user, fotoBase64: base64 };
            this.authService.currentUser.set(updatedUser);
            
            // Actualizar localStorage
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.setItem('flexo_user', JSON.stringify(updatedUser));
            }
          }
        };
        reader.readAsDataURL(file);
        
        console.log('Foto actualizada exitosamente');
      } else {
        alert('Error al actualizar la foto. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error al subir la foto. Intenta nuevamente.');
    } finally {
      this.isUploadingPhoto.set(false);
      // Limpiar el input
      input.value = '';
    }
  }

  constructor() {
    // Cerrar menú al hacer clic fuera
    if (typeof document !== 'undefined') {
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.user-menu') && this.showUserMenu()) {
          this.showUserMenu.set(false);
        }
      });
    }
  }
}
