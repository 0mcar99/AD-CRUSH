'use client';

import { useState } from 'react';
import styles from './VideoEmbed.module.css';

export default function VideoEmbed({ videoId, title = 'HydroPulse Video Demonstration' }) {
  const [loaded, setLoaded] = useState(false);

  // standard youtube embed path
  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=0`;

  return (
    <div className={styles.videoContainer}>
      <div className={styles.videoWrapper}>
        <iframe
          className={`${styles.iframe} ${loaded ? styles.iframeLoaded : ''}`}
          src={embedUrl}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          onLoad={() => setLoaded(true)}
        ></iframe>
        
        {!loaded && (
          <div className={styles.placeholder}>
            <div className={styles.spinner}></div>
            <span className={styles.loadingText}>Loading Video Stream...</span>
          </div>
        )}
      </div>
    </div>
  );
}
