import { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export function Table({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('w-full overflow-x-auto rounded-lg border border-brand-text/10 bg-brand-surface', className)} {...props}>
      <table className="min-w-full divide-y divide-brand-text/10 text-sm text-brand-text">
        {children}
      </table>
    </div>
  );
}

export function TableHead({ className, children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn('bg-brand-primary/5 text-xs uppercase text-brand-text/70', className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn('divide-y divide-brand-text/10', className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ className, children, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn('transition hover:bg-brand-primary/5 focus-within:bg-brand-primary/5', className)} {...props}>
      {children}
    </tr>
  );
}

export function TableHeaderCell({ className, children, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn('px-4 py-2.5 text-left font-semibold tracking-wide text-brand-text/80', className)} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ className, children, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn('px-4 py-2.5 align-middle text-brand-text/90', className)} {...props}>
      {children}
    </td>
  );
}
