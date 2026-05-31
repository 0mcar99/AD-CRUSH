"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./ScrollCinema.module.css";

gsap.registerPlugin(ScrollTrigger);

const SCENES = [
  {
    img: "/images/scene-shatter.png",
    eyebrow: "Scene 01 / Noise",
    title: "Social media is noisy.",
    highlight: "We make you heard.",
    body: "Six billion posts a day. We design the one that stops the scroll.",
    tone: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(10,10,10,0.6) 60%, rgba(10,10,10,0.95))",
    align: "center",
  },
  {
    img: "/images/scene-cars.png",
    eyebrow: "Scene 02 / Automotive",
    title: "Ads that",
    highlight: "turn heads.",
    body: "From hypercars to fleet rollouts — cinematic spots that make engines feel like art.",
    tone: "linear-gradient(135deg, rgba(255,107,0,0.25), rgba(10,10,10,0.6) 60%, rgba(10,10,10,0.95))",
    align: "left",
  },
  {
    img: "/images/scene-fashion.png",
    eyebrow: "Scene 03 / Fashion",
    title: "Style that speaks.",
    highlight: "Ads that sell.",
    body: "Editorial-grade product stories for the brands wearing tomorrow.",
    tone: "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(10,10,10,0.6) 60%, rgba(10,10,10,0.95))",
    align: "right",
  },
  {
    img: "/images/scene-industrial.jpg",
    eyebrow: "Scene 04 / Industrial",
    title: "Engineered for impact.",
    highlight: "Built for business.",
    body: "B2B campaigns that translate complex machinery into clear value.",
    tone: "linear-gradient(135deg, rgba(255,107,0,0.25), rgba(10,10,10,0.6) 60%, rgba(10,10,10,0.95))",
    align: "left",
  },
  {
    img: "/images/scene-food.png",
    eyebrow: "Scene 05 / Food & Beverage",
    title: "Taste the success.",
    highlight: "Sip on engagement.",
    body: "Hi-speed product photography and craveable short-form video.",
    tone: "linear-gradient(135deg, rgba(239,68,68,0.18), rgba(10,10,10,0.6) 60%, rgba(10,10,10,0.95))",
    align: "right",
  },
  {
    img: "/images/scene-tech.png",
    eyebrow: "Scene 06 / Tech & Apps",
    title: "Apps that click.",
    highlight: "Ads that convert.",
    body: "App install campaigns optimized end-to-end — from creative to CPI.",
    tone: "linear-gradient(135deg, rgba(6,182,212,0.25), rgba(10,10,10,0.6) 60%, rgba(10,10,10,0.95))",
    align: "left",
  },
  {
    img: "/images/scene-events.png",
    eyebrow: "Scene 07 / Events",
    title: "Events that echo.",
    highlight: "Memories that last.",
    body: "Pre-launch buzz, day-of capture, post-event amplification — done.",
    tone: "linear-gradient(135deg, rgba(168,85,247,0.25), rgba(10,10,10,0.6) 60%, rgba(10,10,10,0.95))",
    align: "right",
  },
  {
    img: "/images/scene-nature.png",
    eyebrow: "Scene 08 / Lifestyle",
    title: "Life looks",
    highlight: "better here.",
    body: "Aspirational lifestyle storytelling for outdoor, wellness, and travel brands.",
    tone: "linear-gradient(135deg, rgba(255,140,0,0.2), rgba(10,10,10,0.6) 60%, rgba(10,10,10,0.95))",
    align: "left",
  },
];

const GLOBE_NODES = [
  [20, 30], [70, 25], [40, 55], [80, 60], [25, 70], [55, 80], [65, 45],
];

const STATS = [
  { value: "10M+", label: "Ads published" },
  { value: "150+", label: "Countries" },
  { value: "98.7%", label: "Satisfaction" },
  { value: "3.2B+", label: "Impressions" },
];

