import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  user = signal<any>(null);
  currentTime = signal<string>('');
  currentUser = signal<any>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user.set(user);
      this.currentUser.set(user);
    });
    
    // Actualizar tiempo cada segundo
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
  }

  private updateTime(): void {
    const now = new Date();
    this.currentTime.set(now.toLocaleTimeString());
  }

  navigateToHome(): void {
    this.router.navigate(['/dashboard']);
  }

  getTimeIcon(): string {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'wb_sunny';
    if (hour >= 12 && hour < 18) return 'wb_sunny';
    if (hour >= 18 && hour < 22) return 'wb_twilight';
    return 'nights_stay';
  }

  getCurrentTime(): string {
    return this.currentTime();
  }

  getTimeBasedGreeting(): string {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'Buenos días';
    if (hour >= 12 && hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  getTimeBasedMessage(): string {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'Que tengas un excelente día';
    if (hour >= 12 && hour < 18) return 'Espero que tu tarde sea productiva';
    return 'Que descanses bien';
  }

  userDisplayName(): string {
    const user = this.user();
    if (!user) return 'Usuario';
    return user.nombreCompleto || user.username || 'Usuario';
  }

  getRoleDisplayName(role: string): string {
    const roles: { [key: string]: string } = {
      'Administrador': 'Administrador',
      'Supervisor': 'Supervisor',
      'Operador': 'Operador',
      'Consultor': 'Consultor'
    };
    return roles[role] || role;
  }

  onProfile(): void {
    this.router.navigate(['/perfil']);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
