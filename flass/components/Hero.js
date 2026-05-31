"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import styles from "./Hero.module.css";
import ParticleBackground from "./ParticleBackground";

const TAGLINES = [
  "Where every ad makes an impact.",
  "Publish. Promote. Crush the competition.",
  "Your product. Our platform. Global reach.",
  "From vision to viral — we make it happen.",
];

export default function Hero() {
  const [tagIdx, setTagIdx] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const id = setInterval(() => setTagIdx((i) => (i + 1) % TAGLINES.length), 3500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section className={`${styles.hero} bg-mesh noise`}>
      {/* Background image */}
      <img
        src="/images/hero-bg.png"
        alt=""
        className={styles.bgImage}
        loading="eager"
      />
      <div className={styles.bgOverlay} />

      {/* Particles */}
      <ParticleBackground />

      {/* Floating shapes with mouse parallax */}
      <div className={styles.shapes}>
        <div
          className={`${styles.shape} ${styles.shape1}`}
          style={{ transform: `translate(${mouse.x * 30}px, ${mouse.y * 30}px) rotate(20deg)` }}
        />
        <div
          className={`${styles.shape} ${styles.shape2}`}
          style={{ transform: `translate(${mouse.x * -50}px, ${mouse.y * -50}px)` }}
        />
        <div
          className={`${styles.shape} ${styles.shape3}`}
          style={{ transform: `translate(${mouse.x * 40}px, ${mouse.y * 40}px) rotate(45deg)` }}
        />
      </div>

      {/* Content */}
      <div className={styles.content}>
        <p className={styles.badge}>
          <span className={styles.badgeDot} />
          The global ad publishing platform
        </p>

        <h1 className={styles.title}>
          <span className={styles.titleAdd}>AD</span>
          <span className={styles.titleCrush}>CRUSH</span>
        </h1>

        <div className={styles.taglineWrap}>
          {TAGLINES.map((t, i) => (
            <p
              key={i}
              className={`${styles.tagline} ${tagIdx === i ? styles.taglineVisible : styles.taglineHidden}`}
            >
              &ldquo;{t}&rdquo;
            </p>
          ))}
        </div>

        <p className={styles.subtext}>
          The world&apos;s premier platform for publishing advertisements that
          captivate, convert, and create lasting impressions across every screen.
        </p>

        <div className={styles.ctas}>
          <Link href="/add-yours" className={styles.ctaPrimary}>
            Start your campaign
            <span>→</span>
          </Link>
          <Link href="/products" className={styles.ctaSecondary}>
            See published ads
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator}>
        Scroll to explore
        <svg className={styles.scrollArrow} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
