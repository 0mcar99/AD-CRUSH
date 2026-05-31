'use client';

import { Phone, Mail, MapPin, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  const handleScrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        
        {/* Main Footer Directory */}
        <div className={styles.grid}>
          
          {/* Column 1: Brand & Origin */}
          <div className={styles.brandColumn}>
            <div className={styles.logo}>
              <div className={styles.logoText}>
                <span className={styles.logoHydro}>HYDRO</span>
                <span className={styles.logoPulse}>PULSE</span>
                <span className={styles.logoTM}>TM</span>
              </div>
              <span className={styles.logoTagline}>ELECTRONIC WATER CONDITIONER</span>
            </div>
            <p className={styles.desc}>
              Next-generation Electronic Water Conditioning system powered by patented Hydro-Polarization Technology. 100% chemical-free, salt-free, and maintenance-free limescale protection for homes, agriculture, and industries.
            </p>
            <div className={styles.madeInIndia}>
              <span>🇮🇳</span>
              <span>MADE IN INDIA WITH PRIDE</span>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 className={styles.title}>Company</h4>
            <ul className={styles.links}>
              <li><a href="#how-it-works" className={styles.linkItem} onClick={(e) => handleScrollToSection(e, 'how-it-works')}>How It Works</a></li>
              <li><a href="#benefits" className={styles.linkItem} onClick={(e) => handleScrollToSection(e, 'benefits')}>Core Benefits</a></li>
              <li><a href="#specs" className={styles.linkItem} onClick={(e) => handleScrollToSection(e, 'specs')}>Device Models</a></li>
              <li><a href="#testimonials" className={styles.linkItem} onClick={(e) => handleScrollToSection(e, 'testimonials')}>Client Reviews</a></li>
              <li><a href="#faq" className={styles.linkItem} onClick={(e) => handleScrollToSection(e, 'faq')}>Scientific FAQ</a></li>
            </ul>
          </div>

          {/* Column 3: Trust Certifications */}
          <div>
            <h4 className={styles.title}>Buyer Protection</h4>
            <ul className={styles.links} style={{ pointerEvents: 'none' }}>
              <li className={styles.contactDetail} style={{ gap: '8px' }}>
                <ShieldCheck size={16} className={styles.logoIcon} />
                <span style={{ fontSize: '13px' }}>2-Year Solid Warranty</span>
              </li>
              <li className={styles.contactDetail} style={{ gap: '8px' }}>
                <Truck size={16} className={styles.logoIcon} />
                <span style={{ fontSize: '13px' }}>Free PAN-India Shipping</span>
              </li>
              <li className={styles.contactDetail} style={{ gap: '8px' }}>
                <RefreshCw size={16} className={styles.logoIcon} />
                <span style={{ fontSize: '13px' }}>10-Day Return Window</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Operations */}
          <div>
            <h4 className={styles.title}>Office Headquarters</h4>
            <div className={styles.contactInfo}>
              <div className={styles.contactDetail}>
                <MapPin size={18} className={styles.contactIcon} />
                <span>
                  Mizusun Private Limited,<br />
                  Pune-Nashik Highway,<br />
                  Pune, Maharashtra 411026, India
                </span>
              </div>
              <a href="tel:9518757617" className={styles.contactDetail}>
                <Phone size={18} className={styles.contactIcon} />
                <span>+91 95187 57617</span>
              </a>
              <a href="mailto:adcrush5@gmail.com" className={styles.contactDetail}>
                <Mail size={18} className={styles.contactIcon} />
                <span>adcrush5@gmail.com</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Socials bar */}
        <div className={styles.bottomBar}>
          <div className={styles.copyright}>
            © {new Date().getFullYear()} Mizusun Private Limited. All rights reserved. All trademarks belong to HydroPulse™ and Mizusun.
          </div>
          
          <div className={styles.socials}>
            <a className={styles.socialIcon} href="https://www.facebook.com/share/14byt7idpg1/" target="_blank" rel="noreferrer" title="Facebook">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
              </svg>
            </a>
            <a className={styles.socialIcon} href="https://x.com/adcrush_5" target="_blank" rel="noreferrer" title="X (formerly Twitter)">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a className={styles.socialIcon} href="https://www.instagram.com/ad.crush_?igsh=M2hpM2xqN3V4MHh4" target="_blank" rel="noreferrer" title="Instagram">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a className={styles.socialIcon} href="https://wa.me/919518757617" target="_blank" rel="noreferrer" title="WhatsApp">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.454L0 24zm6.59-4.846c1.6.95 3.197 1.45 4.817 1.452 5.53 0 10.028-4.494 10.03-10.026.002-2.68-1.034-5.197-2.92-7.085C16.69 1.609 14.183.57 11.517.57 5.986.57 1.488 5.064 1.486 10.598c-.001 1.77.464 3.497 1.35 5.026l-.993 3.626 3.71-.973c1.5 1.026 3.03 1.54 4.504 1.54zM17.91 14.93c-.324-.162-1.916-.946-2.21-1.054-.294-.108-.507-.162-.72.162-.213.324-.826 1.054-1.013 1.27-.187.216-.374.243-.698.08-.324-.162-1.37-.505-2.61-1.61-.963-.86-1.614-1.92-1.802-2.246-.188-.324-.02-.5-.18-.66-.147-.146-.325-.38-.487-.57-.162-.19-.216-.324-.324-.54-.108-.216-.054-.405-.027-.567.027-.162.213-.513.32-.675.108-.162.144-.27.216-.405.072-.135.036-.254-.018-.363-.054-.11-.507-1.222-.693-1.67-.182-.437-.363-.377-.507-.384-.13-.007-.28-.008-.43-.008-.15 0-.395.056-.603.284-.208.228-.795.777-.795 1.895 0 1.118.812 2.198.925 2.35.114.15 1.597 2.438 3.868 3.417.54.233.962.373 1.29.477.543.172 1.037.147 1.427.09.435-.064 1.916-.784 2.184-1.54.268-.757.268-1.405.187-1.54-.08-.135-.295-.216-.62-.378z" />
              </svg>
            </a>
            <a className={styles.socialIcon} href="tel:9518757617" title="Phone Contact">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
            </a>
            <a className={styles.socialIcon} href="mailto:adcrush5@gmail.com" title="Email Us">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </a>
            <a className={styles.socialIcon} href="https://www.youtube.com/@ADCRUSH-l5u" target="_blank" rel="noreferrer" title="YouTube">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.163c-.268-.997-1.058-1.783-2.054-2.047C19.57 3.612 12 3.612 12 3.612s-7.57 0-9.444.504C1.556 4.38.766 5.166.5 6.163.004 8.04.004 12 .004 12s0 3.96.496 5.837c.266 1.002 1.056 1.784 2.052 2.052 1.874.504 9.444.504 9.444.504s7.57 0 9.444-.504c1.002-.268 1.792-1.05 2.058-2.052.496-1.877.496-5.837.496-5.837s0-3.96-.496-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
