import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
const sans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
const mono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});
export const metadata: Metadata = {
  metadataBase: new URL("https://jorgesandoval.dev"),
  title: "Jorge Sandoval — Fullstack & Applied AI Engineer",
  description:
    "Software engineer in Tijuana building fullstack products and applied-AI systems. Selected work, experience, and opportunities to collaborate.",
  openGraph: {
    title: "Jorge Sandoval — Build the system. Understand the people.",
    description:
      "Fullstack engineering and applied AI. Explore my work and get in touch.",
    url: "https://jorgesandoval.dev",
    siteName: "Jorge Sandoval",
    type: "website",
    locale: "en_US",
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable}`}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
