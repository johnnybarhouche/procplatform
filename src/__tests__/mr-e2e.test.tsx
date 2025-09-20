/**
 * End-to-End Test for Material Request Creation
 * This test simulates the complete user journey from form submission to database storage
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MaterialRequestForm from '@/components/MaterialRequestForm';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Material Request E2E Flow', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('completes full MR creation flow with file upload', async () => {
    const mockProjects = [
      { id: '1', name: 'Project Alpha' },
      { id: '2', name: 'Project Beta' }
    ];

    // Mock file upload response
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          files: [
            { id: 'file-1', name: 'test.pdf', url: 'https://mock-storage.com/test.pdf' }
          ]
        })
      })
      // Mock MR creation response
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          mrId: 'mr-123',
          mrn: 'MR-001',
          message: 'Material Request created successfully'
        })
      });

    render(<MaterialRequestForm projects={mockProjects} />);

    // 1. Select project
    const projectSelect = screen.getByRole('combobox');
    fireEvent.change(projectSelect, { target: { value: '1' } });

    // 2. Fill in line item details
    const itemCodeInput = screen.getByDisplayValue('');
    fireEvent.change(itemCodeInput, { target: { value: 'ITEM001' } });

    const descriptionInputs = screen.getAllByDisplayValue('');
    fireEvent.change(descriptionInputs[1], { target: { value: 'Test Item Description' } });
    fireEvent.change(descriptionInputs[2], { target: { value: 'PCS' } });

    // 3. Upload a file
    const fileInput = screen.getByRole('button', { name: /file/i });
    const testFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [testFile] } });

    // Verify file appears in the list
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    // 4. Submit the form
    const submitButton = screen.getByText('Submit Material Request');
    fireEvent.click(submitButton);

    // 5. Verify API calls were made
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    // Verify file upload call
    expect(fetch).toHaveBeenNthCalledWith(1, '/api/upload', {
      method: 'POST',
      body: expect.any(FormData)
    });

    // Verify MR creation call
    expect(fetch).toHaveBeenNthCalledWith(2, '/api/mrs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: '1',
        lineItems: expect.arrayContaining([
          expect.objectContaining({
            itemCode: 'ITEM001',
            description: 'Test Item Description',
            uom: 'PCS'
          })
        ]),
        attachments: ['https://mock-storage.com/test.pdf']
      })
    });

    // 6. Verify success message
    await waitFor(() => {
      expect(screen.getByText(/Material Request created successfully/)).toBeInTheDocument();
    });

    // 7. Verify form is reset
    expect(screen.getByDisplayValue('')).toBeInTheDocument(); // Item code should be empty
  });

  it('handles API errors gracefully', async () => {
    const mockProjects = [{ id: '1', name: 'Project Alpha' }];

    // Mock API error
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Project not found' })
    });

    render(<MaterialRequestForm projects={mockProjects} />);

    // Fill form and submit
    const itemCodeInput = screen.getByDisplayValue('');
    fireEvent.change(itemCodeInput, { target: { value: 'ITEM001' } });

    const descriptionInputs = screen.getAllByDisplayValue('');
    fireEvent.change(descriptionInputs[1], { target: { value: 'Test Item' } });
    fireEvent.change(descriptionInputs[2], { target: { value: 'PCS' } });

    fireEvent.click(screen.getByText('Submit Material Request'));

    // Verify error handling
    await waitFor(() => {
      expect(screen.getByText(/Error: Project not found/)).toBeInTheDocument();
    });
  });

  it('validates required fields before submission', async () => {
    const mockProjects = [{ id: '1', name: 'Project Alpha' }];

    render(<MaterialRequestForm projects={mockProjects} />);

    // Try to submit without filling required fields
    fireEvent.click(screen.getByText('Submit Material Request'));

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
    });

    // API should not be called
    expect(fetch).not.toHaveBeenCalled();
  });

  it('handles multiple line items correctly', async () => {
    const mockProjects = [{ id: '1', name: 'Project Alpha' }];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, mrId: 'mr-123', mrn: 'MR-001' })
    });

    render(<MaterialRequestForm projects={mockProjects} />);

    // Add a second line item
    fireEvent.click(screen.getByText('Add Line Item'));

    // Fill first line item
    const itemCodeInputs = screen.getAllByDisplayValue('');
    fireEvent.change(itemCodeInputs[0], { target: { value: 'ITEM001' } });
    fireEvent.change(itemCodeInputs[1], { target: { value: 'Item 1' } });
    fireEvent.change(itemCodeInputs[2], { target: { value: 'PCS' } });

    // Fill second line item
    fireEvent.change(itemCodeInputs[3], { target: { value: 'ITEM002' } });
    fireEvent.change(itemCodeInputs[4], { target: { value: 'Item 2' } });
    fireEvent.change(itemCodeInputs[5], { target: { value: 'KG' } });

    fireEvent.click(screen.getByText('Submit Material Request'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/mrs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: '1',
          lineItems: expect.arrayContaining([
            expect.objectContaining({ itemCode: 'ITEM001' }),
            expect.objectContaining({ itemCode: 'ITEM002' })
          ]),
          attachments: []
        })
      });
    });
  });
});
