import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DeskComponent } from './components/desk/desk.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DeskComponent],
  template: `
    <div class="app-container">
      <h1>RTLS Masa Takip Sistemi</h1>
      <app-desk></app-desk>
    </div>
  `,
  styles: [`
    .app-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }
    h1 { 
      text-align: center;
      margin-bottom: 30px;
      color: #333;
      font-size: 2em;
    }
  `]
})
export class AppComponent {
  title = 'my-angular-project';
}
