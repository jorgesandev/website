import Image from "next/image";

export default function Home() {
  const buttons = [
    { label: "Resume", href: "/Resume_Jorge_Alejandro_Sandoval_Romo.pdf" },
    { label: "Github", href: "https://github.com/jorgesandev" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/jorgesandev/" },
    { label: "Youtube", href: "https://www.youtube.com/@jorgesandev" },
  ];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <main className="flex flex-col items-center max-w-2xl w-full py-20">
        {/* Circular Photo */}
        <Image
          src="/jorgealejandro.png"
          alt="Jorge Alejandro Sandoval Romo"
          width={240}
          height={240}
          className="w-60 h-60 rounded-full object-cover shadow-sm mb-8"
          priority
        />

        {/* Name */}
        <h1 className="text-4xl font-light text-black text-center mb-2">
          Jorge Alejandro <br className="sm:hidden" />
          Sandoval Romo
        </h1>

        {/* Social Buttons */}
        <div className="flex gap-2 justify-center items-center mb-1">
          {buttons.map((button, index) => (
            <div key={button.label} className="flex items-center gap-2">
              <a
                href={button.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg text-gray-600 hover:text-black transition-colors whitespace-nowrap"
              >
                {button.label}
              </a>
              {index < buttons.length - 1 && <span className="text-gray-400">|</span>}
            </div>
          ))}
        </div>

        {/* Email */}
        <a
          href="mailto:contact@jorgesandoval.dev"
          className="text-lg text-gray-600 hover:text-black transition-colors mb-8"
        >
          contact@jorgesandoval.dev
        </a>

        {/* Bio Text */}
        <p className="text-justify text-gray-700 text-lg leading-relaxed max-w-xl font-light px-4">
          Software engineering student from Tijuana, Mexico. Focused on building clean, efficient web applications and exploring how AI can enhance real-world systems. Placed in national hackathons and developed an internal asset management system at Directive Consulting using Next.js and Firebase.
        </p>
      </main>
    </div>
  );
}
