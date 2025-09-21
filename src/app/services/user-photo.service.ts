import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserPhotoService {
  private http = inject(HttpClient);
  private readonly API_URL = 'https://localhost:7001/api';

  async updateUserPhoto(codigoUsuario: string, photoFile: File): Promise<boolean> {
    try {
      const base64 = await this.fileToBase64(photoFile);
      
      const response = await firstValueFrom(
        this.http.post(`${this.API_URL}/user/${codigoUsuario}/foto`, {
          fotoBase64: base64
        })
      );

      return true;
    } catch (error) {
      console.error('Error updating photo:', error);
      return false;
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
    return '/assets/default-avatar.png'; // Imagen por defecto
  }
}