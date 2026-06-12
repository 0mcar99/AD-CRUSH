// lib/seo.js — Centralized SEO, AEO, GEO, and AIO configuration for Ad Crush

// 1. Next.js / React Metadata definitions (Section 5.1 & Section 1.2)

export const layoutMetadata = {
  metadataBase: new URL('https://www.getadcrush.com'),
  title: {
    default: 'Ad Crush — Publish Ads That Convert & Crush the Competition',
    template: '%s | Ad Crush',
  },
  description:
    'Ad Crush is the global ad publishing platform that helps brands publish, promote, and dominate every screen. 10M+ ads published. 150+ countries. Start your campaign today.',
  keywords: [
    'ad publishing platform', 'digital advertising', 'publish ads online',
    'social media advertising', 'ad campaign platform', 'automotive ads',
    'fashion advertising', 'global ad reach', 'ad crush', 'adcrush'
  ],
  authors: [{ name: 'Ad Crush', url: 'https://www.getadcrush.com' }],
  creator: 'Ad Crush',
  publisher: 'Ad Crush',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.getadcrush.com',
    siteName: 'Ad Crush',
    title: 'Ad Crush — Where Every Ad Makes an Impact',
    description: 'The world\'s premier platform for publishing advertisements that captivate, convert, and crush the competition.',
    images: [{ url: 'https://www.getadcrush.com/og-image.jpg', width: 1200, height: 630, alt: 'Ad Crush' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@adcrush_5',
    title: 'Ad Crush — Where Every Ad Makes an Impact',
    description: 'Publish. Promote. Crush the competition. Start your campaign today.',
    images: ['https://www.getadcrush.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://www.getadcrush.com/',
  },
};

export const homeMetadata = {
  title: 'Ad Crush — Publish Ads That Convert & Crush the Competition',
  description: 'Ad Crush is the global ad publishing platform that helps brands publish, promote, and dominate every screen. 10M+ ads published. 150+ countries. Start your campaign today.',
  alternates: {
    canonical: 'https://www.getadcrush.com/',
  },
};

export const aboutMetadata = {
  title: 'About Ad Crush | Our Story & Mission',
  description: 'Discover how Ad Crush turns brand visions into viral campaigns — from discovery to analytics in 6 strategic steps.',
  alternates: {
    canonical: 'https://www.getadcrush.com/about',
  },
};

export const productsMetadata = {
  title: 'Published Ad Campaigns | Ad Crush Portfolio',
  description: 'Explore Ad Crush campaigns across automotive, fashion, tech, food & beverage, events, and lifestyle categories.',
  alternates: {
    canonical: 'https://www.getadcrush.com/products',
  },
};

export const addYoursMetadata = {
  title: 'Launch Your Ad Campaign | Ad Crush',
  description: 'List your product, event, or brand with Ad Crush. Our team handles creative, targeting, launch, and analytics.',
  alternates: {
    canonical: 'https://www.getadcrush.com/add-yours',
  },
};

// 2. Structured Schema Markup (JSON-LD)

// Section 2.1 — Organization Schema
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://www.getadcrush.com/#organization",
  "name": "Ad Crush",
  "alternateName": "ADCRUSH",
  "url": "https://www.getadcrush.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://www.getadcrush.com/logo.png",
    "width": 512,
    "height": 512
  },
  "description": "Ad Crush is the global ad publishing platform that helps brands publish, promote, and crush the competition with captivating advertisements that convert across every screen.",
  "foundingDate": "2024",
  "slogan": "Where every ad makes an impact.",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-9518757617",
    "email": "adcrush5@gmail.com",
    "contactType": "customer service",
    "availableLanguage": ["English", "Hindi"]
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "IN"
  },
  "sameAs": [
    "https://www.facebook.com/share/14byt7idpg1/",
    "https://x.com/adcrush_5",
    "https://www.instagram.com/ad.crush_",
    "https://www.youtube.com/@ADCRUSH-l5u"
  ],
  "numberOfEmployees": { "@type": "QuantitativeValue", "value": "10" },
  "areaServed": "Worldwide",
  "serviceType": "Digital Advertising",
  "knowsAbout": [
    "Digital Advertising", "Ad Publishing", "Social Media Marketing",
    "Automotive Advertising", "Fashion Advertising", "Tech App Marketing",
    "Food & Beverage Campaigns", "Event Promotion", "Lifestyle Marketing"
  ]
};

