import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DeskComponent } from './components/desk/desk.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DeskComponent],
  template: `
    <h1>Masa Düzeni</h1>
    <app-desk></app-desk>
  `,
  styles: [`
    h1 { text-align: center; }
  `]
})
export class AppComponent {
  title = 'my-angular-project';
}
