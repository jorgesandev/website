"use client";

import { FaGlobe } from "react-icons/fa6";
import Image from "next/image";

export default function LandingPages() {
  const pages = [
    {
      id: "LP_01",
      name: "Solorio Dental",
      description: "A professional and welcoming landing page for a dental clinic, focused on patient acquisition and clear service presentation.",
      tech: ["Frontend", "Tailwind CSS", "Responsive Design"],
      status: "LIVE",
      web: "https://www.solorio.dental/",
      image: "/landing-pages/dental-solorio.png"
    },
    {
      id: "LP_02",
      name: "Nutrition by Miroslava",
      description: "A clean, health-focused website for a professional nutritionist to showcase services, book consultations, and build client trust.",
      tech: ["Web Design", "Frontend", "UI/UX"],
      status: "LIVE",
      web: "https://www.nutritionbymiroslava.com/",
      image: "/landing-pages/nutrition-by-miroslava.png"
    },
    {
      id: "LP_03",
      name: "SI Molding",
      description: "A corporate landing page for a manufacturing and molding company, highlighting industrial capabilities and B2B contact flows.",
      tech: ["Next.js", "Tailwind CSS", "Corporate"],
      status: "LIVE",
      web: "https://www.simolding.com/",
      image: "/landing-pages/simolding.png"
    },
    {
      id: "LP_04",
      name: "Vertigo The Band",
      description: "An energetic and dynamic website for a music band, designed to showcase media, gigs, and connect with their audience.",
      tech: ["Next.js", "Tailwind CSS", "Animations"],
      status: "LIVE",
      web: "https://vertigotheband.com/",
      image: "/landing-pages/vertigo-band.png"
    }
  ];

  return (
    <section id="landing-pages" className="py-24 relative bg-surface border-b ghost-border dot-grid">
      <div className="max-w-6xl mx-auto px-6 w-full">
        
        <div className="mb-12">
          <div className="label-text text-primary mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
            Section 04 // Landing Pages
          </div>
          <h2 className="text-4xl font-sans font-bold text-on-surface">
            Client Work & Freelance.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pages.map((page) => (
            <div 
              key={page.id} 
              className="w-full bg-surface-container-lowest flex flex-col overflow-hidden rounded-sm ghost-border shadow-[0_2px_10px_rgba(0,0,0,0.03)] h-full min-h-[500px]"
            >
              <div className="relative w-full h-48 md:h-56 shrink-0 border-b ghost-border group">
                <Image
                  src={page.image}
                  alt={`${page.name} preview`}
                  fill
                  className="object-cover object-top opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>

              <div className="p-6 md:p-8 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6 border-b ghost-border pb-4">
                    <span className="label-text text-outline text-xs">{page.id}</span>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      <span className="label-text text-[10px]">{page.status}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-sans font-bold text-on-surface mb-3">
                    {page.name}
                  </h3>
                  
                  <p className="text-on-surface-variant font-sans text-sm leading-relaxed mb-6">
                    {page.description}
                  </p>
                </div>
                
                <div className="flex flex-col gap-5 mt-auto">
                  <div className="flex flex-wrap gap-2">
                    {page.tech.map(t => (
                      <span key={t} className="label-text text-[10px] text-on-surface-variant bg-surface-container-low px-2 py-1 ghost-border">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-6 items-center border-t ghost-border pt-4">
                    {page.web && (
                      <a href={page.web} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 label-text text-primary text-xs hover:text-on-surface transition-colors cursor-pointer">
                        <FaGlobe size={16} /> VISIT SITE
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
