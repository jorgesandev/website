import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://jorgesandoval.dev" },
    { url: "https://jorgesandoval.dev/privacy" },
  ];
}
