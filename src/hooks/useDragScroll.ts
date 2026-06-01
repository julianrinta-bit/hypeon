'use client';
import { useEffect, RefObject } from 'react';

export function useDragScroll(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const down = (e: MouseEvent | TouchEvent) => {
      isDown = true;
      el.classList.add('dragging');
      startX = (e instanceof MouseEvent ? e.pageX : e.touches[0]?.pageX) ?? 0;
      scrollLeft = el.scrollLeft;
    };

    const up = () => {
      isDown = false;
      el.classList.remove('dragging');
    };

    const move = (e: MouseEvent | TouchEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = (e instanceof MouseEvent ? e.pageX : e.touches[0]?.pageX) ?? 0;
      el.scrollLeft = scrollLeft - (x - startX) * 1.5;
    };

    el.addEventListener('mousedown', down);
    el.addEventListener('touchstart', down as EventListener, { passive: true });
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
    el.addEventListener('mousemove', move);
    el.addEventListener('touchmove', move as EventListener, { passive: false });

    return () => {
      el.removeEventListener('mousedown', down);
      el.removeEventListener('touchstart', down as EventListener);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchend', up);
      el.removeEventListener('mousemove', move);
      el.removeEventListener('touchmove', move as EventListener);
    };
  }, [ref]);
}
