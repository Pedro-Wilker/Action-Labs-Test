import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import {
  CurrentExchangeResponse,
  CurrentExchangeRate,
  HistoricalExchangeData,
  HistoricalRatePoint,
} from '../models/exchange-rate.model';

@Injectable({
  providedIn: 'root'
})
export class ExchangeApiService {

  private http = inject(HttpClient);

  getCurrentRate(fromCurrency: string): Observable<CurrentExchangeRate> {
    const url = `${environment.apiBaseUrl}/open/currentExchangeRate`;
    const params = new HttpParams()
      .set('apiKey', environment.apiKey)
      .set('from_symbol', fromCurrency)
      .set('to_symbol', 'BRL');

    return this.http.get<CurrentExchangeResponse>(url, { params }).pipe(
      map(response => {
        if (!response.success) {
          throw new Error('Falha ao obter taxa de câmbio');
        }

        return {
          currency: fromCurrency,
          rate: response.exchangeRate,
          lastUpdated: new Date(response.lastUpdatedAt),
          fromSymbol: response.fromSymbol,
          toSymbol: response.toSymbol
        };
      }),
      catchError(this.handleError)
    );
  }

  getAllCurrentRates(): Observable<CurrentExchangeRate[]> {
    const requests = environment.supportedCurrencies.map(currency =>
      this.getCurrentRate(currency)
    );

    return forkJoin(requests).pipe(
      catchError(this.handleError)
    );
  }


  getHistoricalRates(toCurrency: string, days: number = 30): Observable<HistoricalExchangeData> {
    return this.getCurrentRate(toCurrency).pipe(
      map(currentRate => this.generateHistoricalData(currentRate, days))
    );
  }

 
  private generateHistoricalData(currentRate: CurrentExchangeRate, days: number): HistoricalExchangeData {
    const rates: HistoricalRatePoint[] = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let simulatedRate = currentRate.rate * (0.98 + Math.random() * 0.04);
    const rateValues: number[] = [];

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const dailyChange = (Math.random() - 0.5) * 0.04; 
      simulatedRate = simulatedRate * (1 + dailyChange);

      simulatedRate = Math.max(simulatedRate * 0.8, Math.min(simulatedRate * 1.2, simulatedRate));

      rateValues.push(simulatedRate);

      rates.push({
        date,
        rate: Number(simulatedRate.toFixed(4)),
        currency: currentRate.toSymbol
      });
    }

    const min = Math.min(...rateValues);
    const max = Math.max(...rateValues);
    const average = rateValues.reduce((sum, rate) => sum + rate, 0) / rateValues.length;
    const change = ((rateValues[rateValues.length - 1] - rateValues[0]) / rateValues[0]) * 100;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (change > 2) trend = 'up';
    else if (change < -2) trend = 'down';

    return {
      currency: currentRate.toSymbol,
      rates,
      period: {
        start: startDate,
        end: endDate,
        days
      },
      statistics: {
        min: Number(min.toFixed(4)),
        max: Number(max.toFixed(4)),
        average: Number(average.toFixed(4)),
        change: Number(change.toFixed(2)),
        trend
      }
    };
  }


  private handleError(error: HttpErrorResponse | Error): Observable<never> {
    let errorMessage: string;

    if (error instanceof HttpErrorResponse) {
      
      if (error.status === 0) {
        errorMessage = 'Erro de rede: Não foi possível conectar ao serviço de câmbio';
      } else {
        errorMessage = `Erro na API: ${error.message}`;
      }
    } else {
      errorMessage = `Erro na aplicação: ${error.message}`;
    }

    console.error('Erro no Serviço de Câmbio:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}