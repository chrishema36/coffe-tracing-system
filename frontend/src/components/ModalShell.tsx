'use client';

import { useEffect } from 'react';

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Tailwind max-width class, e.g. max-w-lg */
  maxWidthClass?: string;
  zClass?: string;
}

/**
 * Modal anchored near the top of the viewport (not dead-center),
 * so content stays visible. Tall content scrolls inside the panel body;
 * the overlay can also scroll as a fallback on small screens.
 */
export function ModalShell({
  isOpen,
  onClose,
  children,
  maxWidthClass = 'max-w-lg',
  zClass = 'z-[100]',
}: ModalShellProps) {
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarGap > 0) {
      document.body.style.paddingRight = `${scrollbarGap}px`;
    }
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 ${zClass} overflow-y-auto overscroll-contain`} role="dialog" aria-modal="true">
      {/* Backdrop — fixed so it covers the viewport while the overlay scrolls */}
      <button
        type="button"
        aria-label="Close dialog backdrop"
        className="fixed inset-0 z-0 border-0 bg-black/70 backdrop-blur-sm cursor-default"
        onClick={onClose}
      />

      {/* Top-biased placement; padding keeps the modal in the upper half */}
      <div className="relative z-10 flex min-h-full items-start justify-center px-3 pt-[5vh] sm:pt-[6vh] pb-10">
        <div
          className={`relative flex w-full ${maxWidthClass} max-h-[min(88vh,880px)] flex-col overflow-hidden rounded-2xl border border-borderToken bg-surface shadow-2xl animate-fadeIn`}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function ModalHeader({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`shrink-0 border-b border-borderToken/70 px-4 sm:px-6 py-3.5 sm:py-4 ${className}`}>
      {children}
    </div>
  );
}

export function ModalBody({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 [-webkit-overflow-scrolling:touch] ${className}`}
    >
      {children}
    </div>
  );
}

export function ModalFooter({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`shrink-0 border-t border-borderToken/70 px-4 sm:px-6 py-3 sm:py-4 bg-surfaceHover/40 ${className}`}
    >
      {children}
    </div>
  );
}

/** Use around header/body/footer when the modal content is a <form> */
export function ModalForm({
  children,
  className = '',
  ...props
}: React.FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form {...props} className={`flex min-h-0 flex-1 flex-col overflow-hidden ${className}`}>
      {children}
    </form>
  );
}
