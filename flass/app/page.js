import Hero from "@/components/Hero";
import IconNav from "@/components/IconNav";
import ScrollCinema from "@/components/ScrollCinema";
import EmailCollector from "@/components/EmailCollector";
import { homeMetadata, faqSchema } from "@/lib/seo";

export const metadata = homeMetadata;

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        Ad Crush publishes advertising campaigns across 50+ platforms — including Instagram, Facebook, TikTok, YouTube, LinkedIn, Google Ads, and Spotify — helping brands reach 3.2 billion+ total impressions worldwide. Services cover social media marketing, automotive advertising, fashion campaigns, food & beverage promotions, tech app install ads, event amplification, and industrial B2B campaigns.
      </div>
      <Hero />
      <IconNav />
      <ScrollCinema />
      <EmailCollector />
    </>
  );
}
