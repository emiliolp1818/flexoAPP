import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-banner',
  template: `
    <div class="page-banner">
      <div class="banner-content">
        <button class="back-button" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Regresar al Dashboard
        </button>
        
        <div class="banner-info">
          <div class="banner-icon">{{ icon }}</div>
          <div class="banner-text">
            <h1>{{ title }}</h1>
            <p>{{ subtitle }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-banner {
      background: linear-gradient(135deg, #0c4278 0%, #1565c0 100%);
      color: white;
      padding: 30px;
      margin-bottom: 30px;
      border-radius: 20px;
      box-shadow: 0 8px 30px rgba(12, 66, 120, 0.3);
    }

    .banner-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .back-button {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
      padding: 12px 20px;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .back-button:hover {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .banner-info {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .banner-icon {
      font-size: 3rem;
      opacity: 0.9;
    }

    .banner-text h1 {
      margin: 0 0 5px 0;
      font-size: 2rem;
      font-weight: 700;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }

    .banner-text p {
      margin: 0;
      font-size: 1.1rem;
      opacity: 0.9;
      font-weight: 300;
    }

    @media (max-width: 768px) {
      .page-banner {
        padding: 20px;
      }

      .banner-content {
        flex-direction: column;
        gap: 20px;
        text-align: center;
      }

      .back-button {
        align-self: flex-start;
      }

      .banner-info {
        flex-direction: column;
        gap: 15px;
        text-align: center;
      }

      .banner-icon {
        font-size: 2.5rem;
      }

      .banner-text h1 {
        font-size: 1.8rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageBanner {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() icon: string = '';

  private router = inject(Router);

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}