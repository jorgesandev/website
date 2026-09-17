import Image from "next/image";

export default function Hero() {
  return (
    <section className="hero wrap" aria-labelledby="intro-title">
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="status-dot" /> Software engineer · Tijuana, MX
        </p>
        <h1 id="intro-title">
          Useful software.
          <br />
          <span>Thoughtfully built.</span>
        </h1>
        <p className="hero-intro">
          I’m Jorge Sandoval. I build fullstack products and applied-AI systems,
          connecting interfaces, backend services, and the people who use them.
        </p>
        <div className="actions">
          <a className="button primary" href="#projects">
            Explore my work
          </a>
          <a
            className="button"
            href="/Jorge_Alejandro_Sandoval_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            View résumé
          </a>
        </div>
        <p className="availability">
          Open to engineering roles, selected freelance projects, and
          collaboration.
        </p>
      </div>
      <figure className="portrait">
        <div className="portrait-image">
          <Image
            src="/jorge.jpeg"
            alt="Jorge Sandoval"
            fill
            sizes="(max-width: 760px) 85vw, 340px"
            priority
          />
        </div>
        <figcaption>
          <span>Jorge Sandoval</span>
          <span className="mono">@jorgesandev</span>
        </figcaption>
        <div className="portrait-note" aria-hidden="true">
          BUILD / UNDERSTAND / SHARE
        </div>
      </figure>
      <div className="hero-foot mono">
        <span>Fullstack engineering + applied AI</span>
        <span>TypeScript · Python · React</span>
      </div>
    </section>
  );
}
