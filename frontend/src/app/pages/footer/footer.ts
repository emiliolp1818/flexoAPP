import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {

}
