import { aboutMetadata, aboutBreadcrumbSchema, aboutHowToSchema } from "@/lib/seo";

export const metadata = aboutMetadata;

export default function AboutLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutBreadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutHowToSchema) }}
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
        Ad Crush is a global digital advertising platform founded to help brands of every size publish, promote, and grow through high-impact advertising. With a presence in 150+ countries and 10 million+ ads published, Ad Crush offers a complete six-step campaign service — from discovery and strategy through creative production, AI-powered optimization, multi-platform launch, and real-time analytics.
      </div>
      {children}
    </>
  );
}
