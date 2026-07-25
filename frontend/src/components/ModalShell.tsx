'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Tailwind max-width class, e.g. max-w-lg */
  maxWidthClass?: string;
  /** Unused for portal stacking - kept for call-site compatibility */
  zClass?: string;
}

/**
 * App-shell-safe modal:
 * - Portaled to document.body (escapes main/sidebar overflow)
 * - Full-viewport scroll container (works with mouse outside the card)
 * - Anchored near the top so footers are reachable by scrolling
 */
export function ModalShell({
  isOpen,
  onClose,
  children,
  maxWidthClass = 'max-w-lg',
}: ModalShellProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarGap > 0) {
      document.body.style.paddingRight = `${scrollbarGap}px`;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        overflowY: 'scroll',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
      }}
    >
      <div
        onClick={onClose}
        style={{
          minHeight: '100%',
          boxSizing: 'border-box',
          paddingTop: 28,
          paddingBottom: 80,
          paddingLeft: 12,
          paddingRight: 12,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          backgroundColor: 'rgba(0, 0, 0, 0.78)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`w-full ${maxWidthClass} rounded-2xl border border-borderToken bg-surface shadow-2xl`}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
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
