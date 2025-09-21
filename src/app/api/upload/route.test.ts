import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock FormData
const createMockFormData = (files: File[]) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  return formData;
};

describe('/api/upload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uploads valid files successfully', async () => {
    const files = [
      new File(['test content'], 'test.pdf', { type: 'application/pdf' }),
      new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    ];

    const formData = createMockFormData(files);
    const request = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: formData
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.files).toHaveLength(2);
    expect(data.files[0]).toHaveProperty('name', 'test.pdf');
    expect(data.files[0]).toHaveProperty('url');
  });

  it('rejects files with invalid types', async () => {
    const files = [
      new File(['executable content'], 'malware.exe', { type: 'application/x-executable' })
    ];

    const formData = createMockFormData(files);
    const request = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: formData
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('File type application/x-executable not allowed');
  });

  it('rejects files that are too large', async () => {
    // Create a large file (11MB)
    const largeContent = 'x'.repeat(11 * 1024 * 1024);
    const files = [
      new File([largeContent], 'large.pdf', { type: 'application/pdf' })
    ];

    const formData = createMockFormData(files);
    const request = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: formData
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('is too large');
  });

  it('returns error when no files provided', async () => {
    const formData = new FormData();
    const request = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: formData
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('No files provided');
  });
});

