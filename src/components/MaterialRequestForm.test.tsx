import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MaterialRequestForm from './MaterialRequestForm';

const mockProjects = [
  { id: '1', name: 'Project Alpha' },
  { id: '2', name: 'Project Beta' }
];

const mockOnSubmit = jest.fn();

describe('MaterialRequestForm', () => {
  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders the form with all required fields', () => {
    render(<MaterialRequestForm projects={mockProjects} onSubmit={mockOnSubmit} />);
    
    expect(screen.getByText('Create Material Request')).toBeInTheDocument();
    expect(screen.getByText('Project Selection')).toBeInTheDocument();
    expect(screen.getByText('Line Items')).toBeInTheDocument();
    expect(screen.getAllByText('Attachments')).toHaveLength(2); // Table header and card header
  });

  it('auto-selects project when only one project is available', () => {
    const singleProject = [{ id: '1', name: 'Single Project' }];
    render(<MaterialRequestForm projects={singleProject} onSubmit={mockOnSubmit} />);
    
    expect(screen.getByText('Project:')).toBeInTheDocument();
    expect(screen.getByText('Single Project')).toBeInTheDocument();
  });

  it('shows project dropdown when multiple projects are available', () => {
    render(<MaterialRequestForm projects={mockProjects} onSubmit={mockOnSubmit} />);
    
    expect(screen.getAllByRole('combobox')).toHaveLength(2); // Project selector and UoM selector
    expect(screen.getByText('Select a project')).toBeInTheDocument();
  });

  it('allows adding and removing line items', () => {
    render(<MaterialRequestForm projects={mockProjects} onSubmit={mockOnSubmit} />);
    
    // Should start with one line item
    expect(screen.getByText(/Line Item 1/)).toBeInTheDocument();
    
    // Add another line item
    fireEvent.click(screen.getByText('Add Line Item'));
    expect(screen.getByText(/Line Item 2/)).toBeInTheDocument();
    
    // Remove the second line item (there should be Remove Line buttons for both items now)
    const removeButtons = screen.getAllByText('Remove Line');
    expect(removeButtons).toHaveLength(2); // Both line items now have remove buttons
    fireEvent.click(removeButtons[1]); // Click the second remove button (for the second line item)
    expect(screen.queryByText(/Line Item 2/)).not.toBeInTheDocument();
  });

  it('validates required fields before submission', async () => {
    render(<MaterialRequestForm projects={mockProjects} onSubmit={mockOnSubmit} />);
    
    // Try to submit without filling required fields
    fireEvent.click(screen.getByText('Submit Material Request'));
    
    // Should show validation error (alert)
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('submits form with valid data', async () => {
    render(<MaterialRequestForm projects={mockProjects} onSubmit={mockOnSubmit} />);
    
    // Select project (first combobox)
    const projectSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(projectSelect, { target: { value: '1' } });
    
    // Fill required line item fields using label text
    const itemCodeInput = screen.getByLabelText(/Line Item 1/);
    fireEvent.change(itemCodeInput, { target: { value: 'ITEM001' } });
    
    const descriptionInput = screen.getByLabelText(/Description/);
    fireEvent.change(descriptionInput, { target: { value: 'Test Item' } });
    
    const uomInput = screen.getAllByRole('combobox')[1];
    fireEvent.change(uomInput, { target: { value: 'EA' } });
    
    // Submit form
    fireEvent.click(screen.getByText('Submit Material Request'));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        projectId: '1',
        lineItems: expect.arrayContaining([
          expect.objectContaining({
            itemCode: 'ITEM001',
            description: 'Test Item',
            uom: 'EA'
          })
        ]),
        attachments: []
      });
    });
  });

  it('handles file uploads', () => {
    render(<MaterialRequestForm projects={mockProjects} onSubmit={mockOnSubmit} />);
    
    // Get the hidden file input for line items
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
  });

  it('allows removing uploaded files', () => {
    render(<MaterialRequestForm projects={mockProjects} onSubmit={mockOnSubmit} />);
    
    // Get the hidden file input for line items
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Remove'));
    expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
  });
});

