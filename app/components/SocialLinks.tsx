import { socialLinks } from "../lib/socials";

type SocialLinksProps = {
  className?: string;
  links?: readonly { label: string; href: string }[];
};

export default function SocialLinks({
  className,
  links = socialLinks,
}: SocialLinksProps) {
  return (
    <nav className={className} aria-label="Jorge Sandoval on social platforms">
      {links.map((social) => (
        <a
          key={social.label}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {social.label}
        </a>
      ))}
    </nav>
  );
}
