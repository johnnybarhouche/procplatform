import { NextRequest } from 'next/server';
import { GET, POST } from './route';

// Mock NextRequest
const createMockRequest = (url: string, body?: unknown) => {
  const request = new NextRequest(url);
  if (body) {
    (request as unknown as { json: jest.Mock }).json = jest.fn().mockResolvedValue(body);
  }
  return request;
};

describe('/api/suppliers', () => {
  describe('GET', () => {
    it('returns all suppliers by default', async () => {
      const request = createMockRequest('http://localhost:3000/api/suppliers');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it('filters suppliers by category', async () => {
      const request = createMockRequest('http://localhost:3000/api/suppliers?category=Construction');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.every((supplier: { category: string }) => 
        supplier.category.toLowerCase().includes('construction')
      )).toBe(true);
    });

    it('filters suppliers by active status', async () => {
      const request = createMockRequest('http://localhost:3000/api/suppliers?is_active=true');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.every((supplier: { is_active: boolean }) => supplier.is_active)).toBe(true);
    });
  });

  describe('POST', () => {
    it('creates a new supplier', async () => {
      const newSupplier = {
        name: 'New Test Supplier',
        email: 'new@test.com',
        phone: '+971-4-123-4567',
        address: 'Test Address',
        category: 'Test Category'
      };

      const request = createMockRequest('http://localhost:3000/api/suppliers', newSupplier);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe(newSupplier.name);
      expect(data.email).toBe(newSupplier.email);
      expect(data.is_active).toBe(true);
    });

    it('handles invalid data gracefully', async () => {
      const invalidSupplier = {
        name: '', // Invalid empty name
        email: 'invalid-email'
      };

      const request = createMockRequest('http://localhost:3000/api/suppliers', invalidSupplier);
      const response = await POST(request);

      expect(response.status).toBe(201); // Should still create with defaults
    });
  });
});
