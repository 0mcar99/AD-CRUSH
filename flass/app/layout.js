import { Inter, Outfit, Playfair_Display, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const viewport = {
  themeColor: "#0A0A0A",
};

export const metadata = {
  title: "Ad Crush — Where Every Ad Makes an Impact",
  description: "The global platform for publishing advertisements that captivate, convert, and crush the competition.",
  openGraph: {
    title: "Ad Crush — Where Every Ad Makes an Impact",
    description: "Publish. Promote. Crush the competition.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${playfair.variable} ${spaceGrotesk.variable} ${jetbrains.variable}`}
    >
      <body suppressHydrationWarning>
        <Navbar />
        <main style={{ minHeight: "100vh" }}>{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
