'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Adds 'is-visible' class to an element once it scrolls into view.
 * Pairs with .img-reveal / .animate-fade-up CSS classes.
 *
 * Usage:
 *   const ref = useRevealOnScroll();
 *   <div ref={ref} className="img-reveal">...</div>
 */
export function useRevealOnScroll<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // only reveal once
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (visible && ref.current) {
      ref.current.classList.add('is-visible');
    }
  }, [visible]);

  return ref;
}