export default function ScrollCinema() {
  const cinemaRef = useRef(null);
  const stickyRef = useRef(null);
  const scenesRef = useRef([]);
  const imagesRef = useRef([]);
  const textsRef = useRef([]);
  const globeRef = useRef(null);
  const finaleRef = useRef(null);
  const progressRef = useRef(null);

  useGSAP(() => {
    const totalScenes = SCENES.length + 2; // +globe +finale
    const cinema = cinemaRef.current;
    const sticky = stickyRef.current;

    // Master timeline — scrubbed by scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: cinema,
        start: "top top",
        end: "bottom bottom",
        pin: sticky,
        scrub: 1,
        onUpdate: (self) => {
          if (progressRef.current) {
            progressRef.current.style.height = `${self.progress * 100}%`;
          }
        },
      },
    });

    // Each scene: fade in image with scale + parallax, show text, then fade out
    const sceneDuration = 1;
    const transitionDuration = 0.3;

    SCENES.forEach((_, i) => {
      const scene = scenesRef.current[i];
      const img = imagesRef.current[i];
      const text = textsRef.current[i];
      if (!scene || !img || !text) return;

      const position = i * sceneDuration;

      // Image starts scaled up and shifts down (parallax), then slowly zooms out and shifts up
      tl.fromTo(scene,
        { opacity: 0 },
        { opacity: 1, duration: transitionDuration, ease: "power2.inOut" },
        position
      );
      tl.fromTo(img,
        { scale: 1.15, y: 40 },
        { scale: 1.0, y: -30, duration: sceneDuration, ease: "none" },
        position
      );
      // Text slides up and fades in, then back out
      tl.fromTo(text,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: transitionDuration, ease: "power2.out" },
        position + transitionDuration * 0.3
      );
      tl.to(text,
        { opacity: 0, y: -40, duration: transitionDuration, ease: "power2.in" },
        position + sceneDuration - transitionDuration
      );
      tl.to(scene,
        { opacity: 0, duration: transitionDuration, ease: "power2.inOut" },
        position + sceneDuration - transitionDuration
      );
    });

    // Globe scene
    const globePos = SCENES.length * sceneDuration;
    if (globeRef.current) {
      tl.fromTo(globeRef.current,
        { opacity: 0 },
        { opacity: 1, duration: transitionDuration, ease: "power2.inOut" },
        globePos
      );
      tl.to(globeRef.current,
        { opacity: 0, duration: transitionDuration, ease: "power2.inOut" },
        globePos + sceneDuration - transitionDuration
      );
    }

    // Finale
    const finalePos = (SCENES.length + 1) * sceneDuration;
    if (finaleRef.current) {
      tl.fromTo(finaleRef.current,
        { opacity: 0, scale: 0.6 },
        { opacity: 1, scale: 1, duration: transitionDuration * 2, ease: "power3.out" },
        finalePos
      );
    }
  }, { scope: cinemaRef });

  // Total scroll height: each scene = ~120vh
  const totalHeight = (SCENES.length + 2) * 120;

  return (
    <section ref={cinemaRef} className={styles.cinema} style={{ height: `${totalHeight}vh` }}>
      <div ref={stickyRef} className={styles.sticky}>

        {/* Category Scenes */}
        {SCENES.map((s, i) => {
          const alignClass =
            s.align === "left" ? styles.alignLeft :
            s.align === "right" ? styles.alignRight :
            styles.alignCenter;

          return (
            <div
              key={i}
              ref={(el) => (scenesRef.current[i] = el)}
              className={styles.scene}
            >
              <img
                ref={(el) => (imagesRef.current[i] = el)}
                src={s.img}
                alt=""
                className={styles.sceneImage}
                loading="lazy"
              />
              <div className={styles.sceneOverlayTone} style={{ background: s.tone }} />
              <div className={styles.sceneOverlayBottom} />

              <div className={styles.sceneContent}>
                <div
                  ref={(el) => (textsRef.current[i] = el)}
                  className={`${styles.sceneContentInner} ${alignClass}`}
                >
                  <p className={styles.sceneEyebrow}>{s.eyebrow}</p>
                  <h3 className={styles.sceneTitle}>
                    {s.title}{" "}
                    <span className="text-crush">{s.highlight}</span>
                  </h3>
                  <p className={styles.sceneBody}>{s.body}</p>
                  <div className={styles.socialFrames}>
                    <div className={styles.socialBadge}>
                      <span className={styles.socialDot} />
                      Sponsored · 2.1M views
                    </div>
                    <div className={styles.socialBadge}>
                      ♥ 184k · 12.3k shares
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Globe Scene */}
        <div ref={globeRef} className={styles.scene} style={{ background: "var(--bg-primary)" }}>
          <div className={styles.sceneContent}>
            <div className={`${styles.sceneContentInner} ${styles.alignCenter}`}
              style={{ justifyContent: "center", alignItems: "center" }}
            >
              {/* CSS Globe */}
              <div className={styles.globeWrap}>
                <div className={styles.globeFrame}>
                  {[20, 40, 60, 80].map((p) => (
                    <div key={p} className={styles.globeLine} style={{ top: `${p}%` }} />
                  ))}
                  {[15, 30, 45, 60, 75, 90].map((p) => (
                    <div key={p} className={styles.globeMeridian} style={{ left: `${p}%` }} />
                  ))}
                  {GLOBE_NODES.map(([x, y], idx) => (
                    <div key={idx} className={styles.globeNode} style={{ left: `${x}%`, top: `${y}%` }} />
                  ))}
                </div>
                <div className={styles.globeHalo} />
                <div className={styles.globeOrbit} />
              </div>

              {/* Stats */}
              <div className={styles.statsGrid}>
                {STATS.map((s) => (
                  <div key={s.label} className={styles.statCard}>
                    <p className={`${styles.statValue} text-crush`}>{s.value}</p>
                    <p className={styles.statLabel}>{s.label}</p>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: "center" }}>
                <p className={styles.sceneEyebrow}>Scene 09 / The Network</p>
                <h3 className={styles.sceneTitle} style={{ marginTop: 12 }}>
                  Global reach. <span className="text-crush">Local impact.</span>
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Finale */}
        <div ref={finaleRef} className={styles.scene} style={{ background: "var(--bg-primary)" }}>
          <div className={styles.sceneContent}>
            <div className={`${styles.sceneContentInner} ${styles.alignCenter}`}
              style={{ justifyContent: "center", alignItems: "center", gap: 40 }}
            >
              <div className={styles.finaleTitle}>
                <span style={{ color: "var(--text-primary)" }}>AD</span>
                <span className="text-crush">CRUSH</span>
              </div>
              <p className={styles.finaleTagline}>
                Ready to crush your competition?
              </p>
              <Link href="/add-yours" className={styles.finaleCta}>
                Start your campaign
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className={styles.progressTrack}>
          <div ref={progressRef} className={styles.progressFill} style={{ height: "0%" }} />
        </div>
      </div>
    </section>
  );
}
