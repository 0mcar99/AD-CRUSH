'use client';

import { Check, ShoppingCart, ArrowRight } from 'lucide-react';
import styles from './PricingCard.module.css';

export default function PricingCard({ 
  id, 
  title, 
  subtitle, 
  mrp, 
  price, 
  features, 
  isPopular = false,
  onSelectProduct 
}) {
  const saveAmount = mrp - price;
  
  // Format rupee currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className={`${styles.card} ${isPopular ? styles.popularCard : ''}`}>
      {isPopular && <div className={styles.popularBadge}>Most Popular</div>}
      
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.subtitle}>{subtitle}</p>
      
      <div className={styles.priceBlock}>
        <span className={styles.mrp}>{formatCurrency(mrp)}</span>
        <span className={styles.price}>{formatCurrency(price)}</span>
      </div>
      
      <div className={styles.saveBadge}>
        Save {formatCurrency(saveAmount)} (Limited Offer)
      </div>
      
      <div className={styles.divider}></div>
      
      <ul className={styles.features}>
        {features.map((feat, idx) => (
          <li key={idx} className={styles.featureItem}>
            <Check className={styles.checkIcon} />
            <span>{feat}</span>
          </li>
        ))}
      </ul>
      
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button 
          className={isPopular ? styles.btnBuy : styles.btnBuySecondary}
          onClick={() => onSelectProduct({ id, title, price, isPopular })}
        >
          <ShoppingCart size={18} />
          <span>Add to Cart</span>
        </button>
        
        <button 
          className={styles.btnBuySecondary}
          style={{ border: 'none', background: 'transparent', padding: '8px' }}
          onClick={() => onSelectProduct({ id, title, price, isPopular, express: true })}
        >
          <span>Express Checkout</span>
          <ArrowRight size={14} style={{ marginLeft: '4px' }} />
        </button>
      </div>
    </div>
  );
}
