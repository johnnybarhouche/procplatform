import { NextRequest } from 'next/server';
import { POST } from './route';
import { resetPOMockData } from '@/lib/mock-data/pos';

// Mock the notification service
jest.mock('@/lib/notification-service', () => ({
  notificationService: {
    sendPOSupplierAcknowledgmentNotification: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('/api/pos/[id]/acknowledge', () => {
  beforeEach(() => {
    resetPOMockData();
  });

  describe('POST', () => {
    it('should acknowledge PO successfully', async () => {
      const requestBody = {
        acknowledged_by: 'supplier-contact',
        acknowledgment_date: '2024-01-20T10:00:00Z',
        comments: 'PO received and acknowledged',
        estimated_delivery_date: '2024-02-15'
      };

      const request = new NextRequest('http://localhost:3000/api/pos/po-001/acknowledge', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request, { params: { id: 'po-001' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('PO acknowledgment recorded successfully');
      expect(data.po).toBeDefined();
      expect(data.po.status).toBe('acknowledged');
      expect(data.po.acknowledged_at).toBe('2024-01-20T10:00:00Z');
      expect(data.po.acknowledged_by).toBe('supplier-contact');
      expect(data.po.delivery_date).toBe('2024-02-15');
    });

    it('should return 400 if acknowledged_by is missing', async () => {
      const requestBody = {
        acknowledgment_date: '2024-01-20T10:00:00Z'
      };

      const request = new NextRequest('http://localhost:3000/api/pos/po-001/acknowledge', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request, { params: { id: 'po-001' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('acknowledged_by and acknowledgment_date are required');
    });

    it('should return 400 if acknowledgment_date is missing', async () => {
      const requestBody = {
        acknowledged_by: 'supplier-contact'
      };

      const request = new NextRequest('http://localhost:3000/api/pos/po-001/acknowledge', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request, { params: { id: 'po-001' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('acknowledged_by and acknowledgment_date are required');
    });

    it('should return 404 for non-existent PO', async () => {
      const requestBody = {
        acknowledged_by: 'supplier-contact',
        acknowledgment_date: '2024-01-20T10:00:00Z'
      };

      const request = new NextRequest('http://localhost:3000/api/pos/non-existent/acknowledge', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request, { params: { id: 'non-existent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Purchase Order not found');
    });

    it('should add status history entry when acknowledged', async () => {
      const requestBody = {
        acknowledged_by: 'supplier-contact',
        acknowledgment_date: '2024-01-20T10:00:00Z',
        comments: 'PO received and acknowledged'
      };

      const request = new NextRequest('http://localhost:3000/api/pos/po-001/acknowledge', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request, { params: { id: 'po-001' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.po.status_history).toBeDefined();
      expect(data.po.status_history.length).toBeGreaterThan(0);
      
      const lastHistoryEntry = data.po.status_history[data.po.status_history.length - 1];
      expect(lastHistoryEntry.status).toBe('acknowledged');
      expect(lastHistoryEntry.changed_by).toBe('supplier-contact');
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/pos/po-001/acknowledge', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request, { params: { id: 'po-001' } });
      expect(response.status).toBe(500);
    });
  });
});
