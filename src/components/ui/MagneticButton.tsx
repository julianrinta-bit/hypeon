'use client';
import { useRef, useCallback, type ReactNode } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  href?: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
  ariaLabel?: string;
}

export default function MagneticButton({
  children,
  className = '',
  href,
  type,
  onClick,
  ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (reduced || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      ref.current.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    },
    [reduced]
  );

  const handleMouseLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = 'translate(0, 0)';
  }, []);

  const props = {
    ref: ref as React.RefObject<HTMLAnchorElement>,
    className: `${className} magnetic`,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    'aria-label': ariaLabel,
  };

  if (href) {
    return <a {...props} href={href}>{children}</a>;
  }
  return (
    <button {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)} type={type || 'button'} onClick={onClick}>
      {children}
    </button>
  );
}
