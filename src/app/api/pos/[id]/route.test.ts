import { NextRequest } from 'next/server';
import { GET, PUT } from './route';

describe('/api/pos/[id]', () => {
  describe('GET', () => {
    it('should return PO details for valid ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/pos/po-001');
      const response = await GET(request, { params: { id: 'po-001' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('id', 'po-001');
      expect(data).toHaveProperty('po_number');
      expect(data).toHaveProperty('project_id');
      expect(data).toHaveProperty('supplier_id');
      expect(data).toHaveProperty('status');
    });

    it('should return 404 for non-existent PO', async () => {
      const request = new NextRequest('http://localhost:3000/api/pos/non-existent');
      const response = await GET(request, { params: { id: 'non-existent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Purchase Order not found');
    });
  });

  describe('PUT', () => {
    it('should update PO status', async () => {
      const requestBody = {
        status: 'sent',
        comments: 'Updated status',
        delivery_date: '2024-02-01',
        actor_id: 'user-002',
        actor_name: 'Jane Smith'
      };

      const request = new NextRequest('http://localhost:3000/api/pos/po-001', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PUT(request, { params: { id: 'po-001' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('sent');
      expect(data.comments).toBe('Updated status');
      expect(data.delivery_date).toBe('2024-02-01');
    });

    it('should add status history entry when status changes', async () => {
      const requestBody = {
        status: 'acknowledged',
        actor_id: 'user-002',
        actor_name: 'Jane Smith'
      };

      const request = new NextRequest('http://localhost:3000/api/pos/po-001', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PUT(request, { params: { id: 'po-001' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('acknowledged');
      expect(data.status_history).toBeDefined();
      expect(data.status_history.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent PO', async () => {
      const requestBody = {
        status: 'sent',
        actor_id: 'user-002',
        actor_name: 'Jane Smith'
      };

      const request = new NextRequest('http://localhost:3000/api/pos/non-existent', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PUT(request, { params: { id: 'non-existent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Purchase Order not found');
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/pos/po-001', {
        method: 'PUT',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PUT(request, { params: { id: 'po-001' } });
      expect(response.status).toBe(500);
    });
  });
});
