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
      {children}
    </>
  );
}
