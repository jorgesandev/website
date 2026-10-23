import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./components/Navbar";
import { themeInitializationScript } from "./lib/theme";
// Bundle fonts to avoid Google Fonts URL parsing failures during builds.
const sans = localFont({
  src: "./fonts/ibm-plex-sans-latin-variable.woff2",
  variable: "--font-plex-sans",
  weight: "400 600",
  style: "normal",
  display: "swap",
});
const mono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-latin-400.woff2", weight: "400" },
    { path: "./fonts/ibm-plex-mono-latin-500.woff2", weight: "500" },
  ],
  variable: "--font-plex-mono",
  style: "normal",
  display: "swap",
});
export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#18221b" },
  ],
};
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitializationScript }}
        />
      </head>
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