// Section 2.2 — WebSite Schema
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://www.getadcrush.com/#website",
  "url": "https://www.getadcrush.com",
  "name": "Ad Crush",
  "description": "The global ad publishing platform",
  "publisher": { "@id": "https://www.getadcrush.com/#organization" },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.getadcrush.com/products?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

// Section 2.3 — Service Schema
export const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Digital Advertising & Ad Publishing",
  "provider": { "@id": "https://www.getadcrush.com/#organization" },
  "name": "Ad Crush — Global Ad Publishing",
  "description": "Full-service ad publishing platform covering social media, automotive, fashion, food & beverage, tech/apps, events, and lifestyle brands.",
  "areaServed": { "@type": "Place", "name": "Worldwide" },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Ad Campaign Services",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Social Media Ad Campaigns" }},
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Automotive Ad Production" }},
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Fashion & Lifestyle Advertising" }},
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Tech & App Install Campaigns" }},
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Food & Beverage Ad Production" }},
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Event Promotion & Amplification" }},
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Industrial B2B Campaigns" }}
    ]
  }
};

// Section 2.4 — FAQ Schema
export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Ad Crush?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ad Crush is the global ad publishing platform that helps brands publish, promote, and crush the competition. With 10M+ ads published across 150+ countries, we deliver captivating advertisements that convert."
      }
    },
    {
      "@type": "Question",
      "name": "How does Ad Crush work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ad Crush follows a 6-step process: Discovery (understanding your goals), Strategy (tailored campaign plan), Creation (world-class design), Optimization (AI-powered targeting), Launch (multi-platform distribution), and Analytics (real-time performance tracking)."
      }
    },
    {
      "@type": "Question",
      "name": "Which platforms does Ad Crush publish on?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ad Crush publishes ads across 50+ platforms including Instagram, Facebook, TikTok, YouTube, X (Twitter), LinkedIn, Google Ads, Pinterest, Snapchat, and Spotify."
      }
    },
    {
      "@type": "Question",
      "name": "How do I publish an ad on Ad Crush?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Visit getadcrush.com/add-yours and submit your product, event, or brand details. Our team will contact you to begin the campaign process."
      }
    },
    {
      "@type": "Question",
      "name": "Is Ad Crush available worldwide?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Ad Crush operates in 150+ countries and has delivered 3.2 billion+ impressions globally. We serve clients in London, Tokyo, New York, Dubai, Berlin, Mumbai, Mexico City, Stockholm, and more."
      }
    }
  ]
};

// Section 4.1 — BreadcrumbList Schemas
export const aboutBreadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.getadcrush.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "About",
      "item": "https://www.getadcrush.com/about"
    }
  ]
};

export const addYoursBreadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.getadcrush.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Add Yours",
      "item": "https://www.getadcrush.com/add-yours"
    }
  ]
};

export const productsBreadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.getadcrush.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Products",
      "item": "https://www.getadcrush.com/products"
    }
  ]
};

// Section 4.2 — ItemList Schema for Products
export const productsItemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Ad Crush Published Campaigns",
  "description": "Portfolio of advertising campaigns published by Ad Crush",
  "url": "https://www.getadcrush.com/products",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Social Media Campaigns" },
    { "@type": "ListItem", "position": 2, "name": "Automotive Ad Campaigns" },
    { "@type": "ListItem", "position": 3, "name": "Fashion & Style Campaigns" },
    { "@type": "ListItem", "position": 4, "name": "Industrial B2B Campaigns" },
    { "@type": "ListItem", "position": 5, "name": "Food & Beverage Campaigns" },
    { "@type": "ListItem", "position": 6, "name": "Tech & App Campaigns" },
    { "@type": "ListItem", "position": 7, "name": "Event Promotion Campaigns" },
    { "@type": "ListItem", "position": 8, "name": "Lifestyle Campaigns" }
  ]
};

// Section 4.3 — HowTo Schema for About
export const aboutHowToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How Ad Crush Publishes Your Ad Campaign",
  "description": "Ad Crush follows a proven 6-step process from brief to broadcast.",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Discovery",
      "text": "We understand your product, audience, and goals."
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Strategy",
      "text": "Our experts craft a tailored campaign strategy."
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Creation",
      "text": "World-class designers and animators bring your vision to life."
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "Optimization",
      "text": "AI-powered targeting reaches the right people at the right time."
    },
    {
      "@type": "HowToStep",
      "position": 5,
      "name": "Launch",
      "text": "Your ad goes live across 50+ platforms simultaneously."
    },
    {
      "@type": "HowToStep",
      "position": 6,
      "name": "Analytics",
      "text": "Real-time tracking and continuous improvement of campaign performance."
    }
  ]
};
