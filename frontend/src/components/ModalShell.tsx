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
 * Scrollable overlay modal.
 * - Anchored near the top of the screen (not vertically centered)
 * - Panel grows with content (footer is never clipped)
 * - Wheel / trackpad scroll works on the dimmed area AND inside the modal
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
    <div
      className={`fixed inset-0 ${zClass} overflow-y-auto overscroll-contain`}
      role="dialog"
      aria-modal="true"
    >
      {/*
        One scrollable column: dimmed background + modal.
        Clicking the padding/backdrop closes; scrolling works anywhere in this column.
      */}
      <div
        className="relative flex min-h-full justify-center bg-black/70 backdrop-blur-sm px-3 pt-6 sm:pt-10 pb-12"
        onClick={onClose}
      >
        <div
          className={`relative my-0 w-full ${maxWidthClass} h-fit max-h-none rounded-2xl border border-borderToken bg-surface shadow-2xl animate-fadeIn`}
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
    <div className={`border-b border-borderToken/70 px-4 sm:px-6 py-3.5 sm:py-4 ${className}`}>
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
  return <div className={`px-4 sm:px-6 py-4 ${className}`}>{children}</div>;
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
      className={`border-t border-borderToken/70 px-4 sm:px-6 py-3 sm:py-4 bg-surfaceHover/40 ${className}`}
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
    <form {...props} className={className}>
      {children}
    </form>
  );
}
