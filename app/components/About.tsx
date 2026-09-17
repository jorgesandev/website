export default function About() {
  return (
    <section
      id="about"
      className="section wrap about-grid"
      aria-labelledby="about-title"
    >
      <div>
        <p className="eyebrow">02 / Perspective</p>
        <h2 id="about-title">
          Engineering with
          <br />
          people in mind.
        </h2>
      </div>
      <div className="prose">
        <p>
          I’m a software engineer based in Tijuana, working across web, mobile,
          and applied AI. I’ve built internal tools, contributed to a startup
          beta, and developed prototypes in national hackathons.
        </p>
        <p>
          I care about how a system works and what it makes possible for the
          person using it. That means explaining tradeoffs, being honest about
          limitations, and keeping human judgment in the loop.
        </p>
        <p>
          I completed the degree requirements for Software and Emerging
          Technologies Engineering at UABC Tijuana; degree issuance is pending.
          Outside engineering, I make music and play piano.
        </p>
        <div className="toolkit">
          <p className="eyebrow">Working toolkit</p>
          <p>
            TypeScript / React / Next.js / Python / FastAPI / Django /
            PostgreSQL / React Native
          </p>
        </div>
      </div>
    </section>
  );
}
