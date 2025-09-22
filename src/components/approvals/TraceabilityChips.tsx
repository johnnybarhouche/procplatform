import Link from 'next/link';
import { QuoteApproval } from '@/types/procurement';

type ChipTarget = {
  label: string;
  value?: string;
  href?: string;
  description: string;
};

interface TraceabilityChipsProps {
  quoteApproval?: QuoteApproval;
  className?: string;
}

const baseChipClasses =
  'inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-primary transition hover:bg-brand-primary/20 focus:outline-none focus:ring-2 focus:ring-brand-primary/50';

export default function TraceabilityChips({ quoteApproval, className = '' }: TraceabilityChipsProps) {
  const materialRequest = quoteApproval?.quote_pack.rfq.material_request;
  const rfq = quoteApproval?.quote_pack.rfq;
  const quotePack = quoteApproval?.quote_pack;

  const chips: ChipTarget[] = [
    {
      label: 'MR',
      value: materialRequest?.mrn,
      href: materialRequest ? `/material-requests/${materialRequest.id}` : undefined,
      description: 'Material Request context',
    },
    {
      label: 'RFQ',
      value: rfq?.rfq_number ?? rfq?.id,
      href: rfq ? `/rfqs/${rfq.id}` : undefined,
      description: 'Request for Quotation details',
    },
    {
      label: 'Quote Pack',
      value: quotePack?.id,
      href: quotePack ? `/quote-packs/${quotePack.id}` : undefined,
      description: 'Submitted quote bundle',
    },
    {
      label: 'Quote Approval',
      value: quoteApproval?.id,
      href: quoteApproval ? `/quote-approvals/${quoteApproval.id}` : undefined,
      description: 'Quote approval audit trail',
    },
  ];

  const visibleChips = chips.filter((chip) => chip.value);

  if (visibleChips.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {visibleChips.map((chip) => {
        if (chip.href) {
          return (
            <Link
              key={`${chip.label}-${chip.value}`}
              href={chip.href}
              aria-label={`${chip.description}: ${chip.value}`}
              className={baseChipClasses}
            >
              <span>{chip.label}</span>
              <span className="rounded bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-primary">
                {chip.value}
              </span>
            </Link>
          );
        }

        return (
          <span
            key={`${chip.label}-${chip.value}`}
            aria-label={`${chip.description}: ${chip.value}`}
            className={`${baseChipClasses} cursor-default`}
          >
            <span>{chip.label}</span>
            <span className="rounded bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-primary">
              {chip.value}
            </span>
          </span>
        );
      })}
    </div>
  );
}
