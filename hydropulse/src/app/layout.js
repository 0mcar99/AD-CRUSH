import { Inter, Outfit, Playfair_Display, Space_Grotesk, JetBrains_Mono, Montserrat } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });

export const metadata = {
  title: "HydroPulse™ | Electronic Water Conditioner | 100% Chemical & Salt Free",
  description: "Say goodbye to hard water scaling forever. India's #1 electronic water conditioner. 100% chemical-free, salt-free, maintenance-free limescale protection for homes, agriculture, and industries.",
  keywords: "electronic water conditioner, salt-free water softener, hard water solution, limescale prevention, Mizusun, HydroPulse, Marlin domestic",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${playfair.variable} ${spaceGrotesk.variable} ${jetbrains.variable} ${montserrat.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body>
        <div className="appContainer">
          {/* Ambient light mesh orbs */}
          <div className="bgOrbs">
            <div className="orb1"></div>
            <div className="orb2"></div>
            <div className="orb3"></div>
          </div>
          
          {/* Organic overlay noise filter */}
          <div className="noiseOverlay"></div>
          
          {/* Main page content */}
          {children}
        </div>
      </body>
    </html>
  );
}
