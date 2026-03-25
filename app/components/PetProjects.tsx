"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaGithub, FaGlobe } from "react-icons/fa6";

export default function PetProjects() {
  const targetRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Moving 4 items means we shift by -75% of the total track width
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

  const projects = [
    {
      id: "PRJ_01",
      name: "LiquiFi",
      description: "1st Place at Ethereum México Hackathon (November, 2025). A decentralized factoring platform designed to maximize capital efficiency.",
      tech: ["Web3", "Ethereum", "Smart Contracts"],
      status: "1ST PLACE",
      github: "https://github.com/jorgesandev/liquifi",
      web: "https://liquifidev.vercel.app/"
    },
    {
      id: "PRJ_02",
      name: "FRCT",
      description: "Built for the MBC Hackathon. An onchain CFO that routes USDC between Base and Solana using Polymarket forecasts and Circle's CCTP.",
      tech: ["Next.js", "Solidity", "Rust", "Circle CCTP"],
      status: "HACKATHON",
      github: "https://github.com/jorgesandev/frct",
      web: "https://frct.jorgesandoval.dev/"
    },
    {
      id: "PRJ_03",
      name: "AxoCred",
      description: "2nd Place at Crevolution Hackathon (October, 2025). An advanced credit analysis AI tool that evaluates financial identity metrics.",
      tech: ["AI", "Python", "Data Evaluation"],
      status: "2ND PLACE",
      github: "https://github.com/jorgesandev/axocred-demo",
      web: "https://axocred-demo.vercel.app/"
    },
    {
      id: "PRJ_04",
      name: "LegisConnect",
      description: "3rd Place at Hackathon “Elegis Tech³” (March, 2025). A civic engagement application built with Next.js focusing on public legislative awareness.",
      tech: ["Next.js", "TypeScript", "Civic-Tech"],
      status: "3RD PLACE",
      github: "https://github.com/jorgesandev/LegisConnect",
      web: "https://legis-connect.vercel.app/"
    }
  ];

  return (
    <section id="projects" ref={targetRef} className="h-[250vh] relative bg-surface">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden border-b ghost-border dot-grid py-20">
        
        <div className="max-w-6xl mx-auto px-6 w-full mb-12 flex-shrink-0 pt-16 md:pt-0">
          <div className="label-text text-primary mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
            Section 03 // Pet Projects
          </div>
          <h2 className="text-4xl font-sans font-bold text-on-surface">
            Engineered Solutions.
          </h2>
        </div>

        <motion.div style={{ x }} className="flex gap-8 px-6 md:px-[calc((100vw-72rem)/2+1.5rem)] w-max">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className="w-[85vw] md:w-[45vw] lg:w-[40vw] max-w-2xl bg-surface-container-lowest p-8 rounded-sm ghost-border shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex-shrink-0 flex flex-col justify-between h-[450px] md:h-[400px]"
            >
              <div>
                <div className="flex justify-between items-center mb-8 border-b ghost-border pb-4">
                  <span className="label-text text-outline text-xs">{project.id}</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${project.status === 'ACTIVE' ? 'bg-primary' : 'bg-outline'}`}></span>
                    <span className="label-text text-[10px]">{project.status}</span>
                  </div>
                </div>
                
                <h3 className="text-3xl font-sans font-bold text-on-surface mb-4">
                  {project.name}
                </h3>
                
                <p className="text-on-surface-variant font-sans text-base leading-relaxed mb-8">
                  {project.description}
                </p>
              </div>
              
              <div className="flex flex-col gap-6 mt-auto">
                <div className="flex flex-wrap gap-2">
                  {project.tech.map(t => (
                    <span key={t} className="label-text text-[10px] text-on-surface-variant bg-surface-container-low px-2 py-1 ghost-border">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex gap-6 items-center border-t ghost-border pt-4">
                  {project.github && (
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 label-text text-primary text-xs hover:text-on-surface transition-colors cursor-pointer">
                      <FaGithub size={16} /> REPO
                    </a>
                  )}
                  {project.web && (
                    <a href={project.web} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 label-text text-primary text-xs hover:text-on-surface transition-colors cursor-pointer">
                      <FaGlobe size={16} /> LAUNCH
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
        
      </div>
    </section>
  );
}
