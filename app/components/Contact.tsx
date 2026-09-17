import ContactForm from "./ContactForm";
import { contactEndpoint } from "../lib/contact";
export default function Contact() {
  const endpoint = contactEndpoint(
    process.env.FORMSPREE_ENDPOINT,
    process.env.CONTACT_FORM_ENABLED,
  );
  return (
    <section
      id="contact"
      className="section wrap contact-grid"
      aria-labelledby="contact-title"
    >
      <div className="contact-copy">
        <p className="eyebrow">05 / Say hello</p>
        <h2 id="contact-title">
          Let’s build
          <br />
          something useful.
        </h2>
        <p>
          Have an engineering opportunity, a project in mind, or a question
          worth exploring? I’d like to hear about it.
        </p>
        <a className="contact-email" href="mailto:contact@jorgesandoval.dev">
          contact@jorgesandoval.dev
        </a>
        <div className="contact-socials">
          <a
            href="https://www.linkedin.com/in/jorgesandev/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/jorgesandev"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
      <ContactForm endpoint={endpoint} />
    </section>
  );
}
