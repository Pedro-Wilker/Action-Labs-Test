import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExchangeApiService } from '../../services/exchange-api.service';
import { CurrentExchangeRate } from '../../models/exchange-rate.model';

@Component({
  selector: 'app-exchange-test',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exchange-test.html',
  styleUrl: './exchange-test.scss'
})
export class ExchangeTestComponent implements OnInit {
  private exchangeService = inject(ExchangeApiService);

  rates: CurrentExchangeRate[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit() {
    console.log('Componente de teste da API BRL Exchange inicializado');
  }

  loadRates() {
    this.loading = true;
    this.error = null;
    this.rates = [];

    console.log('Iniciando consulta à API BRL Exchange...');

    this.exchangeService.getAllCurrentRates().subscribe({
      next: (rates) => {
        this.rates = rates;
        this.loading = false;
        console.log('Taxas carregadas com sucesso:', rates);
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
        console.error('Erro ao carregar taxas:', err);
      }
    });
  }

  clearRates() {
    this.rates = [];
    this.error = null;
  }
}