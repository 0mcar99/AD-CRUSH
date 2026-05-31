"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./products.module.css";

gsap.registerPlugin(ScrollTrigger);

const CATEGORIES = ["All", "Automotive", "Fashion", "Tech", "Food", "Events", "Lifestyle", "Industrial"];
const CATEGORY_COLORS = {
  Automotive: "#FF6B00",
  Fashion: "#C084FC",
  Tech: "#06B6D4",
  Food: "#EF4444",
  Events: "#A855F7",
  Lifestyle: "#22C55E",
  Industrial: "#F59E0B",
};

const ADS = [
  { id: "hydropulse", title: "HydroPulse Campaign", brand: "HydroPulse", cat: "Industrial", img: "/images/hydropulse.jpg", views: "5.1M", tall: false, url: "/products/hydroplus" },
];

/* Reveal */
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  useGSAP(() => {
    gsap.from(ref.current, {
      opacity: 0, y: 40, duration: 0.6, delay,
      ease: "power3.out",
      scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
    });
  }, { scope: ref });
  return <div ref={ref}>{children}</div>;
}

export default function ProductsPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [dynamicAds, setDynamicAds] = useState([]);

  useEffect(() => {
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then((data) => {
        if (data.campaigns) {
          const mapped = data.campaigns.map((c, index) => {
            let cat = c.category || "Other";
            if (cat === "Food & Beverage") cat = "Food";

            const imgMap = {
              Automotive: "/images/scene-cars.png",
              Fashion: "/images/scene-fashion.png",
              Tech: "/images/scene-tech.png",
              Food: "/images/scene-food.png",
              Events: "/images/scene-events.png",
              Lifestyle: "/images/scene-nature.png",
              Industrial: "/images/scene-industrial.jpg",
            };
            const img = imgMap[cat] || "/images/scene-shatter.png";

            const budgetViews = {
              "Under $500": "120k",
              "$500 - $2,000": "450k",
              "$2,000 - $10,000": "1.8M",
              "$10,000 - $50,000": "5.4M",
              "$50,000+": "15.2M",
            };
            const views = budgetViews[c.budget] || "250k";

            return {
              id: c.id || `dynamic-${index}`,
              title: c.tagline || c.productName,
              brand: c.productName,
              cat,
              img,
              views,
              tall: index % 3 === 0,
            };
          });
          setDynamicAds(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    let list = [...dynamicAds, ...ADS];
    if (filter !== "All") list = list.filter((a) => a.cat === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(q) || a.brand.toLowerCase().includes(q));
    }
    if (sort === "popular") list = [...list].sort((a, b) => parseFloat(b.views) - parseFloat(a.views));
    return list;
  }, [dynamicAds, filter, search, sort]);

  return (
    <>
      {/* Header */}
      <section className={`${styles.section} bg-mesh noise`} style={{ paddingTop: 160 }}>
        <div className="container">
          <div className={styles.headerFlex}>
            <div>
              <p className="label" style={{ marginBottom: 24 }}>Products</p>
              <h1 className={styles.heroTitle}>
                Published <span className="text-crush">campaigns.</span>
              </h1>
              <p className={styles.heroSub}>Browse ads that are live and crushing it right now.</p>
            </div>
            <div className={styles.liveCounter}>
              <span className={styles.liveDot} />
              <span className={styles.liveLabel}>{dynamicAds.length + ADS.length} ads live</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured spotlight */}
      <section className={styles.section} style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <Reveal>
            <div className={styles.spotlight}>
              <div className={styles.spotlightImgWrap}>
                <img src="/images/scene-cars.png" alt="Featured ad" className={styles.spotlightImg} />
              </div>
              <div className={styles.spotlightContent}>
                <span className={styles.spotlightBadge}>Featured</span>
                <h2 className={styles.spotlightTitle}>Apex GT-1 Campaign</h2>
                <p className={styles.spotlightBrand}>Apex Motors</p>
                <p className={styles.spotlightBody}>
                  &ldquo;The Ad Crush team turned our product launch into a cinematic event. 4.2M views in the first week.&rdquo;
                </p>
                <div className={styles.spotlightStats}>
                  <div><strong className="text-crush">4.2M</strong> views</div>
                  <div><strong className="text-crush">184k</strong> engagement</div>
                  <div><strong className="text-crush">2.3%</strong> CTR</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Filters + Gallery */}
      <section className={styles.section} style={{ borderTop: "1px solid var(--border)" }}>
        <div className="container">
          {/* Sticky filter bar */}
          <div className={styles.filterBar}>
            <div className={styles.filterPills}>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  className={`${styles.pill} ${filter === c ? styles.pillActive : ""}`}
                  onClick={() => setFilter(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className={styles.filterRight}>
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
              <select value={sort} onChange={(e) => setSort(e.target.value)} className={styles.sortSelect}>
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Gallery */}
          <div className={styles.gallery}>
            {filtered.map((ad, i) => {
              const CardContent = (
                <div className={`${styles.adCard} ${ad.tall ? styles.adCardTall : ""} ${ad.url ? styles.clickableCard : ""}`}>
                  <div className={styles.adImgWrap}>
                    <img src={ad.img} alt={ad.title} className={styles.adImg} />
                    <div className={styles.adOverlay}>
                      <span className={styles.adCategory} style={{ borderColor: CATEGORY_COLORS[ad.cat] || "var(--border)", color: CATEGORY_COLORS[ad.cat] || "var(--text-secondary)" }}>
                        {ad.cat}
                      </span>
                    </div>
                  </div>
                  <div className={styles.adInfo}>
                    <p className={styles.adBrand}>{ad.brand}</p>
                    <h3 className={styles.adTitle}>{ad.title}</h3>
                    <p className={styles.adViews}>{ad.views} views</p>
                  </div>
                </div>
              );

              return (
                <Reveal key={ad.id} delay={i * 0.04}>
                  {ad.url ? (
                    <Link href={ad.url} style={{ display: "block" }}>
                      {CardContent}
                    </Link>
                  ) : (
                    CardContent
                  )}
                </Reveal>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <p style={{ textAlign: "center", color: "var(--text-muted)", padding: 80, fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              No campaigns found.
            </p>
          )}

          {/* Auto publish note */}
          <div className={styles.autoNote}>
            <p className="label">Note</p>
            <p style={{ marginTop: 8, color: "var(--text-secondary)", fontSize: 14 }}>
              All approved campaigns are analysed plan targeted designed & published and updated in real time.
              Want yours here? <a href="/add-yours" className="link-draw" style={{ color: "var(--accent-orange)" }}>Add Yours →</a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
