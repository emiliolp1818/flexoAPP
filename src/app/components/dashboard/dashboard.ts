import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Header } from '../header/header';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [Header],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard {
  authService = inject(AuthService);
}
