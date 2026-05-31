'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './BeforeAfter.module.css';

export default function BeforeAfter() {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const handleMove = (clientX) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleTouchStart = () => {
    isDragging.current = true;
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      handleMove(e.clientX);
    };

    const handleTouchMove = (e) => {
      if (!isDragging.current) return;
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      {/* BEFORE VIEW (Clogged Pipe) - Width is controlled by sliderPos */}
      <div 
        className={`${styles.imageContainer} ${styles.before}`}
        style={{ width: `${sliderPos}%` }}
      >
        <div className={styles.beforeLabel} style={{ width: containerRef.current?.getBoundingClientRect().width || '500px' }}>
          <span className={styles.label}>Before: Clogged & Scaled</span>
        </div>
        <div className={styles.visualWrapper}>
          {/* SVG representation of Clogged Pipe */}
          <svg className={styles.pipeGraphic} viewBox="0 0 600 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Pipe Outline */}
            <rect x="20" y="70" width="560" height="80" rx="10" fill="#222222" stroke="#555555" strokeWidth="4" />
            <rect x="20" y="60" width="40" height="100" rx="4" fill="#333333" stroke="#555555" strokeWidth="3" />
            <rect x="540" y="60" width="40" height="100" rx="4" fill="#333333" stroke="#555555" strokeWidth="3" />
            
            {/* Limescale Clutter (Heavy Blockage) */}
            <path d="M 60 145 C 100 140, 120 120, 150 125 C 180 130, 200 110, 240 115 C 280 120, 310 95, 350 110 C 390 125, 420 100, 460 125 C 500 150, 520 135, 540 145 L 540 148 L 60 148 Z" fill="#E4E4D9" opacity="0.85" />
            <path d="M 60 72 C 100 80, 110 95, 140 90 C 170 85, 190 105, 230 100 C 270 95, 290 120, 330 110 C 370 100, 400 125, 440 105 C 480 85, 510 95, 540 72 L 540 72 L 60 72 Z" fill="#D3D3C3" opacity="0.9" />
            
            {/* Tiny blocked water flow line */}
            <path d="M 20 110 Q 150 110 300 108 T 580 110" stroke="#7091A8" strokeWidth="4" strokeDasharray="5, 10" />
            
            {/* Scale Deposits Texture */}
            <circle cx="100" cy="135" r="8" fill="#C5C5B2" />
            <circle cx="180" cy="80" r="6" fill="#B5B5A2" />
            <circle cx="280" cy="130" r="10" fill="#DCDCCB" />
            <circle cx="340" cy="85" r="7" fill="#C5C5B2" />
            <circle cx="420" cy="135" r="9" fill="#B5B5A2" />
            <circle cx="480" cy="80" r="6" fill="#DCDCCB" />
            
            {/* Text Indicators */}
            <text x="300" y="200" fill="#EF4444" fontSize="14" fontFamily="var(--font-mono)" textAnchor="middle" fontWeight="bold">Flow restricted by 60%</text>
          </svg>
        </div>
      </div>

      {/* AFTER VIEW (Clean Pipe) */}
      <div className={`${styles.imageContainer} ${styles.after}`}>
        <span className={`${styles.label} ${styles.afterLabel}`}>After: HydroPulse Protected</span>
        <div className={styles.visualWrapper}>
          {/* SVG representation of Clean Pipe */}
          <svg className={`${styles.pipeGraphic} ${styles.glowEffect}`} viewBox="0 0 600 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Glowing frequency wave background */}
            <path d="M 20 110 Q 150 60 300 110 T 580 110" stroke="rgba(255, 107, 0, 0.25)" strokeWidth="6" fill="none" />
            <path d="M 20 110 Q 150 160 300 110 T 580 110" stroke="rgba(255, 140, 0, 0.15)" strokeWidth="4" fill="none" />

            {/* Pipe Outline */}
            <rect x="20" y="70" width="560" height="80" rx="10" fill="#1b1b1b" stroke="#FF6B00" strokeWidth="2.5" />
            <rect x="20" y="60" width="40" height="100" rx="4" fill="#222" stroke="#FF6B00" strokeWidth="2" />
            <rect x="540" y="60" width="40" height="100" rx="4" fill="#222" stroke="#FF6B00" strokeWidth="2" />
            
            {/* Clean crystal-clear full water flow */}
            <rect x="60" y="73" width="480" height="74" fill="url(#waterGrad)" opacity="0.8" />
            
            {/* Suspended neutral crystals (tiny orange/white dots flowing) */}
            <g opacity="0.9">
              <circle cx="100" cy="90" r="3" fill="#FFF" />
              <circle cx="130" cy="115" r="2.5" fill="#FF8C00" />
              <circle cx="180" cy="130" r="3" fill="#FFF" />
              <circle cx="210" cy="95" r="2.5" fill="#FF8C00" />
              <circle cx="260" cy="110" r="3.5" fill="#FFF" />
              <circle cx="310" cy="125" r="2" fill="#FF8C00" />
              <circle cx="350" cy="90" r="3" fill="#FFF" />
              <circle cx="400" cy="110" r="2.5" fill="#FF8C00" />
              <circle cx="450" cy="130" r="3" fill="#FFF" />
              <circle cx="480" cy="95" r="2" fill="#FF8C00" />
              <circle cx="520" cy="115" r="3" fill="#FFF" />
            </g>

            {/* Gradients */}
            <defs>
              <linearGradient id="waterGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0D3554" />
                <stop offset="50%" stopColor="#1E5C8A" />
                <stop offset="100%" stopColor="#0D3554" />
              </linearGradient>
            </defs>

            {/* Text Indicators */}
            <text x="300" y="200" fill="#10B981" fontSize="14" fontFamily="var(--font-mono)" textAnchor="middle" fontWeight="bold">100% unrestricted clean flow</text>
          </svg>
        </div>
      </div>

      {/* SLIDER CONTROLLER BAR */}
      <div 
        className={styles.sliderBar} 
        style={{ left: `${sliderPos}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className={styles.sliderHandle}>
          <svg className={styles.arrowIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" d="M8 9l-4 4 4 4m8 0l4-4-4-4" />
          </svg>
        </div>
      </div>
    </div>
  );
}
