import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Services from "./components/Services";
import Contact from "./components/Contact";
export default function Home() {
  return (
    <>
      <main id="main">
        <Hero />
        <Projects />
        <About />
        <Experience />
        <Services />
        <Contact />
      </main>
      <footer className="wrap footer">
        <span>© {new Date().getFullYear()} Jorge Sandoval</span>
        <span className="mono">jorgesandev · Built with intention.</span>
        <a href="/privacy">Privacy</a>
      </footer>
    </>
  );
}
