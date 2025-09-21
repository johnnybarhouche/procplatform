import { GET as getDashboard } from '../../app/api/analytics/dashboard/route';
import { GET as getPRs } from '../../app/api/analytics/prs/route';
import { GET as getPOs } from '../../app/api/analytics/pos/route';
import { GET as getRFQs } from '../../app/api/analytics/rfqs/route';
import { GET as getSuppliers } from '../../app/api/analytics/suppliers/route';
import { GET as getPriceTrends } from '../../app/api/analytics/items/price-trends/route';
import { GET as getExport } from '../../app/api/analytics/export/route';
import { NextRequest } from 'next/server';

// Mock NextRequest
const mockRequest = (url: string, method: string, body?: Record<string, unknown>) => {
  const req = new NextRequest(new Request(url, { method, body: body ? JSON.stringify(body) : undefined }));
  return req;
};

describe('Analytics API Endpoints', () => {
  describe('/api/analytics/dashboard', () => {
    it('GET should return dashboard KPI data', async () => {
      const request = mockRequest('http://localhost/api/analytics/dashboard', 'GET');
      const response = await getDashboard(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('totalPRs');
      expect(data.data).toHaveProperty('totalPOs');
      expect(data.data).toHaveProperty('totalValue');
      expect(data.data).toHaveProperty('monthlyTrends');
      expect(Array.isArray(data.data.monthlyTrends)).toBe(true);
    });

    it('GET should handle date filters', async () => {
      const request = mockRequest('http://localhost/api/analytics/dashboard?startDate=2024-01-01&endDate=2024-06-30', 'GET');
      const response = await getDashboard(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.filters.dateRange.start).toBe('2024-01-01');
      expect(data.filters.dateRange.end).toBe('2024-06-30');
    });
  });

  describe('/api/analytics/prs', () => {
    it('GET should return PR analytics data', async () => {
      const request = mockRequest('http://localhost/api/analytics/prs', 'GET');
      const response = await getPRs(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('totalPRs');
      expect(data.data).toHaveProperty('pendingPRs');
      expect(data.data).toHaveProperty('approvedPRs');
      expect(data.data).toHaveProperty('rejectedPRs');
      expect(data.data).toHaveProperty('topRequesters');
      expect(Array.isArray(data.data.topRequesters)).toBe(true);
    });
  });

  describe('/api/analytics/pos', () => {
    it('GET should return PO analytics data', async () => {
      const request = mockRequest('http://localhost/api/analytics/pos', 'GET');
      const response = await getPOs(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('totalPOs');
      expect(data.data).toHaveProperty('totalValue');
      expect(data.data).toHaveProperty('monthlySpending');
      expect(data.data).toHaveProperty('topSuppliers');
      expect(Array.isArray(data.data.monthlySpending)).toBe(true);
      expect(Array.isArray(data.data.topSuppliers)).toBe(true);
    });
  });

  describe('/api/analytics/rfqs', () => {
    it('GET should return RFQ analytics data', async () => {
      const request = mockRequest('http://localhost/api/analytics/rfqs', 'GET');
      const response = await getRFQs(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('totalRFQs');
      expect(data.data).toHaveProperty('avgResponseRate');
      expect(data.data).toHaveProperty('avgResponseTime');
      expect(data.data).toHaveProperty('supplierEngagement');
      expect(Array.isArray(data.data.supplierEngagement)).toBe(true);
    });
  });

  describe('/api/analytics/suppliers', () => {
    it('GET should return supplier analytics data', async () => {
      const request = mockRequest('http://localhost/api/analytics/suppliers', 'GET');
      const response = await getSuppliers(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('totalSuppliers');
      expect(data.data).toHaveProperty('activeSuppliers');
      expect(data.data).toHaveProperty('shareOfSpend');
      expect(data.data).toHaveProperty('performanceRankings');
      expect(Array.isArray(data.data.shareOfSpend)).toBe(true);
      expect(Array.isArray(data.data.performanceRankings)).toBe(true);
    });
  });

  describe('/api/analytics/items/price-trends', () => {
    it('GET should return price trends data', async () => {
      const request = mockRequest('http://localhost/api/analytics/items/price-trends', 'GET');
      const response = await getPriceTrends(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      if (data.data.length > 0) {
        expect(data.data[0]).toHaveProperty('itemId');
        expect(data.data[0]).toHaveProperty('itemCode');
        expect(data.data[0]).toHaveProperty('itemName');
        expect(data.data[0]).toHaveProperty('currentPrice');
        expect(data.data[0]).toHaveProperty('priceHistory');
        expect(Array.isArray(data.data[0].priceHistory)).toBe(true);
      }
    });

    it('GET should filter by itemId', async () => {
      const request = mockRequest('http://localhost/api/analytics/items/price-trends?itemId=item-001', 'GET');
      const response = await getPriceTrends(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('/api/analytics/export', () => {
    it('GET should return CSV export', async () => {
      const request = mockRequest('http://localhost/api/analytics/export?format=csv', 'GET');
      const response = await getExport(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/csv');
      expect(response.headers.get('Content-Disposition')).toContain('attachment');
    });
  });
});
