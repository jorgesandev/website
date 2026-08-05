"use client";

import Link from 'next/link';
import { useState } from 'react';
import { FaEnvelope, FaGithub, FaLinkedin, FaBars, FaXmark } from 'react-icons/fa6';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const socialLinks = [
    { href: "https://github.com/jorgesandev", label: "GitHub", icon: <FaGithub size={18} /> },
    { href: "https://www.linkedin.com/in/jorgesandev/", label: "LinkedIn", icon: <FaLinkedin size={18} /> },
    { href: "mailto:jorge@jorgesandoval.dev", label: "Email", icon: <FaEnvelope size={18} /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b ghost-border">
      <div className="h-16 max-w-6xl mx-auto px-4 md:px-6 w-full flex items-center justify-between">
        
        <Link 
          href="/" 
          onClick={(e) => {
            if (window.location.pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            setIsOpen(false);
          }} 
          className="font-sans font-medium text-base md:text-lg tracking-tight hover:text-primary transition-colors shrink-0"
        >
          Jorge Sandoval
        </Link>

        {/* Desktop text links */}
        <div className="hidden md:flex gap-8 label-text text-xs text-on-surface-variant flex-1 justify-center">
          <a href="#about" className="hover:text-primary transition-colors">About</a>
          <a href="#experience" className="hover:text-primary transition-colors">Experience</a>
          <a href="#projects" className="hover:text-primary transition-colors">Projects</a>
        </div>
        
        {/* Desktop social icons */}
        <div className="hidden md:flex gap-4 md:gap-5 items-center text-on-surface-variant justify-end shrink-0">
          {socialLinks.map((link, i) => (
            <a key={i} href={link.href} target={link.label !== "Email" ? "_blank" : undefined} rel={link.label !== "Email" ? "noopener noreferrer" : undefined} aria-label={link.label} title={link.label} className="hover:text-primary hover:-translate-y-0.5 transition-all outline-none">
              {link.icon}
            </a>
          ))}
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          className="md:hidden text-on-surface-variant hover:text-primary p-2 transition-colors outline-none shrink-0"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <FaXmark size={24} /> : <FaBars size={24} />}
        </button>
        
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden flex flex-col border-t ghost-border bg-surface px-4 py-8 shadow-2xl absolute top-16 left-0 right-0 max-h-[calc(100vh-4rem)] overflow-y-auto glass-panel">
          <div className="flex flex-col gap-8 label-text text-sm text-center">
            <a href="#about" onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors">ABOUT</a>
            <a href="#experience" onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors">EXPERIENCE</a>
            <a href="#projects" onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors">PROJECTS</a>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-on-surface-variant mt-10">
            {socialLinks.map((link, i) => (
              <a key={i} href={link.href} target={link.label !== "Email" ? "_blank" : undefined} rel={link.label !== "Email" ? "noopener noreferrer" : undefined} aria-label={link.label} title={link.label} className="hover:text-primary hover:-translate-y-0.5 transition-all outline-none">
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
