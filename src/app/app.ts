import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ExchangeDashboardComponent } from './components/dashboard/exchange-dashboard.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ExchangeDashboardComponent],
  template: `
    <app-exchange-dashboard />
    <router-outlet />
  `,
  styleUrl: './app.scss'
})
export class App {
  title = 'BRL Exchange Rate Dashboard';
}
