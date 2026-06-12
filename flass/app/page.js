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
      <Hero />
      <IconNav />
      <ScrollCinema />
      <EmailCollector />
    </>
  );
}
