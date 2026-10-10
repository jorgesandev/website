import type { Metadata, Viewport } from "next";
import PingPongClient from "./PingPongClient";
export const metadata: Metadata = {
  title: "PingPong — Jueguen. El marcador va aquí.",
  description:
    "Marcador de ping pong con cámara, seguimiento local de pelota, puntos, sets y servicio. Abre el enlace y empieza a jugar.",
  alternates: { canonical: "https://jorgesandoval.dev/pingpong" },
  manifest: "/pingpong/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "PingPong",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "PingPong",
    description: "Jueguen. El marcador va aquí.",
    url: "https://jorgesandoval.dev/pingpong",
    locale: "es_MX",
  },
};
export const viewport: Viewport = {
  themeColor: "#101820",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
export default function PingPongPage() {
  return <PingPongClient />;
}
