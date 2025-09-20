import { POST, GET } from './route';
import { NextRequest } from 'next/server';

// Mock NextRequest
const createMockRequest = (body: unknown) => {
  return {
    json: async () => body
  } as NextRequest;
};

describe('/api/mrs', () => {
  beforeEach(() => {
    // Reset mock data before each test
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('creates a new material request with valid data', async () => {
      const requestBody = {
        projectId: 'project-1',
        lineItems: [
          {
            id: '1',
            itemCode: 'ITEM001',
            description: 'Test Item',
            uom: 'PCS',
            qty: 5,
            remarks: 'Test remarks',
            location: 'Warehouse A',
            brandAsset: 'Brand X',
            serialChassisEngineNo: 'SN123',
            modelYear: '2024'
          }
        ],
        attachments: []
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.mrId).toMatch(/^MR-\d+$/);
      expect(data.message).toBe('Material Request created successfully');
    });

    it('returns 400 for missing project ID', async () => {
      const requestBody = {
        lineItems: [
          {
            id: '1',
            itemCode: 'ITEM001',
            description: 'Test Item',
            uom: 'PCS',
            qty: 5,
            remarks: '',
            location: '',
            brandAsset: '',
            serialChassisEngineNo: '',
            modelYear: ''
          }
        ]
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Project ID and line items are required');
    });

    it('returns 400 for empty line items', async () => {
      const requestBody = {
        projectId: 'project-1',
        lineItems: []
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Project ID and line items are required');
    });

    it('returns 400 for invalid line item data', async () => {
      const requestBody = {
        projectId: 'project-1',
        lineItems: [
          {
            id: '1',
            itemCode: '', // Missing required field
            description: 'Test Item',
            uom: 'PCS',
            qty: 0, // Invalid quantity
            remarks: '',
            location: '',
            brandAsset: '',
            serialChassisEngineNo: '',
            modelYear: ''
          }
        ]
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('All line items must have itemCode, description, uom, and qty > 0');
    });
  });

  describe('GET', () => {
    it('returns all material requests', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.mrs)).toBe(true);
      expect(typeof data.total).toBe('number');
    });
  });
});
