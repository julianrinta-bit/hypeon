'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SwipeNavigationProps {
  prevSlug?: string;
  nextSlug?: string;
}

export default function SwipeNavigation({ prevSlug, nextSlug }: SwipeNavigationProps) {
  const router = useRouter();
  const [showHint, setShowHint] = useState(false);
  const [swipeArrow, setSwipeArrow] = useState<'left' | 'right' | null>(null);

  // Swipe hint — show once per session after 1.5s
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('swipe-hint-shown')) return;

    const timer = setTimeout(() => {
      setShowHint(true);
      sessionStorage.setItem('swipe-hint-shown', '1');

      // Fade out after 3s (animation is 4s total — hide state after it completes)
      setTimeout(() => setShowHint(false), 4000);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

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
          // Swipe right → previous article: show left arrow
          setSwipeArrow('left');
          setTimeout(() => {
            setSwipeArrow(null);
            router.push(`/blog/${prevSlug}`);
          }, 300);
        } else if (diffX < 0 && nextSlug) {
          // Swipe left → next article: show right arrow
          setSwipeArrow('right');
          setTimeout(() => {
            setSwipeArrow(null);
            router.push(`/blog/${nextSlug}`);
          }, 300);
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

  // Detect desktop via pointer coarseness (touch = coarse, mouse = fine)
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDesktop(window.matchMedia('(pointer: fine)').matches);
    }
  }, []);

  return (
    <>
      {showHint && (
        <div className="swipe-hint" aria-hidden="true">
          {isDesktop
            ? '← → Arrow keys to navigate'
            : '← Swipe to navigate between articles →'}
        </div>
      )}
      {swipeArrow === 'left' && (
        <div className="swipe-arrow swipe-arrow--left" aria-hidden="true">←</div>
      )}
      {swipeArrow === 'right' && (
        <div className="swipe-arrow swipe-arrow--right" aria-hidden="true">→</div>
      )}
    </>
  );
}
