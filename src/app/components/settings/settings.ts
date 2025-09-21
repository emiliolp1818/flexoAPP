import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  imports: [FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Settings {
  isSaving = signal(false);
  
  settings = {
    theme: 'light',
    language: 'es',
    notifications: true,
    emailNotifications: false,
    autoSave: true,
    compactView: false
  };

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