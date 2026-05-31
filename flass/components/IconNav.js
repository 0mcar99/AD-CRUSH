"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./IconNav.module.css";

gsap.registerPlugin(ScrollTrigger);

const cards = [
  {
    href: "/about",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.icon}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    label: "About Us",
    desc: "Discover who we are and how we make ads that actually move people.",
  },
  {
    href: "/products",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.icon}>
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    label: "Products",
    desc: "Explore the campaigns we've published — across every category that matters.",
  },
  {
    href: "/add-yours",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.icon}>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    label: "Add Yours",
    desc: "List your product, event, or brand. Our team takes it from here.",
  },
];

export default function IconNav() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    const cardEls = sectionRef.current.querySelectorAll("[data-card]");
    gsap.to(cardEls, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        once: true,
      },
    });
  }, { scope: sectionRef });

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <p className="label" style={{ marginBottom: 16 }}>Choose your path</p>
            <h2 className={styles.headerTitle}>
              Three doors. <span className="text-crush">One impact.</span>
            </h2>
          </div>
          <p className={styles.headerDesc}>
            Whether you&apos;re here to learn, browse, or launch — we made the path obvious.
          </p>
        </div>

        <div className={styles.grid}>
          {cards.map((c, i) => (
            <Link key={c.href} href={c.href} className={styles.card} data-card>
              <div className={styles.cardGlow} />
              <div className={styles.cardInner}>
                <div className={styles.iconWrap}>{c.icon}</div>
                <p className={styles.cardNum}>
                  {String(i + 1).padStart(2, "0")} / 03
                </p>
                <h3 className={styles.cardLabel}>{c.label}</h3>
                <p className={styles.cardDesc}>{c.desc}</p>
                <div className={styles.cardAction}>
                  Enter <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
