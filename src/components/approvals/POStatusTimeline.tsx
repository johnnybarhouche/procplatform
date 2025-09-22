import { PurchaseOrder } from '@/types/procurement';

interface POStatusTimelineProps {
  po: PurchaseOrder;
  className?: string;
}

type TimelineStepKey = 'draft' | 'approved' | 'sent' | 'acknowledged';

type TimelineStep = {
  key: TimelineStepKey;
  label: string;
  description: string;
  completed: boolean;
  active: boolean;
  timestamp?: string;
  actor?: string;
};

const STATUS_ORDER: Array<TimelineStepKey | 'in_progress' | 'delivered' | 'invoiced' | 'paid'> = [
  'draft',
  'approved',
  'sent',
  'acknowledged',
  'in_progress',
  'delivered',
  'invoiced',
  'paid',
];

function findStatusIndex(status: string): number {
  const index = STATUS_ORDER.indexOf(status as TimelineStepKey);
  return index === -1 ? 0 : index;
}

function resolveTimestamp(po: PurchaseOrder, key: TimelineStepKey): string | undefined {
  const fromHistory = po.status_history.find((entry) => entry.status === key);
  if (fromHistory) {
    return fromHistory.changed_at;
  }

  switch (key) {
    case 'draft':
      return po.created_at;
    case 'approved':
      return po.pr?.approved_at ?? po.updated_at;
    case 'sent':
      return po.sent_at;
    case 'acknowledged':
      return po.acknowledged_at;
    default:
      return undefined;
  }
}

function resolveActor(po: PurchaseOrder, key: TimelineStepKey): string | undefined {
  const fromHistory = po.status_history.find((entry) => entry.status === key);
  if (fromHistory) {
    return fromHistory.changed_by_name;
  }

  switch (key) {
    case 'draft':
      return po.created_by_name;
    case 'approved':
      return po.pr?.approved_by_name;
    case 'sent':
      return po.sent_by_name;
    case 'acknowledged':
      return po.acknowledged_by_name;
    default:
      return undefined;
  }
}

export default function POStatusTimeline({ po, className = '' }: POStatusTimelineProps) {
  const currentIndex = findStatusIndex(po.status);

  const baseSteps: Array<Omit<TimelineStep, 'completed' | 'active'>> = [
    {
      key: 'draft',
      label: 'Draft',
      description: 'PO generated from approved PR',
      timestamp: resolveTimestamp(po, 'draft'),
      actor: resolveActor(po, 'draft'),
    },
    {
      key: 'approved',
      label: 'Approved',
      description: 'Approval matrix satisfied and PO released',
      timestamp: resolveTimestamp(po, 'approved'),
      actor: resolveActor(po, 'approved'),
    },
    {
      key: 'sent',
      label: 'Sent to Supplier',
      description: 'Dispatch completed via email/portal',
      timestamp: resolveTimestamp(po, 'sent'),
      actor: resolveActor(po, 'sent'),
    },
    {
      key: 'acknowledged',
      label: 'Acknowledged',
      description: 'Supplier confirmed PO receipt',
      timestamp: resolveTimestamp(po, 'acknowledged'),
      actor: resolveActor(po, 'acknowledged'),
    },
  ];

  const steps: TimelineStep[] = baseSteps.map((step, index) => {
    const statusIndex = findStatusIndex(step.key);
    const completed = currentIndex >= statusIndex || Boolean(step.timestamp);

    return {
      ...step,
      completed,
      active: !completed &&
        baseSteps
          .slice(0, index)
          .every((prevStep) =>
            currentIndex >= findStatusIndex(prevStep.key) || Boolean(prevStep.timestamp)
          ),
    };
  });

  return (
    <div className={`rounded-lg border border-brand-primary/20 bg-brand-surface p-6 shadow-sm ${className}`}>
      <h2 className="text-lg font-semibold text-brand-text">PO Status Timeline</h2>
      <p className="mt-1 text-sm text-brand-text/70">
        Tracks the lifecycle of the purchase order from creation through supplier acknowledgement.
      </p>

      <ol className="mt-6 space-y-5">
        {steps.map((step, index) => {
          const indicatorClasses = step.completed
            ? 'bg-status-success border-status-success/40'
            : step.active
              ? 'bg-brand-primary border-brand-primary/40 animate-pulse'
              : 'bg-brand-surface border-brand-text/20';

          return (
            <li key={step.key} className="relative flex items-start gap-4">
              {index !== steps.length - 1 && (
                <span className="absolute left-[7px] top-3 h-full border-l border-dashed border-brand-text/20" aria-hidden="true" />
              )}

              <span
                aria-hidden
                className={`relative mt-1 inline-flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full border ${indicatorClasses}`}
              />

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold uppercase tracking-wide text-brand-text">
                    {step.label}
                  </span>
                  <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-primary">
                    {step.completed ? 'Complete' : step.active ? 'In Progress' : 'Pending'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-brand-text/70">{step.description}</p>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-brand-text/60">
                  {step.timestamp && (
                    <span>
                      {new Date(step.timestamp).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  )}
                  {step.actor && <span>by {step.actor}</span>}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
