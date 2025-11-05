import { Component, Input, OnInit, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExchangeApiService } from '../../services/exchange-api.service';
import { HistoricalExchangeData, HistoricalRatePoint } from '../../models/exchange-rate.model';


@Component({
  selector: 'app-historical-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historical-chart.component.html',
  styleUrls: ['./historical-chart.component.scss']
})
export class HistoricalChartComponent implements OnInit, OnChanges {
  @Input() currency!: string;
  @Input() initialPeriod: number = 30;

  private exchangeService = inject(ExchangeApiService);

  historicalData = signal<HistoricalExchangeData | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  periodDays = this.initialPeriod;
  chartWidth = 600;
  chartHeight = 200;
  padding = { top: 20, right: 30, bottom: 40, left: 50 };

  chartPath = '';
  dataPoints: Array<{ x: number, y: number, date: string, rate: number }> = [];
  gridLines = { x: [] as number[], y: [] as number[] };
  xAxisLabels: Array<{ x: number, text: string }> = [];
  yAxisLabels: Array<{ y: number, text: string }> = [];

  ngOnInit() {
    this.loadHistoricalData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currency'] && !changes['currency'].firstChange) {
      this.loadHistoricalData();
    }
  }

  loadHistoricalData() {
    if (!this.currency) return;

    this.loading.set(true);
    this.error.set(null);

    this.exchangeService.getHistoricalRates(this.currency, this.periodDays).subscribe({
      next: (data) => {
        this.historicalData.set(data);
        this.calculateChartData(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }


  private calculateChartData(data: HistoricalExchangeData) {
    if (!data.rates.length) return;

    const rates = data.rates;
    const values = rates.map(r => r.rate);

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue;

    const plotWidth = this.chartWidth - this.padding.left - this.padding.right;
    const plotHeight = this.chartHeight - this.padding.top - this.padding.bottom;

    this.dataPoints = rates.map((rate, index) => {
      const x = this.padding.left + (index / (rates.length - 1)) * plotWidth;
      const y = this.padding.top + plotHeight - ((rate.rate - minValue) / valueRange) * plotHeight;

      return {
        x,
        y,
        date: rate.date.toLocaleDateString('pt-BR'),
        rate: rate.rate
      };
    });

    this.chartPath = this.dataPoints
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');

    this.calculateGridLines(plotWidth, plotHeight);
    this.calculateAxisLabels(rates, minValue, maxValue, plotWidth, plotHeight);
  }

  private calculateGridLines(plotWidth: number, plotHeight: number) {
    this.gridLines.x = [];
    this.gridLines.y = [];

    for (let i = 0; i <= 4; i++) {
      this.gridLines.x.push(this.padding.left + (i / 4) * plotWidth);
    }

    for (let i = 0; i <= 4; i++) {
      this.gridLines.y.push(this.padding.top + (i / 4) * plotHeight);
    }
  }


  private calculateAxisLabels(
    rates: HistoricalRatePoint[],
    minValue: number,
    maxValue: number,
    plotWidth: number,
    plotHeight: number
  ) {
    this.xAxisLabels = [];
    if (rates.length > 0) {
      const step = Math.max(1, Math.floor(rates.length / 4));
      for (let i = 0; i < rates.length; i += step) {
        this.xAxisLabels.push({
          x: this.padding.left + (i / (rates.length - 1)) * plotWidth,
          text: rates[i].date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })
        });
      }
    }

    this.yAxisLabels = [];
    for (let i = 0; i <= 4; i++) {
      const value = minValue + (i / 4) * (maxValue - minValue);
      this.yAxisLabels.push({
        y: this.padding.top + plotHeight - (i / 4) * plotHeight,
        text: value.toFixed(4)
      });
    }
  }

  changePeriod(days: number) {
    this.periodDays = days;
    this.loadHistoricalData();
  }

  getStatistics() {
    const data = this.historicalData();
    if (!data) return [];

    const stats = data.statistics;

    return [
      {
        label: 'Atual',
        value: data.rates[data.rates.length - 1]?.rate.toFixed(4) || '0.0000',
        colorClass: 'text-primary'
      },
      {
        label: 'Média',
        value: stats.average.toFixed(4),
        colorClass: 'text-primary'
      },
      {
        label: 'Variação',
        value: `${stats.change > 0 ? '+' : ''}${stats.change}%`,
        colorClass: stats.change > 0 ? 'text-success' : stats.change < 0 ? 'text-danger' : 'text-primary'
      },
      {
        label: 'Tendência',
        value: this.getTrendLabel(stats.trend),
        colorClass: stats.trend === 'up' ? 'text-success' : stats.trend === 'down' ? 'text-danger' : 'text-primary'
      }
    ];
  }

  private getTrendLabel(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up': return '↑ Alta';
      case 'down': return '↓ Baixa';
      default: return '→ Estável';
    }
  }
}