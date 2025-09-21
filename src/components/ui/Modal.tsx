'use client';

import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';

interface ModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ isOpen, title, description, onClose, children, footer }: ModalProps) {
  if (typeof window === 'undefined' || !isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-text/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
      onClick={onClose}
    >
      <div
        className={cn('max-w-lg w-full rounded-xl bg-brand-surface p-6 shadow-lg', 'animate-in fade-in zoom-in')}
        onClick={(event) => event.stopPropagation()}
      >
        {(title || description) && (
          <header className="mb-4 space-y-1">
            {title && (
              <h2 id="modal-title" className="text-xl font-semibold text-brand-text">
                {title}
              </h2>
            )}
            {description && (
              <p id="modal-description" className="text-sm text-brand-text/70">
                {description}
              </p>
            )}
          </header>
        )}
        <div className="space-y-4 text-sm text-brand-text/90">{children}</div>
        {footer && <footer className="mt-6 flex justify-end gap-3">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}
