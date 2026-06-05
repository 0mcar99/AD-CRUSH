'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './ScrollCinema.module.css';

export default function ScrollCinema() {
  const containerRef = useRef(null);
  const pinRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const steps = [
    {
      number: 'Phase 01',
      title: 'Precision Signal Induction',
      desc: 'HydroPulse clamps directly onto your main water inlet pipe. Once powered, it generates dynamic, high-frequency electromagnetic pulses that saturate the incoming water stream, setting the conditioning process into motion.',
    },
    {
      number: 'Phase 02',
      title: 'Active Ion Clustering',
      desc: 'The induced electric field alters the electrical charge of dissolved Calcium (Ca²⁺) and Carbonate (CO₃²⁻) ions. Instead of repelling each other, they are forced to collide and aggregate into thousands of microscopic cluster templates.',
    },
    {
      number: 'Phase 03',
      title: 'Suspended Crystal Formation',
      desc: 'These clusters rapidly stabilize into tiny, stable aragonite mineral crystals. Because they are completely neutral and pre-formed, they remain suspended in the water flow rather than bonding to pipes or heating elements.',
    },
    {
      number: 'Phase 04',
      title: 'Long-term Pipeline Protection',
      desc: 'As conditioned water flows, existing scale deposits are gradually dissolved and washed away by the mineral-hungry water. A microscopic, corrosion-resistant shield forms on the pipe interior, providing permanent protection.',
    },
  ];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const pinEl = pinRef.current;
    if (!pinEl) return;

    // Check if user is on desktop screen (width > 1024px)
    if (window.innerWidth > 1024) {
      const scrollDuration = 3000; // scroll length of 3000px

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinEl,
          start: 'top top',
          end: `+=${scrollDuration}`,
          pin: true,
          scrub: 0.5,
          onUpdate: (self) => {
            // Divide progress (0 to 1) into 4 sections
            const progress = self.progress;
            const index = Math.min(Math.floor(progress * 4), 3);
            setActiveSlide(index);
          },
        },
      });

      // Simple timeline scroll indicators (we let react drive the active state for the SVGs)
      tl.to({}, { duration: 1 });

      return () => {
        if (tl.scrollTrigger) tl.scrollTrigger.kill();
        tl.kill();
      };
    }
  }, []);

  // Helper function to render morphing SVG based on active slide
  const renderSVGGraphic = (index) => {
    switch (index) {
      case 0:
        return (
          <svg className={styles.svgGraphic} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="200" cy="200" r="160" stroke="#222222" strokeWidth="2" />
            <circle cx="200" cy="200" r="120" stroke="#FF6B00" strokeWidth="2" strokeDasharray="5,5" opacity="0.3" />
            {/* Pulsing Signal Waves */}
            <circle cx="200" cy="200" r="80" stroke="url(#orangeGlow)" strokeWidth="3">
              <animate attributeName="r" values="80;150;80" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.1;0.8" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="200" cy="200" r="50" stroke="url(#orangeGlow)" strokeWidth="4">
              <animate attributeName="r" values="50;110;50" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite" />
            </circle>
            {/* HydroPulse Device center */}
            <rect x="170" y="120" width="60" height="160" rx="8" fill="#111111" stroke="#FF6B00" strokeWidth="3" />
            <line x1="200" y1="120" x2="200" y2="280" stroke="#FF6B00" strokeWidth="2" />
            <circle cx="200" cy="200" r="10" fill="#FF8C00" />
            <defs>
              <linearGradient id="orangeGlow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FF6B00" />
                <stop offset="100%" stopColor="#FF8C00" />
              </linearGradient>
            </defs>
          </svg>
        );
      case 1:
        return (
          <svg className={styles.svgGraphic} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="200" cy="200" r="160" stroke="#222222" strokeWidth="2" />
            {/* Colliding Ions */}
            <g>
              <circle cx="150" cy="180" r="12" fill="#E4E4D9" stroke="#EF4444" strokeWidth="2" />
              <text x="150" y="184" fill="#333" fontSize="10" textAnchor="middle" fontWeight="bold">Ca²⁺</text>
              <animateTransform attributeName="transform" type="translate" values="0,0; 30,10; 0,0" dur="2s" repeatCount="indefinite" />
            </g>
            <g>
              <circle cx="250" cy="210" r="14" fill="#C5C5B2" stroke="#EF4444" strokeWidth="2" />
              <text x="250" y="214" fill="#333" fontSize="8" textAnchor="middle" fontWeight="bold">CO₃²⁻</text>
              <animateTransform attributeName="transform" type="translate" values="0,0; -30,-10; 0,0" dur="2s" repeatCount="indefinite" />
            </g>
            {/* Electrical current arrows */}
            <path d="M 120 120 L 280 280" stroke="#FF6B00" strokeWidth="2" strokeDasharray="8,8" />
            <path d="M 280 120 L 120 280" stroke="#FF6B00" strokeWidth="2" strokeDasharray="8,8" />
            <circle cx="200" cy="200" r="30" fill="none" stroke="#FF8C00" strokeWidth="2" strokeDasharray="3,3">
              <animateTransform attributeName="transform" type="rotate" from="0 200 200" to="360 200 200" dur="4s" repeatCount="indefinite" />
            </circle>
          </svg>
        );
      case 2:
        return (
          <svg className={styles.svgGraphic} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="200" cy="200" r="160" stroke="#222222" strokeWidth="2" />
            {/* Starburst crystals floating */}
            <g>
              <path d="M 200 200 L 200 170 M 200 200 L 200 230 M 200 200 L 170 200 M 200 200 L 230 200 M 200 200 L 179 179 M 200 200 L 221 221 M 200 200 L 179 221 M 200 200 L 221 179" stroke="#FF8C00" strokeWidth="3" />
              <circle cx="200" cy="200" r="6" fill="#FFF" />
              <animateTransform attributeName="transform" type="scale" values="0.8;1.2;0.8" dur="4s" repeatCount="indefinite" />
            </g>
            <g transform="translate(100, 100) scale(0.6)">
              <path d="M 50 50 L 50 20 M 50 50 L 50 80 M 50 50 L 20 50 M 50 50 L 80 50" stroke="#FFF" strokeWidth="3" />
              <circle cx="50" cy="50" r="4" fill="#FF6B00" />
            </g>
            <g transform="translate(260, 240) scale(0.7)">
              <path d="M 50 50 L 50 20 M 50 50 L 50 80 M 50 50 L 20 50 M 50 50 L 80 50" stroke="#FFF" strokeWidth="3" />
              <circle cx="50" cy="50" r="4" fill="#FF8C00" />
            </g>
          </svg>
        );
      case 3:
        return (
          <svg className={styles.svgGraphic} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="200" cy="200" r="160" stroke="#FF6B00" strokeWidth="3" />
            <circle cx="200" cy="200" r="150" stroke="#10B981" strokeWidth="2" strokeDasharray="10,5" opacity="0.6">
              <animateTransform attributeName="transform" type="rotate" from="0 200 200" to="360 200 200" dur="15s" repeatCount="indefinite" />
            </circle>
            {/* Flowing clean water ring */}
            <path d="M 120 200 A 80 80 0 1 1 280 200 A 80 80 0 1 1 120 200" stroke="#0D3554" strokeWidth="20" fill="none" />
            <path d="M 130 200 A 70 70 0 1 1 270 200 A 70 70 0 1 1 130 200" stroke="#1E5C8A" strokeWidth="10" fill="none" />
            {/* Protection shield lock icon */}
            <path d="M 190 210 L 190 195 A 10 10 0 0 1 210 195 L 210 210" stroke="#10B981" strokeWidth="4" fill="none" />
            <rect x="182" y="210" width="36" height="26" rx="4" fill="#10B981" />
            <circle cx="200" cy="223" r="3" fill="#FFF" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div ref={containerRef} className={styles.cinemaSection}>
      {/* DESKTOP PINNED VIEW */}
      <div ref={pinRef} className={styles.pinContainer}>
        {/* Left Canvas Panel (Visual Animation) */}
        <div className={styles.visualCanvas}>
          <div className={styles.canvasWrapper}>
            {renderSVGGraphic(activeSlide)}
          </div>
        </div>

        {/* Right Scroll Slides Panel */}
        <div className={styles.timelinePanel}>
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`${styles.slide} ${
                activeSlide === idx ? styles.slideActive : ''
              }`}
              style={{
                transition: 'opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              <span className={styles.stepNumber}>{step.number}</span>
              <h2 className={styles.title}>{step.title}</h2>
              <p className={styles.description}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MOBILE TIMELINE FALLBACK */}
      <div className={styles.mobileFallback}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-orange)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Workflow</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', marginTop: '8px' }}>How it protects</h2>
        </div>
        {steps.map((step, idx) => (
          <div key={idx} className={styles.mobileCard}>
            <div className={styles.mobileVisual}>
              <div style={{ width: '120px', height: '120px', position: 'relative' }}>
                {renderSVGGraphic(idx)}
              </div>
            </div>
            <span className={styles.stepNumber}>{step.number}</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', margin: '8px 0 12px 0' }}>{step.title}</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
