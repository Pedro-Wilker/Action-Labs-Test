import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExchangeApiService } from '../../services/exchange-api.service';
import { CurrentExchangeRate } from '../../models/exchange-rate.model';


@Component({
  selector: 'app-exchange-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exchange-dashboard.component.html',
  styleUrls: ['./exchange-dashboard.component.scss']
})
export class ExchangeDashboardComponent implements OnInit {
  private exchangeService = inject(ExchangeApiService);

  currentRate = signal<CurrentExchangeRate | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  showHistory = signal(false);
  historicalData = signal<any[]>([]);
  currencyCode = ''; 

  ngOnInit() {
 
  }


  searchExchangeRate() {
    const code = this.currencyCode.trim().toUpperCase();

    if (!code || code.length !== 3) {
      this.error.set('Por favor, insira um código de moeda válido (3 letras)');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.currentRate.set(null);
    this.showHistory.set(false);


    this.exchangeService.getCurrentRate(code).subscribe({
      next: (rate) => {
        this.currentRate.set(rate);
        this.loading.set(false);
        this.generateHistoricalData(rate);
    
      },
      error: (err) => {
        this.error.set(err.message || 'Erro ao buscar taxa de câmbio');
        this.loading.set(false);
        console.error('Erro ao buscar taxa:', err);
      }
    });
  }

 
  toggleHistory() {
    this.showHistory.set(!this.showHistory());

  }

 
  private generateHistoricalData(currentRate: CurrentExchangeRate) {
    const historical = [];
    const baseRate = currentRate.rate;
    const today = new Date();

    for (let i = 30; i >= 1; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const variation = (Math.random() - 0.5) * 0.1; 
      const dayRate = baseRate * (1 + variation);

      const open = dayRate * (1 + (Math.random() - 0.5) * 0.02);
      const high = Math.max(open, dayRate) * (1 + Math.random() * 0.01);
      const low = Math.min(open, dayRate) * (1 - Math.random() * 0.01);
      const close = dayRate;
      const closeDiff = ((close - open) / open) * 100;

      historical.push({
        date,
        open: parseFloat(open.toFixed(4)),
        high: parseFloat(high.toFixed(4)),
        low: parseFloat(low.toFixed(4)),
        close: parseFloat(close.toFixed(4)),
        closeDiff: parseFloat(closeDiff.toFixed(2))
      });
    }

    this.historicalData.set(historical);
  }
}