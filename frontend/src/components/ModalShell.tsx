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
 * Viewport-centered modal shell.
 * Keeps the dialog in the middle of the screen; only the inner body scrolls.
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
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 ${zClass} flex items-center justify-center p-3 sm:p-4`}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Close dialog backdrop"
        className="absolute inset-0 border-0 bg-black/70 backdrop-blur-sm cursor-default"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full ${maxWidthClass} max-h-[min(92dvh,920px)] flex flex-col rounded-2xl border border-borderToken bg-surface shadow-2xl overflow-hidden animate-fadeIn`}
      >
        {children}
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
    <div className={`shrink-0 border-b border-borderToken/70 px-4 sm:px-6 py-4 ${className}`}>
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
    <div className={`flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 ${className}`}>
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
