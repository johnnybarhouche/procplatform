import { NextRequest } from 'next/server';
import { GET, POST, DELETE } from './route';

describe('/api/suppliers/[id]/compliance-docs', () => {
  describe('GET', () => {
    it('returns compliance documents for supplier', async () => {
      const request = new NextRequest('http://localhost:3000/api/suppliers/1');
      const response = await GET(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(1);
      expect(data[0].name).toBe('Trade License');
      expect(data[0].expiry_date).toBe('2025-12-31');
      expect(data[0].is_valid).toBe(true);
    });

    it('returns empty array for supplier with no compliance docs', async () => {
      const request = new NextRequest('http://localhost:3000/api/suppliers/2');
      const response = await GET(request, { params: { id: '2' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(0);
    });

    it('returns 404 for non-existent supplier', async () => {
      const request = new NextRequest('http://localhost:3000/api/suppliers/999');
      const response = await GET(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Supplier not found');
    });
  });

  describe('POST', () => {
    it('adds compliance document to supplier', async () => {
      const docData = {
        document_name: 'ISO 14001 Certificate',
        expiry_date: '2025-12-31',
        file_url: 'https://example.com/docs/iso-14001.pdf'
      };

      const request = new NextRequest('http://localhost:3000/api/suppliers/1', {
        method: 'POST',
        body: JSON.stringify(docData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe('Compliance document added successfully');
      expect(data.document.name).toBe('ISO 14001 Certificate');
      expect(data.document.url).toBe('https://example.com/docs/iso-14001.pdf');
      expect(data.document.expiry_date).toBe('2025-12-31');
      expect(data.document.is_valid).toBe(true);
    });

    it('adds expired compliance document', async () => {
      const docData = {
        document_name: 'Expired Certificate',
        expiry_date: '2024-01-01',
        file_url: 'https://example.com/docs/expired.pdf'
      };

      const request = new NextRequest('http://localhost:3000/api/suppliers/1', {
        method: 'POST',
        body: JSON.stringify(docData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.document.is_valid).toBe(false);
    });

    it('returns 404 for non-existent supplier', async () => {
      const docData = {
        document_name: 'Test Document',
        expiry_date: '2025-12-31',
        file_url: 'https://example.com/docs/test.pdf'
      };

      const request = new NextRequest('http://localhost:3000/api/suppliers/999', {
        method: 'POST',
        body: JSON.stringify(docData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Supplier not found');
    });

    it('handles invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/suppliers/1', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to add compliance document');
    });
  });

  describe('DELETE', () => {
    it('removes compliance document from supplier', async () => {
      const request = new NextRequest('http://localhost:3000/api/suppliers/1?docId=1', {
        method: 'DELETE'
      });

      const response = await DELETE(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Compliance document removed successfully');
    });

    it('returns 400 when docId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/suppliers/1', {
        method: 'DELETE'
      });

      const response = await DELETE(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Document ID is required');
    });

    it('returns 404 for non-existent supplier', async () => {
      const request = new NextRequest('http://localhost:3000/api/suppliers/999?docId=1', {
        method: 'DELETE'
      });

      const response = await DELETE(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Supplier not found');
    });

    it('handles removal of non-existent document', async () => {
      const request = new NextRequest('http://localhost:3000/api/suppliers/1?docId=999', {
        method: 'DELETE'
      });

      const response = await DELETE(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Compliance document removed successfully');
    });
  });
});

