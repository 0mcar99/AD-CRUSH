"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";
import AuthModal from "./AuthModal";
import InboxPanel from "./InboxPanel";
import AdminPanel from "./AdminPanel";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/products", label: "Products" },
  { href: "/add-yours", label: "Add Yours" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null); // { email, role, initial }
  const [showInbox, setShowInbox] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [authMsg, setAuthMsg] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Check auth status on mount
  useEffect(() => {
    fetch("/api/auth/check")
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated) setUser({ email: d.email, role: d.role, initial: d.initial });
      })
      .catch(() => {});
  }, []);

  const handleAuth = (userData) => {
    setUser({ email: userData.email, role: userData.role || "user", initial: userData.email?.charAt(0).toUpperCase() || "U" });
    if (authMsg) {
      setAuthMsg("");
      setShowInbox(true);
    }
  };

  const handleInboxClick = () => {
    if (user) {
      setShowInbox(true);
    } else {
      setAuthMsg("Please log in to access your Inbox.");
      setShowAuth(true);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setShowInbox(false);
      setShowAdminPanel(false);
    } catch {}
  };

  if (pathname && (pathname.includes("/products/hydropulse") || pathname.includes("/products/hydroplus"))) {
    return null;
  }

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
        <div className={styles.inner}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <svg viewBox="0 0 24 24" className={styles.logoIcon} aria-hidden="true">
              <path d="M12 2 L21 13 L12 9 L3 13 Z" fill="#FF7F00" />
              <circle cx="12" cy="7.5" r="1.8" fill="#0A0A0A" />
              <path d="M8.5 14.5 L15.5 14.5 L12 23 Z" fill="#A04000" />
            </svg>
            <span className={styles.logoAdd}>AD</span>
            <span className={styles.logoCrush}>CRUSH</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.nav}>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`${styles.navLink} ${pathname === l.href ? styles.active : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Login / Avatar + Mobile toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {user ? (
              /* Logged in — avatar with dropdown */
              <div className={styles.avatarWrap}>
                <button className={styles.avatarBtn} onClick={() => setOpen(false)}>
                  <span className={styles.avatarInitial}>{user.initial}</span>
                </button>
                <div className={styles.avatarMenu}>
                  <div className={styles.avatarEmail}>{user.email}</div>
                  <button className={styles.avatarMenuItem} onClick={handleLogout}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              /* Not logged in — login icon */
              <button className={styles.loginBtn} onClick={() => setShowAuth(true)} aria-label="Sign in">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </button>
            )}
            <button
              className={styles.menuBtn}
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile overlay */}
        {open && (
          <div className={styles.mobileOverlay}>
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={styles.mobileLink}>
                {l.label}
              </Link>
            ))}
            {user ? (
              <button onClick={handleLogout} className={styles.mobileCta}>Sign Out</button>
            ) : (
              <button onClick={() => { setOpen(false); setShowAuth(true); }} className={styles.mobileCta}>
                Sign In
              </button>
            )}
          </div>
        )}
      </header>

      {/* Auth Modal */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onAuth={handleAuth} />}

      {/* Global Floating Buttons */}
      <button 
        onClick={handleInboxClick}
        style={{
          position: "fixed",
          bottom: "32px",
          right: "32px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #FF6B00, #FF8C00)",
          color: "#fff",
          border: "none",
          boxShadow: "0 4px 20px rgba(255, 107, 0, 0.4)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999,
          transition: "transform 0.2s"
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
        title="Your Inbox"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
      </button>

      {user && user.role === "admin" && (
        <button 
          onClick={() => setShowAdminPanel(true)}
          style={{
            position: "fixed",
            bottom: "100px",
            right: "32px",
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #10B981, #059669)",
            color: "#fff",
            border: "none",
            boxShadow: "0 4px 20px rgba(16, 185, 129, 0.4)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            transition: "transform 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
          title="Admin Panel"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </button>
      )}

      {showInbox && <InboxPanel onClose={() => setShowInbox(false)} />}
      {showAdminPanel && <AdminPanel onClose={() => setShowAdminPanel(false)} />}

      {authMsg && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(255, 107, 0, 0.9)', color: '#fff', padding: '12px 24px',
          borderRadius: '8px', zIndex: 10001, fontWeight: 500, backdropFilter: 'blur(10px)'
        }}>
          {authMsg}
        </div>
      )}
    </>
  );
}
