import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExchangeApiService } from '../../services/exchange-api.service';
import { CurrentExchangeRate } from '../../models/exchange-rate.model';

@Component({
  selector: 'app-exchange-test',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exchange-test.component.html',
  styleUrls: ['./exchange-test.component.scss']
})
export class ExchangeTestComponent implements OnInit {
  private exchangeService = inject(ExchangeApiService);

  rates: CurrentExchangeRate[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit() {

  }

  loadRates() {
    this.loading = true;
    this.error = null;
    this.rates = [];


    this.exchangeService.getAllCurrentRates().subscribe({
      next: (rates) => {
        this.rates = rates;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  clearRates() {
    this.rates = [];
    this.error = null;
  }
}