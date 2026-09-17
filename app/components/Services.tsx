const services = [
  [
    "01",
    "Websites & landing pages",
    "Clear, responsive websites with accessible interfaces, basic technical SEO, and a handover you can maintain.",
  ],
  [
    "02",
    "Fullstack MVPs & internal tools",
    "Scoped web applications with interfaces, authentication, data models, and integrations. Start with one useful workflow.",
  ],
  [
    "03",
    "Applied AI & automation",
    "Prototypes for retrieval, assisted workflows, and repetitive tasks, with evaluation criteria and human review where needed.",
  ],
];
export default function Services() {
  return (
    <section id="services" className="services-band">
      <div className="section wrap">
        <div className="section-heading">
          <p className="eyebrow">04 / Work together</p>
          <h2>A useful starting point.</h2>
          <p>
            My primary focus is an engineering role. I also take on selected
            projects with a clear problem and a realistic scope.
          </p>
        </div>
        <div className="services-grid">
          {services.map(([id, title, description]) => (
            <article key={id}>
              <span className="mono muted">/{id}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
        <p className="services-note">
          Mobile work is available by consultation. Ongoing SEO campaigns,
          Google Business management, and hardware are not part of my standard
          offer today.
        </p>
        <a className="text-link" href="#contact">
          Tell me what you’re working on
        </a>
      </div>
    </section>
  );
}
