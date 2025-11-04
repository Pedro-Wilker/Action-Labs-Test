
export interface CurrentExchangeResponse {
  success: boolean;
  lastUpdatedAt: string; 
  fromSymbol: string; 
  toSymbol: string; 
  exchangeRate: number;
}

export interface ApiErrorResponse {
  success: false;
  error?: string;
}


export interface CurrentRateParams {
  apiKey: string;
  from_symbol: string; 
  to_symbol: string;   
}


export interface CurrentExchangeRate {
  currency: string;    
  rate: number;        
  lastUpdated: Date;   
  fromSymbol: string; 
  toSymbol: string;     
}

export interface HistoricalRatePoint {
  date: Date;
  rate: number;
  currency: string;
}

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
    change: number;
    trend: 'up' | 'down' | 'stable'; 
  };
}

export interface HistoricalRateParams {
  apiKey: string;
  from_symbol: string;
  to_symbol: string;
  start_date?: string; 
  end_date?: string;   
  period?: number;     
}


export interface HistoricalExchangeResponse {
  success: boolean;
  currency: string;
  historicalData: Array<{
    date: string; 
    rate: number;
  }>;
  period: {
    start: string;
    end: string;
  };
}