import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ApprovalMatrix from '@/components/approvals/ApprovalMatrix';
import { AuthorizationMatrix, PRApproval } from '@/types/procurement';

// Mock data
const mockMatrix: AuthorizationMatrix[] = [
  {
    id: 'matrix-1',
    project_id: 'proj-1',
    approval_level: 1,
    approver_role: 'Project Manager',
    threshold_min: 0,
    threshold_max: 10000,
    currency: 'AED',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'matrix-2',
    project_id: 'proj-1',
    approval_level: 2,
    approver_role: 'Finance Director',
    threshold_min: 10000,
    threshold_max: 50000,
    currency: 'AED',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }
];

const mockApprovals: PRApproval[] = [
  {
    id: 'approval-1',
    pr_id: 'pr-1',
    approval_level: 1,
    approver_id: 'user-1',
    approver_name: 'John Manager',
    approved_at: '2025-01-02T10:00:00Z',
    comments: 'Approved for project needs'
  }
];

describe('ApprovalMatrix', () => {
  it('renders approval matrix with correct structure', () => {
    render(
      <ApprovalMatrix
        matrix={mockMatrix}
        approvals={mockApprovals}
        currentLevel={2}
        currency="AED"
      />
    );

    expect(screen.getByText('Approval Matrix')).toBeInTheDocument();
    expect(screen.getByText('Multi-step approval thresholds derived from project authorization matrix.')).toBeInTheDocument();
  });

  it('displays approval levels with correct status', () => {
    render(
      <ApprovalMatrix
        matrix={mockMatrix}
        approvals={mockApprovals}
        currentLevel={2}
        currency="AED"
      />
    );

    // Check for level 1 (completed)
    expect(screen.getByText('Level 1')).toBeInTheDocument();
    expect(screen.getByText('Pending Stage')).toBeInTheDocument();
    expect(screen.getByText('Project Manager')).toBeInTheDocument();
    expect(screen.getByText(/Threshold: AED 0/)).toBeInTheDocument();

    // Check for level 2 (current)
    expect(screen.getByText('Level 2')).toBeInTheDocument();
    expect(screen.getByText('Awaiting Decision')).toBeInTheDocument();
    expect(screen.getByText('Finance Director')).toBeInTheDocument();
    expect(screen.getByText(/Threshold: AED 10,000/)).toBeInTheDocument();
  });

  it('shows comments when available', () => {
    render(
      <ApprovalMatrix
        matrix={mockMatrix}
        approvals={mockApprovals}
        currentLevel={2}
        currency="AED"
      />
    );

    expect(screen.getByText(/Approved for project needs/)).toBeInTheDocument();
  });

  it('handles empty matrix gracefully', () => {
    const { container } = render(
      <ApprovalMatrix
        matrix={[]}
        approvals={[]}
        currentLevel={1}
        currency="AED"
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('displays correct threshold formatting', () => {
    const matrixWithHighThreshold: AuthorizationMatrix[] = [
      {
        id: 'matrix-3',
        project_id: 'proj-1',
        approval_level: 3,
        approver_role: 'CEO',
        threshold_min: 100000,
        threshold_max: 999999999,
        currency: 'AED',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      }
    ];

    render(
      <ApprovalMatrix
        matrix={matrixWithHighThreshold}
        approvals={[]}
        currentLevel={3}
        currency="AED"
      />
    );

    expect(screen.getByText(/Threshold: AED 100,000/)).toBeInTheDocument();
  });

  it('shows correct status for rejected approvals', () => {
    const rejectedApprovals: PRApproval[] = [
      {
        id: 'approval-1',
        pr_id: 'pr-1',
        approval_level: 1,
        approver_id: 'user-1',
        approver_name: 'John Manager',
        rejected_at: '2025-01-02T10:00:00Z',
        comments: 'Rejected due to budget constraints'
      }
    ];

    render(
      <ApprovalMatrix
        matrix={mockMatrix}
        approvals={rejectedApprovals}
        currentLevel={1}
        currency="AED"
      />
    );

    expect(screen.getByText('Awaiting Decision')).toBeInTheDocument();
    expect(screen.getByText(/Rejected due to budget constraints/)).toBeInTheDocument();
  });

  it('applies correct CSS classes for different statuses', () => {
    const { container } = render(
      <ApprovalMatrix
        matrix={mockMatrix}
        approvals={mockApprovals}
        currentLevel={2}
        currency="AED"
      />
    );

    // Check for current status classes (animate-pulse)
    const currentBadge = container.querySelector('.animate-pulse');
    expect(currentBadge).toBeInTheDocument();
  });
});