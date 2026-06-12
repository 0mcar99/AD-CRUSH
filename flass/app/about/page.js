"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { HelpCircle } from "lucide-react";
import styles from "./about.module.css";

gsap.registerPlugin(ScrollTrigger);

/* ---- Data ---- */
const PROCESS = [
  { n: "01", title: "Discovery", desc: "We understand your product, audience, and goals.", image: "/process/discover.png" },
  { n: "02", title: "Strategy", desc: "Our experts craft a tailored campaign strategy.", image: "/process/strategy.png" },
  { n: "03", title: "Creation", desc: "World-class designers and animators bring your vision to life.", image: "/process/creation.png" },
  { n: "04", title: "Optimization", desc: "AI-powered targeting reaches the right people.", image: "/process/optimisation.svg" },
  { n: "05", title: "Launch", desc: "Your ad goes live across multiple platforms simultaneously.", image: "/process/launch.svg" },
  { n: "06", title: "Analytics", desc: "Real-time tracking and continuous improvement.", image: "/process/analytic.svg" },
];

const TIMING = [
  { icon: "⏰", title: "Smart scheduling", desc: "AI determines optimal posting times for maximum engagement." },
  { icon: "📅", title: "Campaign calendars", desc: "Visual timeline of your campaign lifecycle, end to end." },
  { icon: "🔄", title: "Retargeting", desc: "Automated follow-up ads for users who already engaged." },
  { icon: "⚡", title: "Real-time adjustments", desc: "Live bid optimization and budget management." },
];

const SECURITY = [
  { icon: "🔒", title: "End-to-end encryption", desc: "All data transmitted via TLS 1.3." },
  { icon: "🛡️", title: "Fraud protection", desc: "AI-powered click fraud detection and prevention." },
  { icon: "👁️", title: "Privacy first", desc: "Zero third-party data selling. Ever." },
  { icon: "💳", title: "Secure payments", desc: "PCI-DSS compliant payment processing." },
  { icon: "📋", title: "Data control", desc: "Full export, deletion, and portability rights." },
  { icon: "🌐", title: "Global compliance", desc: "GDPR, CCPA, and LGPD ready." },
];

const STATS = [
  { value: 10000000, suffix: "M+", label: "Ads published", divisor: 1000000 },
  { value: 150, suffix: "+", label: "Countries reached", divisor: 1 },
  { value: 98.7, suffix: "%", label: "Client satisfaction", divisor: 1, decimals: 1 },
  { value: 3200000000, suffix: "B+", label: "Total impressions", divisor: 1000000000 },
  { value: 2.1, suffix: "B+", label: "Revenue generated ($)", divisor: 1, decimals: 1, prefix: "" },
  { value: 0.5, suffix: "s", label: "Avg page load", divisor: 1, decimals: 1, prefix: "<" },
];

const CITIES = [
  { region: "London", image: "/cities/london.png" },
  { region: "Tokyo", image: "/cities/tokyo.png" },
  { region: "Mexico City", image: "/cities/mexico_city.png" },
  { region: "Berlin", image: "/cities/berlin.png" },
  { region: "Mumbai", image: "/cities/mumbai.png" },
  { region: "New York", image: "/cities/new_york.png" },
  { region: "Dubai", image: "/cities/dubai.png" },
  { region: "Stockholm", image: "/cities/stockholm.png" },
];

const PLATFORMS = ["Instagram","Facebook","TikTok","YouTube","X","LinkedIn","Google Ads","Pinterest","Snapchat","Spotify","+50 more"];
const BADGES = ["SSL Encryption","GDPR","ISO 27001","SOC 2 Type II","PCI-DSS"];
const PROCESS_CIRCLE = ["Consult","Create","Review","Launch"];

