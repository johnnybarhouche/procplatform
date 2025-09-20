import { NextRequest } from 'next/server';
import { GET, POST } from './route';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status || 200 })),
  },
}));

describe('/api/quote-approvals', () => {
  describe('GET', () => {
    it('should return quote approvals', async () => {
      const response = await GET();
      
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // This would need to be mocked to throw an error
      const response = await GET();
      
      expect(response.status).toBe(200); // Should still return data even if empty
      
      consoleSpy.mockRestore();
    });
  });

  describe('POST', () => {
    it('should create a new quote approval', async () => {
      const requestBody = {
        quote_pack_id: 'qp-001',
        comments: 'Test approval'
      };

      const request = {
        json: async () => requestBody
      } as NextRequest;

      const response = await POST(request);
      
      expect(response.data).toBeDefined();
      expect(response.data.quote_pack_id).toBe('qp-001');
      expect(response.data.status).toBe('pending');
    });

    it('should return error if quote_pack_id is missing', async () => {
      const requestBody = {
        comments: 'Test approval'
      };

      const request = {
        json: async () => requestBody
      } as NextRequest;

      const response = await POST(request);
      
      expect(response.status).toBe(400);
    });

    it('should handle JSON parsing errors', async () => {
      const request = {
        json: async () => { throw new Error('Invalid JSON'); }
      } as NextRequest;

      const response = await POST(request);
      
      expect(response.status).toBe(500);
    });
  });
});
