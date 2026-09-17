const experiences = [
  {
    id: "01",
    role: "Founding Software Engineer · Part-Time Equity Project",
    company: "Pitch Jams",
    period: "October 2025 to Present",
    description:
      "Built the beta mobile and web application in an Expo monorepo targeting iOS, Android, and web from one React Native and TypeScript codebase. Prepared releases through TestFlight and Google Play Console, designed access-control logic for four subscription plans, and contributed Django REST API endpoints, data models, and authentication flows.",
  },
  {
    id: "02",
    role: "IT Intern",
    company: "Directive Consulting",
    period: "May 2025 to October 2025",
    description:
      "Built an internal asset inventory management system using Next.js, Firebase Auth, and Firestore. Integrated the Google Workspace Admin SDK through Cloud Functions for role-based access control, with real-time queries and Google SSO.",
  },
  {
    id: "03",
    role: "Software Developer · Professional Social Service",
    company: "UABC",
    period: "August 2024 to February 2025",
    description:
      "Developed a React, Express, and PostgreSQL student tracking system for psychopedagogists. Implemented JWT authentication, resolved stability issues, and documented the system for future maintainers.",
  },
];

export default function Experience() {
  return (
    <section
      id="experience"
      className="section wrap"
      aria-labelledby="experience-title"
    >
      <div className="section-heading compact">
        <p className="eyebrow">03 / Experience</p>
        <h2 id="experience-title">Built with others.</h2>
      </div>
      <div>
        {experiences.map((exp) => (
          <article className="experience-row" key={exp.id}>
            <div>
              <p className="mono muted">{exp.period}</p>
              <h3>{exp.company}</h3>
            </div>
            <div>
              <h4>{exp.role}</h4>
              <p>{exp.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
