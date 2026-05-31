'use client';

import { useRef, useState } from 'react';

export default function Tilt3D({ children, className = '' }) {
  const containerRef = useRef(null);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [transition, setTransition] = useState('transform 0.5s ease');

  const handleMouseMove = (e) => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Mouse coordinates relative to the element
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalized coordinates (-0.5 to 0.5)
    const px = (x / width) - 0.5;
    const py = (y / height) - 0.5;

    // Max tilt angles in degrees
    const maxTilt = 8;

    // Calculate rotation angles (invert X rotation for standard feel)
    const rotateX = -py * maxTilt;
    const rotateY = px * maxTilt;

    setTransition('none'); // Snappy tracking during move
    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    );
  };

  const handleMouseLeave = () => {
    setTransition('transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)'); // Smooth return to normal
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        transform: transform,
        transition: transition,
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </div>
  );
}
