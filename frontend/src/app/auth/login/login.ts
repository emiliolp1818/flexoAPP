import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;
  
  // Signals para el estado del componente
  hidePassword = signal(true);
  isLoading = signal(false);
  errorMessage = signal('');
  showNetworkDiagnostic = signal(false);
  isDiagnosing = signal(false);
  diagnosticResults = signal<any>(null);
  networkInfo = signal<any>({
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'localhost',
    port: typeof window !== 'undefined' ? window.location.port : '4200',
    isNetworkAccess: typeof window !== 'undefined' ? (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') : false,
    apiUrl: 'https://localhost:7000/api/auth'
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      userCode: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      
      const credentials = {
        username: this.loginForm.value.userCode,
        password: this.loginForm.value.password
      };
      
      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set('Credenciales inválidas. Por favor, intenta de nuevo.');
        }
      });
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  fillTestCredentials(): void {
    this.loginForm.patchValue({
      userCode: 'admin',
      password: 'admin123'
    });
  }

  toggleNetworkDiagnostic(): void {
    this.showNetworkDiagnostic.set(!this.showNetworkDiagnostic());
    if (this.showNetworkDiagnostic()) {
      this.runNetworkDiagnostic();
    }
  }

  runNetworkDiagnostic(): void {
    this.isDiagnosing.set(true);
    
    const testUrls = [
      'https://localhost:7000/api/auth',
      'http://localhost:7000/api/auth',
      'https://localhost:5000/api/auth',
      'http://localhost:5000/api/auth'
    ];

    const results: any[] = [];
    let completed = 0;

    testUrls.forEach(url => {
      const startTime = Date.now();
      fetch(url + '/validate', { method: 'GET' })
        .then(response => {
          const responseTime = Date.now() - startTime;
          results.push({
            url,
            status: 'success',
            message: 'Servidor disponible',
            responseTime,
            error: null
          });
        })
        .catch(error => {
          results.push({
            url,
            status: 'error',
            message: 'No disponible',
            responseTime: null,
            error: error.message
          });
        })
        .finally(() => {
          completed++;
          if (completed === testUrls.length) {
            this.diagnosticResults.set({ connectivityResults: results });
            this.isDiagnosing.set(false);
          }
        });
    });
  }

  testLoginWithUrl(url: string): void {
    // Actualizar temporalmente la URL del servicio de auth
    this.authService.updateApiUrl(url);
    this.fillTestCredentials();
    this.onSubmit();
  }

  hasWorkingServer(): boolean {
    const results = this.diagnosticResults();
    return results?.connectivityResults?.some((r: any) => r.status === 'success') || false;
  }

  hasRespondingServers(): boolean {
    const results = this.diagnosticResults();
    return results?.connectivityResults?.some((r: any) => r.error === '404') || false;
  }
}
