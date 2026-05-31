'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function Reveal({ children, delay = 0, duration = 0.8, y = 40 }) {
  const elementRef = useRef(null);

  useEffect(() => {
    // Register scrolltrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    const el = elementRef.current;
    if (!el) return;

    const anim = gsap.fromTo(
      el,
      { opacity: 0, y: y },
      {
        opacity: 1,
        y: 0,
        duration: duration,
        delay: delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    );

    return () => {
      if (anim.scrollTrigger) anim.scrollTrigger.kill();
      anim.kill();
    };
  }, [delay, duration, y]);

  return (
    <div ref={elementRef} style={{ width: '100%' }}>
      {children}
    </div>
  );
}
