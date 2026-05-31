"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./addyours.module.css";
import InboxPanel from "../../components/InboxPanel";
import AuthModal from "../../components/AuthModal";
import AdminPanel from "../../components/AdminPanel";

const STEPS = [
  { q: "Hey there! 👋 Welcome to Ad Crush. Let's get your campaign rolling. First up — what's your name?", type: "text", key: "name", placeholder: "Your full name" },
  { q: "Nice to meet you, {name}! What's your email so we can stay in touch?", type: "text", key: "email", placeholder: "you@company.com" },
  { q: "What are you advertising? Choose the best fit:", type: "options", key: "adType", options: ["Product", "Event", "Company", "App", "Service", "Other"] },
  { q: "What's the name of your {adType}?", type: "text", key: "productName", placeholder: "e.g. Apex GT-1, NovaPad, etc." },
  { q: 'Great! "{productName}" — love it. Give us a tagline or one-liner:', type: "text", key: "tagline", placeholder: "Make it punchy!" },
  { q: "Now, describe it in detail. What makes it special?", type: "textarea", key: "description", placeholder: "Tell us everything — features, benefits, story..." },
  { q: "Which category fits best?", type: "options", key: "category", options: ["Automotive", "Fashion", "Tech", "Food & Beverage", "Events", "Lifestyle", "Industrial", "Health", "Education", "Other"] },
  { q: "Who's your target audience?", type: "options", key: "audience", options: ["Gen Z (18-24)", "Millennials (25-34)", "Adults (35-50)", "Seniors (50+)", "Everyone", "B2B / Professionals"] },
  { q: "Which platforms do you want to target?", type: "multi", key: "platforms", options: ["Instagram", "Facebook", "TikTok", "YouTube", "X (Twitter)", "LinkedIn", "Google Ads", "Pinterest"] },
  { q: "What's your estimated budget range?", type: "options", key: "budget", options: ["Under $500", "$500 - $2,000", "$2,000 - $10,000", "$10,000 - $50,000", "$50,000+", "Let\u0027s discuss"] },
  { q: "When do you want to launch?", type: "options", key: "timeline", options: ["ASAP", "Within 1 week", "Within 1 month", "Within 3 months", "Flexible"] },
  { q: "How long should the campaign run?", type: "options", key: "duration", options: ["1 week", "2 weeks", "1 month", "3 months", "6 months", "Ongoing"] },
  { q: "Have a website or social link? (optional)", type: "text", key: "website", placeholder: "https://..." },
  { q: "Any special requests or notes for our team?", type: "textarea", key: "notes", placeholder: "Anything else we should know..." },
  { q: "review", type: "review", key: "_review" },
];

function interpolate(str, data) {
  return str.replace(/\{(\w+)\}/g, (_, k) => data[k] || k);
}

