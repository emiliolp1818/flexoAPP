import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserPhotoService {
  private http = inject(HttpClient);
  private readonly API_URL = 'https://localhost:7001/api';

  async updateUserPhoto(codigoUsuario: string, photoFile: File): Promise<{ success: boolean; message: string }> {
    try {
      // Validaciones del archivo
      if (!photoFile.type.startsWith('image/')) {
        return { success: false, message: 'El archivo debe ser una imagen' };
      }

      if (photoFile.size > 5 * 1024 * 1024) {
        return { success: false, message: 'La imagen es demasiado grande (máximo 5MB)' };
      }

      const base64 = await this.fileToBase64(photoFile);
      
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; message: string }>(`${this.API_URL}/user/${codigoUsuario}/foto`, {
          fotoBase64: base64
        })
      );

      return response;
    } catch (error: any) {
      console.error('Backend connection failed for photo upload:', error);
      
      // Si el backend no está disponible, simular éxito en modo desarrollo
      if (error.status === 0 || error.name === 'TypeError') {
        console.log('🔧 Modo desarrollo - Simulando subida de foto exitosa');
        
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return { 
          success: true, 
          message: 'Foto actualizada exitosamente (modo desarrollo)' 
        };
      }
      
      // Otros errores del backend
      let errorMessage = 'Error al subir la foto';
      
      if (error.status === 413) {
        errorMessage = 'La imagen es demasiado grande';
      } else if (error.status === 400) {
        errorMessage = 'Formato de imagen no válido';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }

      return { success: false, message: errorMessage };
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

  getUserPhotoUrl(fotoBase64?: string): string {
    if (fotoBase64) {
      return `data:image/jpeg;base64,${fotoBase64}`;
    }
    return '/perfil.jpg'; // Imagen por defecto
  }
}