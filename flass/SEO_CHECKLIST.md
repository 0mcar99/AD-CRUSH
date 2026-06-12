# Ad Crush — SEO, AEO, GEO, and SXO Integration Checklist

This document tracks the status of all optimization tasks implemented for search engines, answer engines (AI featured snippets), and generative engine optimizations (LLMs/crawlers).

| # | Task | File / Location | Impact | Status | Details |
|---|---|---|---|---|---|
| 1 | Add Title + Meta Tags | All page layouts (`app/layout.js`, `app/*/layout.js`) | 🔴 Critical | **Completed** | Managed via centralized `lib/seo.js` metadata configs. |
| 2 | Add Organization Schema | Root layout (`app/layout.js`) | 🔴 Critical | **Completed** | Injected JSON-LD organization metadata. |
| 3 | Create sitemap.xml | `public/sitemap.xml` | 🔴 Critical | **Completed** | Mapped URLs: Home, About, Products, Add Yours. |
| 4 | Create robots.txt | `public/robots.txt` | 🔴 Critical | **Completed** | Enabled full crawling, blocked `/api/` and `/admin/` folders. |
| 5 | Submit to Google Search Console | `search.google.com/search-console` | 🔴 Critical | **Pending Manual** | Verification record configured. Submit domain at Google Search Console. |
| 6 | Add FAQ Schema | `app/page.js` + `lib/seo.js` | 🟠 High | **Completed** | Injected JSON-LD FAQ schema. |
| 7 | Add HowTo Schema | `app/about/layout.js` + `lib/seo.js` | 🟠 High | **Completed** | Injected JSON-LD HowTo schema. |
| 8 | Add Service Schema | `app/products/layout.js` + `lib/seo.js` | 🟠 High | **Completed** | Injected JSON-LD Service catalog schema. |
| 9 | Create llms.txt | `public/llms.txt` | 🟡 Medium | **Completed** | Standardized LLM Discovery file for AI crawlers. |
| 10 | Add AI-Friendly Content Blocks | `app/page.js` + `app/about/layout.js` | 🟡 Medium | **Completed** | Injected hidden `sr-only` styled descriptions. |
| 11 | Optimize next.config.js | `next.config.mjs` | 🟡 Medium | **Completed** | Added Avif/WebP formats, device sizes, and compression. |
| 12 | Add security & speed headers | `next.config.mjs` | 🟡 Medium | **Completed** | Implemented Content Security Policy, XSS protection, and STS. |
| 13 | Add BreadcrumbList Schema | `app/*/layout.js` + `lib/seo.js` | 🟢 Low | **Completed** | Added inner page hierarchical schemas. |
| 14 | Fix Link Anchor Text | `components/Footer.js`, etc. | 🟢 Low | **Completed** | Checked internal links, optimized accessibility labels. |
| 15 | Verify in Rich Results Test | `search.google.com/test/rich-results` | 🟢 Verify | **Pending Manual** | Ready to copy page source HTML and test layout structures. |

---

## Technical Implementation Notes

To protect the website's design system and ensure visual code integrity:
1. **No Frontend Code Intrusion**: Visual pages (`about/page.js`, `products/page.js`, `add-yours/page.js`) were kept unmodified (except for adding the visual FAQ accordion section on the About page using clean inline container grids).
2. **Layout Level Injection**: All schema `<script type="application/ld+json">` elements and metadata headers are handled in parent layouts which compile at the server level.
3. **Optimized Assets**: Replaced default favicon, logo, and sharing preview assets (`app/favicon.ico`, `public/logo.png`, `public/favicon.png`, `public/apple-touch-icon.png`, `public/og-image.jpg`) to ensure cohesive brand identification across search listings.
