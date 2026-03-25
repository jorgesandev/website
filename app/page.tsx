import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import PetProjects from "./components/PetProjects";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <Hero />
      <About />
      <Experience />
      <PetProjects />
      
      <footer className="py-12 border-t ghost-border text-center label-text text-xs text-outline bg-surface-container-low">
        <p>© {new Date().getFullYear()} JORGE SANDOVAL // ALL RIGHTS RESERVED.</p>
        <p className="mt-4 opacity-50 text-[10px]">SYSTEM CALIBRATED: {new Date().toISOString().split('T')[0]}</p>
      </footer>
    </main>
  );
}
