import { addYoursMetadata, addYoursBreadcrumbSchema } from "@/lib/seo";

export const metadata = addYoursMetadata;

export default function AddYoursLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(addYoursBreadcrumbSchema) }}
      />
      {children}
    </>
  );
}