export default function AddYoursPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const [current, setCurrent] = useState("");
  const [multiSel, setMultiSel] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [formStartedAt] = useState(Date.now());
  const [hpValue, setHpValue] = useState("");
  const bottomRef = useRef(null);

  const [user, setUser] = useState(null);
  const [showInbox, setShowInbox] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMsg, setAuthMsg] = useState("");
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const s = STEPS[step];

  useEffect(() => {
    fetch("/api/auth/check")
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated) {
          setUser({ email: d.email, role: d.role });
          setData((prev) => ({ ...prev, email: d.email })); // Pre-populate email
        }
      })
      .catch(() => {});
  }, []);

  const handleInboxClick = () => {
    if (user) {
      setShowInbox(true);
    } else {
      setAuthMsg("Please log in to access your Inbox.");
      setShowAuth(true);
    }
  };

  const handleAuthSuccess = (userData) => {
    const verifiedUser = { email: userData.email, role: userData.role || "user" };
    setUser(verifiedUser);
    setShowAuth(false);
    
    // Auto-update email and trigger submission instantly!
    setData((prev) => {
      const updated = { ...prev, email: userData.email };
      submitCampaign(updated, verifiedUser);
      return updated;
    });
  };

  useEffect(() => {
    if (step > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [step, history]);

  const pushHistory = (question, answer) => {
    setHistory((h) => [...h, { q: question, a: answer }]);
  };

  const advance = (answer) => {
    const q = interpolate(s.q, data);
    pushHistory(q, answer);
    const newData = { ...data, [s.key]: answer };
    setData(newData);
    setCurrent("");
    setMultiSel([]);
    
    // If we completed step 0 (name) and user is logged in, skip step 1 (email) and go to step 2 (adType)
    if (step === 0 && user) {
      const finalData = { ...newData, email: user.email };
      setData(finalData);
      setStep(2);
    } else {
      setStep((p) => p + 1);
    }
  };

  const submitCampaign = async (campaignData, currentUser) => {
    setSubmitting(true);
    setSubmitError("");
    pushHistory("All set! Submitting your campaign…", "✓");

    try {
      const payload = {
        ...campaignData,
        email: currentUser.email, // Force secure authenticated email
        _formStartedAt: formStartedAt,
        _hp_field: hpValue
      };

      // 1. Submit campaign metadata to /api/submissions
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok) {
        setSubmitError(result.error || "Submission failed. Please try again.");
        setSubmitting(false);
        return;
      }

      // 2. Submit formatted summary to chats so both user and admin can see it in Chat tab
      const summaryText = `🚀 **New Campaign Enrolled**
• **Product Name**: ${payload.productName || "N/A"}
• **Ad Type**: ${payload.adType || "N/A"}
• **Tagline**: "${payload.tagline || "N/A"}"
• **Category**: ${payload.category || "N/A"}
• **Target Audience**: ${payload.audience || "N/A"}
• **Platforms**: ${Array.isArray(payload.platforms) ? payload.platforms.join(", ") : payload.platforms || "N/A"}
• **Budget**: ${payload.budget || "N/A"}
• **Timeline**: ${payload.timeline || "N/A"}
• **Duration**: ${payload.duration || "N/A"}
• **Website**: ${payload.website || "None"}
• **Special Requests**: ${payload.notes || "None"}
• **Description**: ${payload.description || "N/A"}`;

      await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          text: summaryText
        })
      });

      setSubmitted(true);
      import("canvas-confetti").then((mod) => {
        const fire = mod.default;
        fire({ particleCount: 150, spread: 80, origin: { y: 0.7 }, colors: ["#FF6B00", "#FF8C00", "#3B82F6", "#FFFFFF"] });
      });
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setAuthMsg("Please log in or register to complete your campaign submission and access your inbox.");
      setShowAuth(true);
      return;
    }
    await submitCampaign(data, user);
  };

  const goBack = () => {
    if (step === 0) return;

    // If we go back from step 2 (adType) and user is logged in, skip back to step 0 (name)
    if (step === 2 && user) {
      const prevKey = STEPS[0].key;
      const newData = { ...data };
      delete newData[prevKey];
      delete newData.email;
      setData(newData);
      setHistory((h) => h.slice(0, -1));
      setStep(0);
    } else {
      const prevKey = STEPS[step - 1].key;
      const newData = { ...data };
      delete newData[prevKey];
      setData(newData);
      setHistory((h) => h.slice(0, -1));
      setStep((p) => p - 1);
    }
  };

  const progress = (step / STEPS.length) * 100;

  if (submitted) {
    return (
      <section className={`${styles.page} bg-mesh noise`}>
        <div className={styles.successWrap}>
          <div className={styles.successIcon}>🎉</div>
          <h2 className={styles.successTitle}>
            You&apos;re <span className="text-crush">Crushing It!</span>
          </h2>
          <p className={styles.successBody}>
            Your campaign for &ldquo;{data.productName}&rdquo; has been submitted.
            Our team will review it within 24 hours.
          </p>
          <p className={styles.successSub}>Check your email at <strong>{data.email}</strong> for updates.</p>
          <a href="/" className={styles.successBtn}>Back to Home →</a>
        </div>
      </section>
    );
  }

  return (
    <section className={`${styles.page} bg-mesh noise`}>
      {/* Progress */}
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <div className={styles.chat}>
        {/* History */}
        {history.map((h, i) => (
          <div key={i} className={styles.exchange}>
            <div className={styles.botBubble}>
              <div className={styles.avatar}>AC</div>
              <div className={styles.bubble}>{h.q}</div>
            </div>
            <div className={styles.userBubble}>
              <div className={styles.bubbleUser}>{Array.isArray(h.a) ? h.a.join(", ") : h.a}</div>
            </div>
          </div>
        ))}

        {/* Current question */}
        {s && (
          <div className={styles.currentQ}>
            <div className={styles.botBubble}>
              <div className={styles.avatar}>AC</div>
              <div className={styles.bubble}>
                {s.type === "review" ? (
                  <div>
                    <p style={{ marginBottom: 16 }}>Here&apos;s a summary of your campaign. Look good?</p>
                    <div className={styles.reviewGrid}>
                      {Object.entries(data).map(([k, v]) => (
                        <div key={k} className={styles.reviewRow}>
                          <span className={styles.reviewKey}>{k}</span>
                          <span className={styles.reviewVal}>{Array.isArray(v) ? v.join(", ") : v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  interpolate(s.q, data)
                )}
              </div>
            </div>

            {/* Input area */}
            <div className={styles.inputArea}>
              {s.type === "text" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (current.trim()) advance(current.trim());
                  }}
                  className={styles.inputRow}
                >
                  <input
                    autoFocus
                    value={current}
                    onChange={(e) => setCurrent(e.target.value)}
                    placeholder={s.placeholder}
                    className={styles.textInput}
                  />
                  <button type="submit" className={styles.sendBtn}>Send</button>
                </form>
              )}

              {s.type === "textarea" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (current.trim()) advance(current.trim());
                  }}
                  className={styles.inputRow}
                  style={{ flexDirection: "column" }}
                >
                  <textarea
                    autoFocus
                    value={current}
                    onChange={(e) => setCurrent(e.target.value)}
                    placeholder={s.placeholder}
                    className={styles.textArea}
                    rows={3}
                  />
                  <button type="submit" className={styles.sendBtn} style={{ alignSelf: "flex-end" }}>Send</button>
                </form>
              )}

              {s.type === "options" && (
                <div className={styles.optionsGrid}>
                  {s.options.map((o) => (
                    <button key={o} className={styles.optionBtn} onClick={() => advance(o)}>
                      {o}
                    </button>
                  ))}
                </div>
              )}

              {s.type === "multi" && (
                <div>
                  <div className={styles.optionsGrid}>
                    {s.options.map((o) => (
                      <button
                        key={o}
                        className={`${styles.optionBtn} ${multiSel.includes(o) ? styles.optionSelected : ""}`}
                        onClick={() => setMultiSel((p) => p.includes(o) ? p.filter((x) => x !== o) : [...p, o])}
                      >
                        {multiSel.includes(o) ? "✓ " : ""}{o}
                      </button>
                    ))}
                  </div>
                  {multiSel.length > 0 && (
                    <button className={styles.sendBtn} style={{ marginTop: 12 }} onClick={() => advance(multiSel)}>
                      Continue
                    </button>
                  )}
                </div>
              )}

              {s.type === "review" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* Honeypot — invisible to humans, filled by bots */}
                  <input
                    name="_hp_field"
                    value={hpValue}
                    onChange={(e) => setHpValue(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
                  />
                  {submitError && (
                    <p style={{ color: "#EF4444", fontSize: 14, margin: 0 }}>{submitError}</p>
                  )}
                  {authMsg && !user && (
                    <p style={{ color: "#FF8C00", fontSize: 13, margin: 0, fontWeight: 500 }}>{authMsg}</p>
                  )}
                  <button className={styles.sendBtn} onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Campaign 🚀"}
                  </button>
                </div>
              )}
            </div>

            {step > 0 && (
              <button className={styles.backBtn} onClick={goBack}>
                ← Back
              </button>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Auth Modal overlay */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onAuth={handleAuthSuccess} />}

      {/* Inbox Panel overlay */}
      {showInbox && <InboxPanel onClose={() => setShowInbox(false)} />}
    </section>
  );
}
