import { AuthorizationMatrix, PRApproval } from '@/types/procurement';

type ApprovalMatrixStatus = 'complete' | 'current' | 'upcoming' | 'rejected';

type ApprovalMatrixRow = {
  level: number;
  role: string;
  thresholdLabel: string;
  status: ApprovalMatrixStatus;
  approverName?: string;
  completedAt?: string;
  comments?: string;
};

interface ApprovalMatrixProps {
  matrix: AuthorizationMatrix[];
  approvals: PRApproval[];
  currentLevel: number;
  currency: string;
  className?: string;
}

function formatThreshold(min: number, max: number, currency: string) {
  const format = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);

  const formattedMin = format(min);
  const formattedMax = Number.isFinite(max) ? format(max) : `${currency.toUpperCase()}∞`;
  return `${formattedMin} – ${formattedMax}`;
}

function resolveStatus(
  level: number,
  approvals: PRApproval[],
  currentLevel: number
): ApprovalMatrixStatus {
  const approval = approvals.find((item) => item.approval_level === level);

  if (approval?.status === 'approved') {
    return 'complete';
  }
  if (approval?.status === 'rejected') {
    return 'rejected';
  }
  if (level === currentLevel) {
    return 'current';
  }
  return 'upcoming';
}

const statusClasses: Record<ApprovalMatrixStatus, string> = {
  complete: 'bg-status-success/10 text-status-success border-status-success/40',
  current: 'bg-brand-primary/10 text-brand-primary border-brand-primary/40 animate-pulse',
  upcoming: 'bg-brand-surface text-brand-text/70 border-brand-text/20',
  rejected: 'bg-status-danger/10 text-status-danger border-status-danger/40',
};

const statusLabel: Record<ApprovalMatrixStatus, string> = {
  complete: 'Approved',
  current: 'Awaiting Decision',
  upcoming: 'Pending Stage',
  rejected: 'Rejected',
};

export default function ApprovalMatrix({
  matrix,
  approvals,
  currentLevel,
  currency,
  className = '',
}: ApprovalMatrixProps) {
  if (!matrix.length) {
    return null;
  }

  const sortedMatrix = [...matrix].sort((a, b) => a.approval_level - b.approval_level);

  const rows: ApprovalMatrixRow[] = sortedMatrix.map((item) => {
    const approval = approvals.find((record) => record.approval_level === item.approval_level);

    return {
      level: item.approval_level,
      role: item.approver_role,
      thresholdLabel: formatThreshold(item.threshold_min, item.threshold_max, currency),
      status: resolveStatus(item.approval_level, approvals, currentLevel),
      approverName: approval?.approver_name,
      completedAt: approval?.approved_at ?? approval?.rejected_at,
      comments: approval?.comments,
    };
  });

  return (
    <div className={`rounded-lg border border-brand-primary/20 bg-brand-surface shadow-sm ${className}`}>
      <div className="border-b border-brand-primary/10 px-6 py-4">
        <h2 className="text-lg font-semibold text-brand-text">Approval Matrix</h2>
        <p className="mt-1 text-sm text-brand-text/70">
          Multi-step approval thresholds derived from project authorization matrix.
        </p>
      </div>

      <div className="divide-y divide-brand-primary/10">
        {rows.map((row) => (
          <div key={row.level} className="flex flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold uppercase tracking-wide text-brand-text/60">
                  Level {row.level}
                </span>
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClasses[row.status]}`}>
                  {statusLabel[row.status]}
                </span>
              </div>
              <p className="mt-2 text-base font-semibold text-brand-text">{row.role}</p>
              <p className="text-sm text-brand-text/70">Threshold: {row.thresholdLabel}</p>
              {row.comments && (
                <p className="mt-2 text-sm italic text-brand-text/60">“{row.comments}”</p>
              )}
            </div>

            <div className="flex flex-col items-start gap-2 text-sm text-brand-text/70 md:items-end">
              {row.approverName && (
                <span className="font-medium text-brand-text">{row.approverName}</span>
              )}
              {row.completedAt && (
                <span>
                  {new Date(row.completedAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
