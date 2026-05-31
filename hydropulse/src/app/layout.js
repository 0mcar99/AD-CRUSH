import "./globals.css";

export const metadata = {
  title: "HydroPulse™ | Electronic Water Conditioner | 100% Chemical & Salt Free",
  description: "Say goodbye to hard water scaling forever. India's #1 electronic water conditioner. 100% chemical-free, salt-free, maintenance-free limescale protection for homes, agriculture, and industries.",
  keywords: "electronic water conditioner, salt-free water softener, hard water solution, limescale prevention, Mizusun, HydroPulse, Marlin domestic",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
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
