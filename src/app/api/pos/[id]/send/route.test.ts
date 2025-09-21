import { NextRequest } from 'next/server';
import { POST } from './route';

// Mock the notification service
jest.mock('@/lib/notification-service', () => ({
  notificationService: {
    sendPOSentToSupplierNotification: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('/api/pos/[id]/send', () => {
  describe('POST', () => {
    it('should send PO to supplier successfully', async () => {
      const requestBody = {
        supplier_email: 'supplier@example.com',
        message: 'Please find the attached Purchase Order.',
        sender_id: 'user-002',
        sender_name: 'Jane Smith'
      };

      const request = new NextRequest('http://localhost:3000/api/pos/po-001/send', {
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
      expect(data.message).toBe('PO sent to supplier successfully');
      expect(data.po).toBeDefined();
      expect(data.po.status).toBe('sent');
      expect(data.po.sent_at).toBeDefined();
      expect(data.po.sent_by).toBe('user-002');
    });

    it('should return 404 for non-existent PO', async () => {
      const requestBody = {
        supplier_email: 'supplier@example.com',
        message: 'Please find the attached Purchase Order.',
        sender_id: 'user-002',
        sender_name: 'Jane Smith'
      };

      const request = new NextRequest('http://localhost:3000/api/pos/non-existent/send', {
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

    it('should add status history entry when sent', async () => {
      const requestBody = {
        supplier_email: 'supplier@example.com',
        message: 'Please find the attached Purchase Order.',
        sender_id: 'user-002',
        sender_name: 'Jane Smith'
      };

      const request = new NextRequest('http://localhost:3000/api/pos/po-001/send', {
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
      expect(lastHistoryEntry.status).toBe('sent');
      expect(lastHistoryEntry.changed_by).toBe('user-002');
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/pos/po-001/send', {
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

