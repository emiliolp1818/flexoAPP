import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatTooltipModule
  ],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil implements OnInit {
  user = signal<any>(null);
  loading = signal(false);
  activities = signal<any[]>([]);
  passwordForm: FormGroup;
  
  // Signals para contraseñas
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user.set(user);
    });
    this.loadActivities();
  }

  private loadActivities(): void {
    // Simular actividades del usuario
    const mockActivities = [
      {
        module: 'dashboard',
        action: 'Acceso al sistema',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
        daysRemaining: 30,
        isExpiringSoon: false
      },
      {
        module: 'maquinas',
        action: 'Consulta de máquinas',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        daysRemaining: 5,
        isExpiringSoon: true
      },
      {
        module: 'reportes',
        action: 'Generación de reporte',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        daysRemaining: 15,
        isExpiringSoon: false
      }
    ];
    this.activities.set(mockActivities);
  }

  refreshActivities(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.loadActivities();
      this.loading.set(false);
    }, 1000);
  }

  getActionIcon(module: string): string {
    const icons: { [key: string]: string } = {
      'dashboard': 'dashboard',
      'maquinas': 'precision_manufacturing',
      'reportes': 'assessment',
      'diseno': 'design_services',
      'informacion': 'info',
      'documentacion': 'description'
    };
    return icons[module] || 'work';
  }

  formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `Hace ${minutes} minutos`;
    if (hours < 24) return `Hace ${hours} horas`;
    return `Hace ${days} días`;
  }

  getDaysRemainingText(days: number): string {
    if (days <= 0) return 'Expirado';
    if (days === 1) return '1 día restante';
    return `${days} días restantes`;
  }

  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword.set(!this.showCurrentPassword());
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword.set(!this.showNewPassword());
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  onChangePassword(): void {
    if (this.passwordForm.valid) {
      this.loading.set(true);
      // Simular cambio de contraseña
      setTimeout(() => {
        this.loading.set(false);
        this.passwordForm.reset();
        alert('Contraseña cambiada exitosamente');
      }, 2000);
    }
  }
}
