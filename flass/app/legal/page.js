import Link from "next/link";

export const metadata = {
  title: "Legal Information | Ad Crush",
  description: "Privacy Policy, Terms of Service, Cookie Policy, and Security Policy for Ad Crush.",
};

export default function LegalPage() {
  return (
    <main className="container" style={{ paddingTop: "120px", paddingBottom: "120px", maxWidth: "800px", margin: "0 auto", paddingLeft: "24px", paddingRight: "24px" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text-dim)", textDecoration: "none", marginBottom: "32px", fontSize: "14px" }}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Home
      </Link>

      <h1 style={{ fontSize: "3rem", fontWeight: 800, marginBottom: "8px" }}>Legal Information</h1>
      <p style={{ color: "var(--text-dim)", marginBottom: "48px" }}>Effective Date: May 20, 2026</p>

      <section id="privacy" style={{ marginBottom: "48px" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "16px", color: "var(--accent-orange)" }}>1. Privacy Policy</h2>
        <p style={{ marginBottom: "16px", lineHeight: 1.6 }}>
          Ad Crush ("we," "our," or "us") is committed to protecting your privacy. We collect basic account information (name, email), authentication data, and ad submission data to provide and improve our services.
        </p>
        <p style={{ marginBottom: "16px", lineHeight: 1.6 }}>
          We do not sell your personal data to third parties. We only share data with essential service providers (hosting, analytics, email) necessary to run our platform.
        </p>
        <p style={{ marginBottom: "16px", lineHeight: 1.6 }}>
          You have the right to access, rectify, or erase your data at any time. For privacy-related questions or to exercise your rights, contact us at <strong>privacy@adcrush.com</strong>.
        </p>
      </section>

      <section id="terms" style={{ marginBottom: "48px" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "16px", color: "var(--accent-orange)" }}>2. Terms of Service</h2>
        <p style={{ marginBottom: "16px", lineHeight: 1.6 }}>
          By accessing or using Ad Crush, you agree to be bound by these Terms. Our platform provides creative advertising campaign management and ad submission services.
        </p>
        <p style={{ marginBottom: "16px", lineHeight: 1.6 }}>
          You agree not to submit ads that violate intellectual property rights, upload malicious content, or engage in deceptive practices. You retain ownership of your content, but grant us a license to host and display it.
        </p>
        <p style={{ marginBottom: "16px", lineHeight: 1.6 }}>
          We provide the service "as is" and reserve the right to suspend or terminate accounts for violations of these terms. For legal inquiries, contact <strong>legal@adcrush.com</strong>.
        </p>
      </section>

      <section id="cookies" style={{ marginBottom: "48px" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "16px", color: "var(--accent-orange)" }}>3. Cookie Policy & Consent</h2>
        <p style={{ marginBottom: "16px", lineHeight: 1.6 }}>
          We use cookies to enhance your experience, ensure security, and analyze how our site is used. Essential cookies are strictly necessary for the website to function (like maintaining your session).
        </p>
        <p style={{ marginBottom: "16px", lineHeight: 1.6 }}>
          We also use optional analytics cookies to understand site traffic. By continuing to use Ad Crush, you consent to our use of these necessary and analytical cookies. You can manage or clear these cookies at any time through your browser settings.
        </p>
      </section>

      <section id="security" style={{ marginBottom: "48px" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "16px", color: "var(--accent-orange)" }}>4. Security Policy</h2>
        <p style={{ marginBottom: "16px", lineHeight: 1.6 }}>
          Security is foundational to our platform. We use industry-standard encryption (AES-256 at rest, TLS 1.3 in transit) to protect your data. 
        </p>
        <p style={{ marginBottom: "16px", lineHeight: 1.6 }}>
          Our infrastructure includes automated backups, rate limiting, and strict input validation. If you discover a security vulnerability, please report it to us immediately at <strong>security@adcrush.com</strong>.
        </p>
      </section>

      <div style={{ paddingTop: "32px", borderTop: "1px solid var(--border)", color: "var(--text-dim)", fontSize: "14px", textAlign: "center" }}>
        <p>Questions about our legal policies? Reach out at <a href="mailto:legal@adcrush.com" style={{ color: "var(--accent-orange)", textDecoration: "none" }}>legal@adcrush.com</a></p>
      </div>
    </main>
  );
}
