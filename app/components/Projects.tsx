import { projects } from "../lib/projects";
export default function Projects() {
  return (
    <section
      id="projects"
      className="section wrap"
      aria-labelledby="work-title"
    >
      <div className="section-heading">
        <p className="eyebrow">01 / Selected work</p>
        <h2 id="work-title">
          From problem
          <br />
          to working system.
        </h2>
        <p>
          Three projects across accessibility, civic technology, and finance. My
          contribution, the approach, and where the work stands.
        </p>
      </div>
      <div className="case-studies">
        {projects.map((project) => (
          <article className="case-study" key={project.id}>
            <div className="case-index mono">/{project.id}</div>
            <div className="case-body">
              <div className="case-top">
                <p className="eyebrow">{project.category}</p>
                <span className="badge">{project.status}</span>
              </div>
              <h3>{project.name}</h3>
              <p className="case-summary">{project.summary}</p>
              <div className="case-details">
                <div>
                  <h4>Problem</h4>
                  <p>{project.problem}</p>
                </div>
                <div>
                  <h4>My contribution</h4>
                  <p>{project.contribution}</p>
                </div>
              </div>
              <details>
                <summary>
                  Approach, outcome & limitations{" "}
                  <span aria-hidden="true">+</span>
                </summary>
                <div className="case-details">
                  <div>
                    <h4>Approach</h4>
                    <p>{project.decision}</p>
                  </div>
                  <div>
                    <h4>Outcome & limitations</h4>
                    <p>{project.outcome}</p>
                  </div>
                </div>
              </details>
              <div className="case-bottom">
                <ul className="tags" aria-label="Technologies">
                  {project.stack.map((tech) => (
                    <li key={tech}>{tech}</li>
                  ))}
                </ul>
                <div className="project-links">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${project.name} source on GitHub`}
                  >
                    Source ↗
                  </a>
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.name} demo`}
                    >
                      Demo ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      <a
        className="text-link"
        href="https://github.com/jorgesandev"
        target="_blank"
        rel="noopener noreferrer"
      >
        More experiments on GitHub ↗
      </a>
    </section>
  );
}
