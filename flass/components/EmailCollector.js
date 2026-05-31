"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./EmailCollector.module.css";

export default function EmailCollector() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [responseMsg, setResponseMsg] = useState("");
  const [count, setCount] = useState(0);
  const [tiltStyle, setTiltStyle] = useState({});
  const [honeypot, setHoneypot] = useState("");
  const cardRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch subscriber count on mount
  useEffect(() => {
    fetch("/api/subscribe")
      .then((r) => r.json())
      .then((d) => { if (d.count) setCount(d.count); })
      .catch(() => {});
  }, []);

  // 3D tilt effect on mouse move
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    setTiltStyle({
      transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Honeypot
    if (honeypot) return;

    if (!email.trim()) {
      setStatus("error");
      setErrorMsg("Please enter your email");
      inputRef.current?.focus();
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setErrorMsg("Please enter a valid email address");
      inputRef.current?.focus();
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "email-collector", _hp_field: "" }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong.");
        return;
      }

      setStatus("success");
      setResponseMsg(data.message || "You're in! Welcome to the Crush List.");
      setEmail("");
      setCount((c) => (data.alreadyExists ? c : c + 1));
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setErrorMsg("");
    setResponseMsg("");
    setEmail("");
  };

  return (
    <section className={`${styles.section} noise`}>
      {/* Floating 3D orbs */}
      <div className={styles.orbField}>
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />
      </div>

      <div className={styles.container}>
        {/* 3D Card */}
        <div
          ref={cardRef}
          className={styles.card}
          style={tiltStyle}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Animated border gradient */}
          <div className={styles.cardBorder} />
          <div className={styles.cardInner}>

            {/* Success State */}
            {status === "success" ? (
              <div className={styles.successWrap}>
                <div className={styles.successIcon}>
                  <svg viewBox="0 0 24 24" fill="none" className={styles.checkSvg}>
                    <circle cx="12" cy="12" r="10" stroke="var(--success)" strokeWidth="2" className={styles.checkCircle} />
                    <path d="M8 12l3 3 5-5" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.checkMark} />
                  </svg>
                </div>
                <h3 className={styles.successTitle}>{responseMsg}</h3>
                <p className={styles.successSub}>Check your inbox for a welcome gift.</p>
                <button onClick={handleReset} className={styles.resetLink}>Subscribe another email</button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className={styles.header}>
                  <div className={styles.iconWrap}>
                    <svg viewBox="0 0 24 24" fill="none" className={styles.mailIcon}>
                      <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M2 7l8.9 5.3a2 2 0 002.2 0L22 7" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    <div className={styles.iconPulse} />
                  </div>

                  <p className={styles.label}>Newsletter</p>
                  <h2 className={styles.title}>
                    Join the <span className="text-crush">Crush List</span>
                  </h2>
                  <p className={styles.subtitle}>
                    Get weekly ad breakdowns, creative inspiration, and exclusive offers.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className={styles.form}>
                  {/* Honeypot */}
                  <input
                    name="_hp_field"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
                  />

                  <div className={styles.inputGroup}>
                    <div className={`${styles.inputWrap} ${status === "error" ? styles.inputError : ""}`}>
                      <svg viewBox="0 0 24 24" fill="none" className={styles.inputIcon}>
                        <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M2 7l8.9 5.3a2 2 0 002.2 0L22 7" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                      <input
                        ref={inputRef}
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (status === "error") { setStatus("idle"); setErrorMsg(""); }
                        }}
                        placeholder="you@company.com"
                        disabled={status === "loading"}
                        className={styles.input}
                        autoComplete="email"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className={styles.submitBtn}
                    >
                      <span className={styles.btnContent}>
                        {status === "loading" ? (
                          <>
                            <svg viewBox="0 0 24 24" fill="none" className={styles.spinner}>
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="50" strokeLinecap="round" />
                            </svg>
                            Subscribing...
                          </>
                        ) : (
                          <>
                            Subscribe
                            <svg viewBox="0 0 24 24" fill="none" className={styles.arrowIcon}>
                              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </>
                        )}
                      </span>
                    </button>
                  </div>

                  {/* Error message */}
                  {status === "error" && (
                    <div className={styles.errorMsg}>
                      <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      {errorMsg}
                    </div>
                  )}
                </form>

                {/* Trust signals */}
                <div className={styles.trust}>
                  <span className={styles.trustItem}>
                    <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    No spam, ever
                  </span>
                  <span className={styles.trustDot}>•</span>
                  <span className={styles.trustItem}>Unsubscribe anytime</span>
                  {count > 0 && (
                    <>
                      <span className={styles.trustDot}>•</span>
                      <span className={styles.trustItem}>
                        <strong style={{ color: "var(--accent-orange)" }}>{count.toLocaleString()}</strong> subscribers
                      </span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
