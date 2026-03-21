'use client';
import { useRef, useEffect } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const dot = ref.current;
    if (!dot) return;

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let rafId: number;

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!dot.classList.contains('visible')) {
        dot.classList.add('visible');
      }
    }

    function onMouseLeave() {
      dot.classList.remove('visible');
    }

    function onHoverEnter() { dot.classList.add('hovering'); }
    function onHoverLeave() { dot.classList.remove('hovering'); }

    function updateCursor() {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      dot.style.left = cursorX + 'px';
      dot.style.top = cursorY + 'px';
      rafId = requestAnimationFrame(updateCursor);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    // Attach hover listeners to interactive elements
    const hoverTargets = document.querySelectorAll('a, button, .service-item, .work-card');
    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', onHoverEnter);
      el.addEventListener('mouseleave', onHoverLeave);
    });

    rafId = requestAnimationFrame(updateCursor);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      hoverTargets.forEach((el) => {
        el.removeEventListener('mouseenter', onHoverEnter);
        el.removeEventListener('mouseleave', onHoverLeave);
      });
    };
  }, [reduced]);

  if (reduced) return null;

  return <div className="cursor-dot" ref={ref} aria-hidden="true" />;
}
