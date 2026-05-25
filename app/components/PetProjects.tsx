"use client";

import { FaGithub, FaGlobe } from "react-icons/fa6";

export default function PetProjects() {
  const projects = [
    {
      id: "PRJ_01",
      name: "LiquiFi",
      description: "1st Place at Ethereum México Hackathon (November 2025). Decentralized invoice factoring on Ethereum. SMEs sell unpaid invoices to liquidity providers via smart contracts and receive capital upfront.",
      tech: ["Web3", "Ethereum", "Smart Contracts"],
      status: "1ST PLACE",
      github: "https://github.com/jorgesandev/liquifi",
      web: "https://liquifidev.vercel.app/"
    },
    {
      id: "PRJ_02",
      name: "AxoCred",
      description: "2nd Place at Crevolution Hackathon (October 2025). B2B SaaS that turns bank debt collection into proactive credit renegotiation. Axo, a conversational AI built with Google Gemini and the Live API for real time voice, contacts at risk users before their due date, offers flexible payment plans, and syncs agreements with the bank's core system.",
      tech: ["AI", "Conversational AI", "B2B SaaS", "Fintech"],
      status: "2ND PLACE",
      github: "https://github.com/jorgesandev/axocred-demo",
      web: "https://axocred-demo.vercel.app/"
    },
    {
      id: "PRJ_03",
      name: "LegisConnect",
      description: "3rd Place at Hackathon \"Elegis Tech³\" (March 2025). A social network for civic engagement, where citizens follow legislative activity and discuss bills relevant to them.",
      tech: ["Civic Tech", "Social Network", "Next.js", "TypeScript"],
      status: "3RD PLACE",
      github: "https://github.com/jorgesandev/LegisConnect",
      web: "https://legis-connect.vercel.app/"
    },
    {
      id: "PRJ_04",
      name: "Yaocihuatl",
      description: "Built for the Hackathon de Ciberdemocracia 2026, hosted in Chihuahua. Institutional platform to detect, document, preserve, and channel cases of political gender based violence in digital spaces. Three modules: Tlachia (observation and alerts), Machiyotl (forensic evidence sealing with SHA-256 hashes and chain of custody), and Chimalli (legal AI assistant with local RAG). Deployed on AWS EC2 with Next.js, FastAPI, PostgreSQL with pgvector, and Redis.",
      tech: ["Civic Tech", "AI", "RAG", "FastAPI"],
      status: "LIVE",
      github: "https://github.com/jorgesandev/yaocihuatl",
      web: "https://yaocihuatl.com"
    },
    {
      id: "PRJ_05",
      name: "FRCT",
      description: "Built for the MBC Hackathon. An onchain CFO that routes USDC between Base and Solana using Polymarket forecasts and Circle's CCTP.",
      tech: ["Next.js", "Solidity", "Rust", "Circle CCTP"],
      status: "HACKATHON",
      github: "https://github.com/jorgesandev/frct",
      web: "https://frct.jorgesandoval.dev/"
    },
    {
      id: "PRJ_06",
      name: "DenialDefender",
      description: "Built for the AMD Developer Hackathon 2026, Vision and Multimodal AI track. AI system that drafts hospital insurance appeal letters in 60 to 90 seconds, addressing the $262B in recoverable revenue that US hospitals leave unappealed every year. Multimodal RAG over patient charts, payer policies, clinical literature, and past winning appeals. Runs Qwen 2.5 reasoning and vision models on an AMD Instinct MI300X via vLLM and ROCm.",
      tech: ["AI", "RAG", "Multimodal", "FastAPI"],
      status: "HACKATHON",
      github: "https://github.com/jorgesandev/denialdefender",
      web: "https://www.trydenialdefender.com"
    }
  ];

  return (
    <section id="projects" className="py-24 relative bg-surface border-b ghost-border dot-grid">
      <div className="max-w-6xl mx-auto px-6 w-full">
        
        <div className="mb-12">
          <div className="label-text text-primary mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
            Section 03 // Projects
          </div>
          <h2 className="text-4xl font-sans font-bold text-on-surface">
            Selected work.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className="w-full bg-surface-container-lowest p-8 rounded-sm ghost-border shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[500px] md:min-h-[460px] h-full"
            >
              <div>
                <div className="flex justify-between items-center mb-8 border-b ghost-border pb-4">
                  <span className="label-text text-outline text-xs">{project.id}</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${['LIVE', '1ST PLACE', '2ND PLACE', '3RD PLACE'].includes(project.status) ? 'bg-primary' : 'bg-outline'}`}></span>
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
        </div>
        
      </div>
    </section>
  );
}
