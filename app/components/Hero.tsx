"use client";

import { motion } from "framer-motion";
import ParticlePortrait from "./ParticlePortrait";
import { FaEnvelope, FaFilePdf } from 'react-icons/fa6';

export default function Hero() {
  return (
    <section id="hero" className="min-h-[100dvh] pt-16 flex items-center justify-center border-b ghost-border">
      <div className="max-w-6xl mx-auto px-4 md:px-6 w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center justify-items-center md:justify-items-stretch">

        {/* Left Column: Character Art */}
        <div className="flex justify-center md:justify-end order-1 md:order-1 w-full flex-col items-center md:flex-row">
          <div className="relative w-full max-w-60 md:max-w-sm aspect-square flex items-center justify-center">
            <ParticlePortrait />
          </div>
        </div>

        {/* Right Column: Text content */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left order-2 md:order-2 w-full max-w-md md:max-w-full">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-sans font-light text-on-surface mb-4 md:mb-6 flex flex-wrap justify-center md:justify-start items-center">
            Hi,&nbsp;<span className="text-primary font-normal">Jorge</span>&nbsp;here
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              className="inline-block w-[1px] md:w-0.5 h-[1em] bg-primary ml-1"
            />
          </h1>

          <p className="text-on-surface-variant font-sans text-sm md:text-lg max-w-lg mb-8 md:mb-10 leading-relaxed md:font-light px-2 md:px-0">
            Software Engineering candidate at UABC ('26) with experience in mobile (React Native/Expo) and fullstack development. Winner of national Web3 and AI hackathons, with hands-on experience designing, building, and deploying applications from scratch. AWS Certified, fluent in English (C2).
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <a href="mailto:contact@jorgesandoval.dev" className="tactical-button border border-primary text-primary hover:bg-primary hover:text-on-primary uppercase flex items-center justify-center gap-2 w-full sm:w-auto">
              <FaEnvelope size={16} /> Say hi!
            </a>
            <a href="/Jorge_Sandoval_Resume.pdf" target="_blank" rel="noopener noreferrer" className="tactical-button border border-outline text-on-surface hover:border-primary hover:text-primary uppercase flex items-center justify-center gap-2 w-full sm:w-auto">
              <FaFilePdf size={16} /> Resume
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
