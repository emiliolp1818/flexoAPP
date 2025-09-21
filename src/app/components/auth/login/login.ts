import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  loginData = {
    codigoUsuario: '',
    contrasena: ''
  };

  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  async onLogin() {
    if (!this.loginData.codigoUsuario || !this.loginData.contrasena) {
      this.errorMessage.set('Por favor complete todos los campos');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const result = await this.authService.login(this.loginData);
      
      if (result.success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage.set(result.message);
      }
    } catch (error) {
      this.errorMessage.set('Error de conexión. Intente nuevamente.');
      console.error('Login error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }
}