/* ---- Animated Counter ---- */
function Counter({ to, divisor = 1, decimals = 0, suffix = "", prefix = "" }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      const start = performance.now();
      const dur = 1800;
      const tick = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(eased * (to / divisor));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      obs.disconnect();
    }, { threshold: 0.4 });
    obs.observe(node);
    return () => obs.disconnect();
  }, [to, divisor]);
  return <span ref={ref}>{prefix}{val.toFixed(decimals)}{suffix}</span>;
}

/* ---- Reveal wrapper (GSAP scroll) ---- */
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  useGSAP(() => {
    gsap.from(ref.current, {
      opacity: 0, y: 40, duration: 0.7, delay,
      ease: "power3.out",
      scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
    });
  }, { scope: ref });
  return <div ref={ref}>{children}</div>;
}

/* ---- Page ---- */
export default function AboutPage() {
  const [openFaqIdx, setOpenFaqIdx] = useState(0);
  return (
    <>
      {/* Header */}
      <section className={`${styles.section} bg-mesh noise`} style={{ paddingTop: 160 }}>
        <div className="container">
          <Reveal>
            <p className="label" style={{ marginBottom: 24 }}>About</p>
            <h1 className={styles.heroTitle}>
              About <span className="text-crush">Ad Crush.</span>
            </h1>
            <p className={styles.heroSubtitle}>The story behind the impact.</p>
          </Reveal>
        </div>
      </section>

      {/* Mission */}
      <section className={styles.section} style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <div className={styles.splitGrid}>
            <Reveal>
              <p className="label" style={{ marginBottom: 24 }}>Our mission</p>
              <h2 className={styles.sectionTitle}>
                Every product deserves to be <span className="text-crush">seen.</span>
              </h2>
              <p className={styles.bodyText}>
                At Ad Crush, every event deserves an audience and every brand deserves to make an impact. We&apos;re not just an ad platform — we&apos;re your launchpad to global recognition.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className={styles.illustrationBox}>
                <svg viewBox="0 0 200 200" className={styles.rocketSvg}>
                  <defs>
                    <linearGradient id="rk" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#FF6B00" />
                      <stop offset="1" stopColor="#FF8C00" />
                    </linearGradient>
                  </defs>
                  <g style={{ animation: "float-y 6s ease-in-out infinite" }}>
                    <path d="M100 30 L130 110 L100 95 L70 110 Z" fill="url(#rk)" />
                    <circle cx="100" cy="80" r="8" fill="#0A0A0A" />
                    <path d="M85 110 L100 170 L115 110 Z" fill="#FF6B00" opacity="0.6" />
                  </g>
                </svg>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* How We Produce — Timeline */}
      <section className={styles.section} style={{ borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <Reveal>
            <p className="label" style={{ marginBottom: 16 }}>How we produce</p>
            <h2 className={styles.sectionTitle}>
              Six steps from <span className="text-crush">brief to broadcast.</span>
            </h2>
          </Reveal>
          <div className={styles.timeline}>
            {PROCESS.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.05}>
                <div className={`${styles.timelineItem} ${i % 2 === 1 ? styles.timelineRight : ""}`}>
                  <div className={styles.timelineCard}>
                    {p.image ? (
                      <div className={styles.timelineImageWrapper}>
                        <img src={p.image} alt={p.title} className={styles.timelineImage} />
                      </div>
                    ) : (
                      <div className={styles.timelineIcon}>{p.icon}</div>
                    )}
                    <span className={styles.timelineStep}>Step {p.n}</span>
                    <h3 className={styles.timelineTitle}>{p.title}</h3>
                    <p className={styles.timelineDesc}>{p.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How We Publish — Map */}
      <section className={styles.section} style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <Reveal>
            <p className="label" style={{ marginBottom: 16 }}>How we publish</p>
            <h2 className={styles.sectionTitle}>
              Your ad doesn&apos;t just go live. It goes <span className="text-crush">everywhere.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className={styles.mapBox} style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <img 
                src="/images/scene-reach.png" 
                alt="Multi-Platform Ad Reach" 
                style={{ 
                  width: "100%", 
                  height: "auto",
                  maxHeight: "650px", 
                  objectFit: "contain",
                  background: "#080810",
                  borderBottom: "1px solid var(--border)",
                  opacity: 0.95
                }} 
              />
              <div className={styles.platformTags} style={{ padding: "24px 40px 40px", justifyContent: "center" }}>
                {PLATFORMS.map((p) => (
                  <span key={p} className={styles.platformTag}>{p}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Timing */}
      <section className={styles.section} style={{ borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <Reveal>
            <p className="label" style={{ marginBottom: 16 }}>Timing</p>
            <h2 className={styles.sectionTitle}>
              The right ad at <span className="text-crush">the right time.</span>
            </h2>
          </Reveal>
          <div className={styles.cardGrid4}>
            {TIMING.map((t, i) => (
              <Reveal key={t.title} delay={i * 0.06}>
                <div className={styles.featureCard}>
                  <span style={{ fontSize: 28 }}>{t.icon}</span>
                  <h3 className={styles.featureTitle}>{t.title}</h3>
                  <p className={styles.featureDesc}>{t.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Process Circle */}
      <section className={styles.section} style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <div className={styles.splitGrid}>
            <Reveal>
              <p className="label" style={{ marginBottom: 16 }}>Work process</p>
              <h2 className={styles.sectionTitle}>
                Transparency. Collaboration. <span className="text-crush">Excellence.</span>
              </h2>
              <p className={styles.bodyText}>A continuous loop — never a one-and-done deliverable.</p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className={styles.circleWrap}>
                <div className={styles.circleRing} />
                {PROCESS_CIRCLE.map((q, i) => {
                  const deg = i * 90;
                  const r = 42;
                  const x = 50 + r * Math.cos((deg - 90) * Math.PI / 180);
                  const y = 50 + r * Math.sin((deg - 90) * Math.PI / 180);
                  return (
                    <div key={q} className={styles.circleNode} style={{ left: `${x}%`, top: `${y}%` }}>
                      {q}
                    </div>
                  );
                })}
                <div className={styles.circleCenter}>∞</div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className={styles.section} style={{ borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <Reveal>
            <p className="label" style={{ marginBottom: 16 }}>Security & privacy</p>
            <h2 className={styles.sectionTitle}>
              Your data is sacred. <span className="text-crush">Your trust is earned.</span>
            </h2>
            <div className={styles.badgeRow}>
              {BADGES.map((b) => (
                <span key={b} className={styles.badge}>{b}</span>
              ))}
            </div>
          </Reveal>
          <div className={styles.cardGrid3}>
            {SECURITY.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.05}>
                <div className={styles.featureCard}>
                  <span style={{ fontSize: 28 }}>{s.icon}</span>
                  <h3 className={styles.featureTitle}>{s.title}</h3>
                  <p className={styles.featureDesc}>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.section} style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <Reveal>
            <p className="label" style={{ marginBottom: 16 }}>By the numbers</p>
            <h2 className={styles.sectionTitle}>
              Numbers that speak <span className="text-crush">louder than words.</span>
            </h2>
          </Reveal>
          <div className={styles.cardGrid3}>
            {STATS.map((s) => (
              <Reveal key={s.label}>
                <div className={styles.statBox}>
                  <p className={`${styles.statValue} text-crush`}>
                    <Counter to={s.value} divisor={s.divisor} decimals={s.decimals ?? 0} suffix={s.suffix} prefix={s.prefix ?? ""} />
                  </p>
                  <p className={styles.statLabel}>{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className={styles.section} style={{ borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <Reveal>
            <p className="label" style={{ marginBottom: 16 }}>Global Reach</p>
            <h2 className={styles.sectionTitle}>
              Crushing boundaries. <span className="text-crush">Connecting global markets.</span>
            </h2>
          </Reveal>
          <div className={styles.teamGrid}>
            {CITIES.map((c, i) => (
              <Reveal key={c.region} delay={i * 0.04}>
                <div className={styles.teamCard}>
                  <div 
                    className={styles.teamAvatar}
                    style={c.image ? {
                      backgroundImage: `url(${c.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    } : {}}
                  >
                    {!c.image && c.region.slice(0, 2).toUpperCase()}
                  </div>
                  <div className={styles.teamInfo} style={{ textAlign: "center" }}>
                    <h3 className={styles.teamName} style={{ margin: 0, fontSize: "1.1rem", letterSpacing: "0.05em" }}>{c.region}</h3>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.section} style={{ borderTop: "1px solid var(--border)", paddingBottom: 100 }}>
        <div className="container">
          <Reveal>
            <p className="label" style={{ marginBottom: 16 }}>Information Center</p>
            <h2 className={styles.sectionTitle}>
              Frequently Asked <span className="text-crush">Questions.</span>
            </h2>
            <p className={styles.bodyText} style={{ marginBottom: 40, maxWidth: "600px" }}>
              Clear details about our campaign publishing services, AI optimization, and how to scale your brand.
            </p>
          </Reveal>

          <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              {
                q: "What services does Ad Crush offer?",
                a: "Ad Crush is a full-service ad publishing platform that handles your digital marketing campaigns end-to-end: discovery, strategic planning, high-impact creative production, AI-powered audience targeting, multi-platform launch, and real-time performance analytics."
              },
              {
                q: "On which platforms does Ad Crush publish campaigns?",
                a: "We publish and manage advertising campaigns across 50+ major platforms, including Instagram, Facebook, TikTok, YouTube, X (Twitter), LinkedIn, Google Ads, Pinterest, Snapchat, and Spotify, to maximize your brand's reach."
              },
              {
                q: "How does Ad Crush optimize targeting and budget?",
                a: "We leverage AI-powered optimization to analyze audience demographics, bidding cycles, and platform velocity in real-time. This ensures your campaigns target high-intent users at optimal times to maximize CTR and ROAS while preventing ad spend wastage."
              },
              {
                q: "Who is Ad Crush designed for?",
                a: "Ad Crush serves brands of all sizes, from tech apps and automotive manufacturers to lifestyle, fashion, food & beverage, event organizers, and industrial B2B companies looking to expand their global presence."
              },
              {
                q: "How do I start my campaign with Ad Crush?",
                a: "Simply navigate to the 'Add Yours' section of our website, fill out your brand and campaign details, and submit the form. Our creative and strategy team will review your submission and contact you within 24 hours to begin the campaign process."
              }
            ].map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <Reveal key={idx} delay={idx * 0.05}>
                  <div
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      background: "var(--bg-secondary)",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      boxShadow: isOpen ? "0 4px 20px rgba(0, 0, 0, 0.2)" : "none",
                    }}
                  >
                    <div
                      style={{
                        padding: "24px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        gap: "16px",
                      }}
                      onClick={() => setOpenFaqIdx(isOpen ? -1 : idx)}
                    >
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "1.1rem",
                          fontWeight: 600,
                          color: isOpen ? "var(--accent-orange)" : "var(--text-primary)",
                          transition: "color 0.2s ease",
                          fontFamily: "var(--font-outfit)",
                        }}
                      >
                        {faq.q}
                      </h3>
                      <HelpCircle
                        size={20}
                        style={{
                          color: isOpen ? "var(--accent-orange)" : "var(--text-muted)",
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "all 0.3s ease",
                          flexShrink: 0,
                        }}
                      />
                    </div>
                    {isOpen && (
                      <div
                        style={{
                          padding: "0 24px 24px 24px",
                          borderTop: "1px solid rgba(255, 255, 255, 0.03)",
                        }}
                      >
                        <p
                          style={{
                            margin: "16px 0 0 0",
                            fontSize: "0.95rem",
                            lineHeight: "1.6",
                            color: "var(--text-secondary)",
                            fontFamily: "var(--font-inter)",
                          }}
                        >
                          {faq.a}
                        </p>
                      </div>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

    </>
  );
}
