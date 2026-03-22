'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SwipeNavigationProps {
  prevSlug?: string;
  nextSlug?: string;
}

export default function SwipeNavigation({ prevSlug, nextSlug }: SwipeNavigationProps) {
  const router = useRouter();

  // Touch swipe navigation (mobile)
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const diffX = e.changedTouches[0].clientX - startX;
      const diffY = e.changedTouches[0].clientY - startY;

      // Only trigger if horizontal swipe is dominant (not scrolling)
      if (Math.abs(diffX) > 80 && Math.abs(diffX) > Math.abs(diffY) * 2) {
        if (diffX > 0 && prevSlug) {
          router.push(`/blog/${prevSlug}`);
        } else if (diffX < 0 && nextSlug) {
          router.push(`/blog/${nextSlug}`);
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [prevSlug, nextSlug, router]);

  // Keyboard arrow navigation (desktop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && prevSlug) router.push(`/blog/${prevSlug}`);
      if (e.key === 'ArrowRight' && nextSlug) router.push(`/blog/${nextSlug}`);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [prevSlug, nextSlug, router]);

  return null;
}
