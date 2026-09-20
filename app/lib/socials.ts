export const professionalSocialLinks = [
  { label: "GitHub", href: "https://github.com/jorgesandev" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/jorgesandev/" },
] as const;

export const secondarySocialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/jorgesandev/" },
  { label: "TikTok", href: "https://www.tiktok.com/@jorgesandev" },
  { label: "YouTube", href: "https://www.youtube.com/@jorgesandev" },
  { label: "Threads", href: "https://www.threads.com/@jorgesandev" },
  { label: "X", href: "https://x.com/jorgesandev" },
] as const;

export const socialLinks = [
  ...professionalSocialLinks,
  ...secondarySocialLinks,
];
