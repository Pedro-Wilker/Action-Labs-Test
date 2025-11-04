/**
 * Exchange Rate Models - ESTRUTURA REAL DA API BRL EXCHANGE
 *
 * Baseado na documentação real da API:
 * - Endpoint: /open/currentExchangeRate
 * - Parâmetros: apiKey, from_symbol, to_symbol
 * - Resposta: success, lastUpdatedAt, fromSymbol, toSymbol, exchangeRate
 */

/**
 * Resposta real da API para taxa de câmbio atual
 * Estrutura conforme teste direto da API
 */
export interface CurrentExchangeResponse {
  success: boolean;
  lastUpdatedAt: string; // ISO date string "2025-11-03T03:00:00.000+00:00"
  fromSymbol: string;    // "BRL"
  toSymbol: string;      // "USD", "EUR", etc.
  exchangeRate: number;  // 0.18668
}

/**
 * Resposta de erro da API
 * Estrutura simplificada baseada no comportamento da API
 */
export interface ApiErrorResponse {
  success: false;
  error?: string;
}

/**
 * Parâmetros para requisição de taxa atual
 * Seguindo exatamente os parâmetros da documentação
 */
export interface CurrentRateParams {
  apiKey: string;
  from_symbol: string; // Sempre "BRL"
  to_symbol: string;   // "USD", "EUR", "GBP", "JPY", "CAD"
}

/**
 * Modelo de domínio para taxa de câmbio
 * Processado para consumo na UI
 */
export interface CurrentExchangeRate {
  currency: string;     // "USD", "EUR", etc.
  rate: number;         // Taxa de câmbio
  lastUpdated: Date;    // Data da última atualização
  fromSymbol: string;   // "BRL"
  toSymbol: string;     // Moeda de destino
}

/**
 * Ponto de dados históricos para uma data específica
 * Estrutura preparada para integração com API real
 */
export interface HistoricalRatePoint {
  date: Date;
  rate: number;
  currency: string;
}

/**
 * Conjunto completo de dados históricos para uma moeda
 * Inclui metadados do período e dados de tendência
 */
export interface HistoricalExchangeData {
  currency: string;
  rates: HistoricalRatePoint[];
  period: {
    start: Date;
    end: Date;
    days: number;
  };
  statistics: {
    min: number;
    max: number;
    average: number;
    change: number; // Variação percentual no período
    trend: 'up' | 'down' | 'stable'; // Tendência geral
  };
}

/**
 * Parâmetros para busca de dados históricos
 * Seguindo padrão da API atual
 */
export interface HistoricalRateParams {
  apiKey: string;
  from_symbol: string;
  to_symbol: string;
  start_date?: string; // Formato YYYY-MM-DD
  end_date?: string;   // Formato YYYY-MM-DD
  period?: number;     // Dias para buscar (alternativa a start/end)
}

/**
 * Resposta simulada da API para dados históricos
 * Estrutura preparada para quando o endpoint real estiver disponível
 */
export interface HistoricalExchangeResponse {
  success: boolean;
  currency: string;
  historicalData: Array<{
    date: string; // ISO date string
    rate: number;
  }>;
  period: {
    start: string;
    end: string;
  };
}