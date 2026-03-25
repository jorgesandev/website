import Link from 'next/link';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa6';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b ghost-border h-16 flex items-center">
      <div className="max-w-6xl mx-auto px-6 w-full flex items-center justify-between">
        
        <Link href="/" className="font-sans font-medium text-lg tracking-tight hover:text-primary transition-colors">
          Jorge Sandoval
        </Link>
        
        <div className="hidden md:flex gap-8 label-text text-xs text-on-surface-variant">
          <a href="#about" className="hover:text-primary transition-colors">About</a>
          <a href="#experience" className="hover:text-primary transition-colors">Experience</a>
          <a href="#projects" className="hover:text-primary transition-colors">Projects</a>
        </div>
        
        <div className="flex gap-4 items-center text-on-surface-variant">
          <a href="https://github.com/jorgesandev" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center justify-center border ghost-border px-2 py-1 rounded-sm">
            <FaGithub size={18} />
          </a>
          <a href="https://www.linkedin.com/in/jorgesandev/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center justify-center border ghost-border px-2 py-1 rounded-sm">
            <FaLinkedin size={18} />
          </a>
          <a href="mailto:contact@jorgesandoval.dev" className="hover:text-primary transition-colors flex items-center justify-center border ghost-border px-2 py-1 rounded-sm">
            <FaEnvelope size={18} />
          </a>
        </div>
        
      </div>
    </nav>
  );
}
