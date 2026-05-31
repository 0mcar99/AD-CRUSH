'use client';

import { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar({ cartCount = 0, onCartClick }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLinkClick = (e, id) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // height of header
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
    <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
      <div className={styles.container}>
        {/* LOGO */}
        <a href="#" className={styles.logo} onClick={(e) => handleLinkClick(e, 'hero')}>
          <div className={styles.logoText}>
            <span className={styles.logoHydro}>HYDRO</span>
            <span className={styles.logoPulse}>PULSE</span>
            <span className={styles.logoTM}>TM</span>
          </div>
          <span className={styles.logoTagline}>ELECTRONIC WATER CONDITIONER</span>
        </a>

        {/* DESKTOP NAV LINKS */}
        <nav className={styles.nav}>
          <a href="/products" className={`${styles.navLink} linkDraw`} style={{ color: '#FF6B00', fontWeight: 'bold' }}>← Back to Ad Crush</a>
          <a href="#how-it-works" className={`${styles.navLink} linkDraw`} onClick={(e) => handleLinkClick(e, 'how-it-works')}>How It Works</a>
          <a href="#benefits" className={`${styles.navLink} linkDraw`} onClick={(e) => handleLinkClick(e, 'benefits')}>Benefits</a>
          <a href="#specs" className={`${styles.navLink} linkDraw`} onClick={(e) => handleLinkClick(e, 'specs')}>Models</a>
          <a href="#testimonials" className={`${styles.navLink} linkDraw`} onClick={(e) => handleLinkClick(e, 'testimonials')}>Reviews</a>
          <a href="#faq" className={`${styles.navLink} linkDraw`} onClick={(e) => handleLinkClick(e, 'faq')}>FAQ</a>
          
          <button 
            className={styles.ctaBtn} 
            onClick={(e) => handleLinkClick(e, 'pricing')}
          >
            Check Pricing
          </button>

          {/* Cart Icon */}
          <div 
            style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onClick={onCartClick}
          >
            <ShoppingBag size={20} className={styles.navLink} style={{ cursor: 'pointer' }} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: 'var(--accent-orange)',
                color: 'white',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 'bold',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 5px rgba(255, 107, 0, 0.5)'
              }}>
                {cartCount}
              </span>
            )}
          </div>
        </nav>

        {/* MOBILE ACTIONS */}
        <div style={{ display: 'none', gap: '16px', alignItems: 'center' }} className={styles.menuBtn}>
          <div 
            style={{ position: 'relative', cursor: 'pointer', marginRight: '8px' }}
            onClick={onCartClick}
          >
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                background: 'var(--accent-orange)',
                color: 'white',
                fontSize: '9px',
                borderRadius: '50%',
                width: '14px',
                height: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {cartCount}
              </span>
            )}
          </div>
          <button onClick={toggleMobileMenu} style={{ background: 'none', border: 'none', color: 'white' }}>
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <a href="/products" className={styles.navLink} style={{ color: '#FF6B00', fontWeight: 'bold' }}>← Back to Ad Crush</a>
          <a href="#how-it-works" className={styles.navLink} onClick={(e) => handleLinkClick(e, 'how-it-works')}>How It Works</a>
          <a href="#benefits" className={styles.navLink} onClick={(e) => handleLinkClick(e, 'benefits')}>Benefits</a>
          <a href="#specs" className={styles.navLink} onClick={(e) => handleLinkClick(e, 'specs')}>Models</a>
          <a href="#testimonials" className={styles.navLink} onClick={(e) => handleLinkClick(e, 'testimonials')}>Reviews</a>
          <a href="#faq" className={styles.navLink} onClick={(e) => handleLinkClick(e, 'faq')}>FAQ</a>
          <button 
            className={styles.ctaBtn} 
            style={{ width: '100%', padding: '14px' }}
            onClick={(e) => handleLinkClick(e, 'pricing')}
          >
            Check Pricing
          </button>
        </div>
      )}
    </header>
  );
}
