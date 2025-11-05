
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { ExchangeApiService } from './exchange-api.service';
import { environment } from '../../environments/environment';
import { CurrentExchangeRate, HistoricalRequestParams } from '../models/exchange-rate.model';

describe('ExchangeApiService', () => {
  let service: ExchangeApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExchangeApiService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ExchangeApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); 
  });

  describe('getCurrentRates', () => {
    it('should return transformed current exchange rates', (done) => {
      const mockApiResponse = {
        success: true,
        timestamp: 1609459200,
        date: '2024-01-01',
        base: 'BRL',
        rates: {
          'USD': 0.18,
          'EUR': 0.16,
          'GBP': 0.14,
          'JPY': 26.5,
          'CAD': 0.24,
          'AUD': 0.26 
        }
      };

      service.getCurrentRates().subscribe({
        next: (rates: CurrentExchangeRate[]) => {
        
          expect(rates.length).toBe(5); 
          expect(rates.find(r => r.currency === 'USD')).toBeTruthy();
          expect(rates.find(r => r.currency === 'AUD')).toBeFalsy(); 
          expect(rates[0].lastUpdated).toBeInstanceOf(Date);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/latest?access_key=${environment.apiKey}&base=BRL`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockApiResponse);
    });

    it('should handle API error responses', (done) => {
      
      service.getCurrentRates().subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          
          expect(error.message).toContain('Failed to fetch current rates');
          done();
        }
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/latest?access_key=${environment.apiKey}&base=BRL`
      );
      req.flush({ success: false }); 
    });

    it('should handle HTTP errors', (done) => {
     
      service.getCurrentRates().subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          
          expect(error.message).toContain('Network error');
          done();
        }
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/latest?access_key=${environment.apiKey}&base=BRL`
      );
      req.error(new ProgressEvent('Network error'), { status: 0 });
    });

    it('should handle rate limit errors with user-friendly message', (done) => {
     
      service.getCurrentRates().subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          
          expect(error.message).toContain('Rate limit exceeded');
          done();
        }
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/latest?access_key=${environment.apiKey}&base=BRL`
      );
      req.flush({}, { status: 429, statusText: 'Too Many Requests' });
    });
  });

  describe('getHistoricalRates', () => {
    it('should return historical exchange data', (done) => {
      
      const params: HistoricalRequestParams = {
        currency: 'USD',
        days: 7
      };

      const mockApiResponse = {
        success: true,
        timestamp: 1609459200,
        date: '2024-01-01',
        base: 'BRL',
        rates: [
          { date: '2023-12-25', rate: 0.17, currency: 'USD' },
          { date: '2023-12-26', rate: 0.175, currency: 'USD' }
        ],
        targetCurrency: 'USD'
      };

      service.getHistoricalRates(params).subscribe({
        next: (historicalData) => {
          
          expect(historicalData.currency).toBe('USD');
          expect(historicalData.rates.length).toBe(2);
          expect(historicalData.period.days).toBe(7);
          done();
        },
        error: done.fail
      });

      const expectedStartDate = new Date();
      expectedStartDate.setDate(expectedStartDate.getDate() - 7);
      const expectedStartDateStr = expectedStartDate.toISOString().split('T')[0];

      const req = httpMock.expectOne(
        req => req.url === `${environment.apiBaseUrl}/timeseries` &&
               req.params.get('symbols') === 'USD' &&
               req.params.get('start_date') === expectedStartDateStr
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockApiResponse);
    });

    it('should handle historical API errors', (done) => {
    
      const params: HistoricalRequestParams = {
        currency: 'EUR',
        days: 30
      };

      service.getHistoricalRates(params).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
         
          expect(error.message).toContain('Failed to fetch historical rates');
          done();
        }
      });

      const req = httpMock.expectOne(
        req => req.url === `${environment.apiBaseUrl}/timeseries`
      );
      req.flush({ success: false });
    });
  });

  describe('Rate Limiting', () => {
    it('should space API calls with minimum delay', (done) => {
      const startTime = Date.now();
      let callCount = 0;

      service.getCurrentRates().subscribe(() => {
        callCount++;
        if (callCount === 2) {
          const endTime = Date.now();
          const elapsed = endTime - startTime;

          expect(elapsed).toBeGreaterThanOrEqual(environment.rateLimitDelay);
          done();
        }
      });

      service.getCurrentRates().subscribe(() => {
        callCount++;
        if (callCount === 2) {
          const endTime = Date.now();
          const elapsed = endTime - startTime;

          expect(elapsed).toBeGreaterThanOrEqual(environment.rateLimitDelay);
          done();
        }
      });

      const requests = httpMock.match(`${environment.apiBaseUrl}/latest?access_key=${environment.apiKey}&base=BRL`);
      expect(requests.length).toBe(2);

      requests[0].flush({
        success: true,
        timestamp: 1609459200,
        date: '2024-01-01',
        base: 'BRL',
        rates: { 'USD': 0.18 }
      });

      setTimeout(() => {
        requests[1].flush({
          success: true,
          timestamp: 1609459201,
          date: '2024-01-01',
          base: 'BRL',
          rates: { 'USD': 0.18 }
        });
      }, environment.rateLimitDelay);
    });
  });

  describe('Error Retry Logic', () => {
    it('should retry on network errors', (done) => {
      let retryCount = 0;

      service.getCurrentRates().subscribe({
        next: () => {
          expect(retryCount).toBe(2); 
          done();
        },
        error: done.fail
      });

      const requests = httpMock.match(
        `${environment.apiBaseUrl}/latest?access_key=${environment.apiKey}&base=BRL`
      );

      requests[0].error(new ProgressEvent('Network error'), { status: 0 });
      requests[1].error(new ProgressEvent('Network error'), { status: 0 });

      requests[2].flush({
        success: true,
        timestamp: 1609459200,
        date: '2024-01-01',
        base: 'BRL',
        rates: { 'USD': 0.18 }
      });

      retryCount = requests.length;
    });

    it('should not retry on client errors (4xx)', (done) => {
      service.getCurrentRates().subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.message).toContain('API error');
          done();
        }
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/latest?access_key=${environment.apiKey}&base=BRL`
      );
      req.flush({ error: 'Invalid API key' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('Mock Data Mode', () => {
    beforeEach(() => {
      environment.mockApiResponses = true;
    });

    afterEach(() => {
      environment.mockApiResponses = false;
    });

    it('should use mock data when enabled', (done) => {
      spyOn(console, 'log'); 

      service.getCurrentRates().subscribe({
        next: (rates) => {
          expect(rates.length).toBeGreaterThan(0);
          expect(console.log).toHaveBeenCalledWith('Using mock API response for development');
          done();
        },
        error: done.fail
      });
      httpMock.expectNone(`${environment.apiBaseUrl}/latest`);
    });
  });
});