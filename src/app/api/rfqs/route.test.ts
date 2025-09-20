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

describe('/api/rfqs', () => {
  describe('GET', () => {
    it('returns all RFQs by default', async () => {
      const request = createMockRequest('http://localhost:3000/api/rfqs');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    it('filters RFQs by status', async () => {
      const request = createMockRequest('http://localhost:3000/api/rfqs?status=draft');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.every((rfq: { status: string }) => rfq.status === 'draft')).toBe(true);
    });

    it('filters RFQs by project ID', async () => {
      const request = createMockRequest('http://localhost:3000/api/rfqs?project_id=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.every((rfq: { material_request: { project_id: string } }) => rfq.material_request.project_id === '1')).toBe(true);
    });
  });

  describe('POST', () => {
    it('creates a new RFQ', async () => {
      const newRFQ = {
        material_request_id: '1',
        created_by: '1',
        created_by_name: 'Test User'
      };

      const request = createMockRequest('http://localhost:3000/api/rfqs', newRFQ);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.material_request_id).toBe(newRFQ.material_request_id);
      expect(data.status).toBe('draft');
      expect(data.rfq_number).toMatch(/^RFQ-\d{4}-\d{3}$/);
    });

    it('returns 404 for non-existent material request', async () => {
      const newRFQ = {
        material_request_id: '999',
        created_by: '1',
        created_by_name: 'Test User'
      };

      const request = createMockRequest('http://localhost:3000/api/rfqs', newRFQ);
      const response = await POST(request);

      expect(response.status).toBe(404);
    });
  });
});
