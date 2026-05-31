'use client';

import { useState } from 'react';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import styles from './PricingCard.module.css';

export default function PricingCard({ 
  id, 
  title, 
  subtitle, 
  mrp, 
  price, 
  imageSrc,
  sizeTag,
  isPopular = false,
  onSelectProduct 
}) {
  const [quantity, setQuantity] = useState(1);
  
  // Format rupee currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleIncrement = () => {
    if (quantity < 10) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className={`${styles.card} ${isPopular ? styles.popularCard : ''}`}>
      {isPopular && <div className={styles.popularBadge}>Most Popular</div>}
      
      {/* Product Image Frame with inline styling matching the specific device background */}
      {imageSrc && (
        <div className={styles.imageFrame} style={{ background: id === 'marlin-1' ? '#ffffff' : '#051b2c' }}>
          <img 
            src={imageSrc} 
            alt={title} 
            className={styles.productImage} 
            draggable="false"
          />
        </div>
      )}
      
      <div className={styles.detailsBlock}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.subtitle}>{subtitle}</p>
        
        {/* Badges/Pills for Size & Availability */}
        <div className={styles.badgeRow}>
          {sizeTag && <span className={styles.sizeBadge}>Size: {sizeTag}</span>}
          <span className={styles.stockBadge}>In stock</span>
        </div>
        
        {/* Slashed pricing row */}
        <div className={styles.priceLabel}>PRICE</div>
        <div className={styles.priceBlock}>
          <span className={styles.price}>{formatCurrency(price)}</span>
          {mrp && <span className={styles.mrp}>{formatCurrency(mrp)}</span>}
        </div>

        {mrp && mrp > price && (
          <div className={styles.saveBadge}>
            Save {formatCurrency(mrp - price)} (Limited Offer)
          </div>
        )}
        
        {/* Action Row containing Quantity Selector & Add to Cart button */}
        <div className={styles.actionRow}>
          <div className={styles.qtyContainer}>
            <button 
              type="button" 
              className={styles.qtyBtn} 
              onClick={handleDecrement}
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className={styles.qtyVal}>{quantity}</span>
            <button 
              type="button" 
              className={styles.qtyBtn} 
              onClick={handleIncrement}
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
          
          <button 
            className={styles.btnBuy}
            onClick={() => onSelectProduct({ id, title, price, isPopular }, quantity)}
          >
            <ShoppingCart size={16} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
