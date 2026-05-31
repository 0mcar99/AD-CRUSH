"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./Footer.module.css";

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      showToast("error", "Please enter a valid email");
      return;
    }
    setSubmitting(true);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer", _hp_field: "" }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast("error", data.error || "Something went wrong.");
      } else {
        setEmail("");
        showToast("success", data.message || "You're on the list. Welcome to Ad Crush.");
      }
    } catch {
      showToast("error", "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (pathname && (pathname.includes("/products/hydropulse") || pathname.includes("/products/hydroplus"))) {
    return null;
  }

  return (
    <footer className={styles.footer}>
      <div className="container" style={{ padding: "80px 24px" }}>
        {/* Newsletter */}
        <div className={styles.newsletter}>
          <div>
            <p className={styles.nlLabel}>Newsletter</p>
            <h3 className={styles.nlTitle}>
              Stay <span className="text-crush">ahead</span> of every trend.
            </h3>
            <p className={styles.nlDesc}>
              Get the latest ad trends, platform updates, and exclusive offers
              delivered to your inbox.
            </p>
          </div>
          <form onSubmit={onSubmit} className={styles.nlForm}>
            <input
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.nlInput}
            />
            <button disabled={submitting} className={styles.nlBtn}>
              {submitting ? "Sending…" : "Subscribe"}
            </button>
          </form>
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20 }}>
              <svg viewBox="0 0 24 24" style={{ width: 24, height: 24, color: "var(--accent-orange)" }} aria-hidden="true">
                <path d="M12 3 L21 20 L12 16 L3 20 Z" fill="currentColor" />
              </svg>
              <span>AD</span>
              <span className="text-crush">CRUSH</span>
            </Link>
            <p className={styles.brandDesc}>
              The world&apos;s premier platform for publishing advertisements
              that captivate, convert, and create lasting impressions.
            </p>
          </div>
          <div>
            <p className={styles.colTitle}>Explore</p>
            <ul className={styles.colLinks}>
              <li><Link href="/about" className="link-draw">About</Link></li>
              <li><Link href="/products" className="link-draw">Products</Link></li>
              <li><Link href="/add-yours" className="link-draw">Add Yours</Link></li>
            </ul>
          </div>
          <div>
            <p className={styles.colTitle}>Legal</p>
            <ul className={styles.colLinks}>
              <li><Link href="/legal#privacy" className="link-draw">Privacy Policy</Link></li>
              <li><Link href="/legal#terms" className="link-draw">Terms & Conditions</Link></li>
              <li><Link href="/legal#cookies" className="link-draw">Cookie & Security Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className={styles.bottom}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p className={styles.bottomText}>
              © {new Date().getFullYear()} Ad Crush. Crushing ads worldwide.
            </p>
            {/* Social Icons Bar */}
            <div className={styles.socials}>
              {/* Facebook */}
              <a href="https://www.facebook.com/share/14byt7idpg1/" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </a>
              {/* X / Twitter */}
              <a href="https://x.com/adcrush_5" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="X (Twitter)">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="https://www.instagram.com/ad.crush_?igsh=M2hpM2xqN3V4MHh4" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              {/* WhatsApp */}
              <a href="https://wa.me/919518757617" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="WhatsApp">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.45 5.511 0 9.998-4.486 10-10 .003-2.673-1.03-5.186-2.91-7.067C16.488 1.656 13.98 .62 11.993.62c-5.518 0-10 4.486-10 10.002-.002 1.83.486 3.614 1.411 5.2l-.934 3.415 3.506-.92c1.558.91 3.11 1.36 4.62 1.36zm10.74-7.66c-.078-.13-.286-.21-.595-.364-.31-.154-1.826-.9-2.106-1.002-.28-.103-.485-.155-.688.154-.203.308-.785.99-.961 1.196-.177.205-.353.23-.662.077-.31-.155-1.306-.48-2.487-1.534-.918-.818-1.538-1.83-1.718-2.137-.18-.308-.02-.474.135-.628.14-.138.31-.36.465-.54.154-.177.206-.303.31-.508.102-.206.05-.385-.025-.54-.077-.154-.688-1.66-.943-2.274-.248-.6-.5-.518-.688-.528-.178-.01-.382-.01-.586-.01-.205 0-.537.078-.817.385-.28.307-1.072 1.05-1.072 2.56 0 1.512 1.1 2.977 1.253 3.183.153.205 2.164 3.304 5.242 4.633.733.317 1.306.507 1.752.65.736.233 1.406.2 1.937.12.59-.09 1.825-.747 2.08-1.47.256-.72.256-1.336.18-1.47z" />
                </svg>
              </a>
              {/* Phone */}
              <a href="tel:9518757617" className={styles.socialLink} aria-label="Phone contact">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02A11.36 11.36 0 018.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
                </svg>
              </a>
              {/* Email */}
              <a href="mailto:adcrush5@gmail.com" className={styles.socialLink} aria-label="Email">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </a>
              {/* YouTube */}
              <a href="https://www.youtube.com/@ADCRUSH-l5u" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="YouTube">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
          <p className={styles.bottomText}>Made for the bold.</p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : styles.toastError}`}>
          {toast.message}
        </div>
      )}
    </footer>
  );
}
