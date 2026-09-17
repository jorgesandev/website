import Link from "next/link";
export default function ContactForm({ endpoint }: { endpoint: string | null }) {
  if (!endpoint)
    return (
      <div className="contact-unavailable">
        <p className="eyebrow">Start a conversation</p>
        <h3>One message is enough.</h3>
        <p>
          Tell me about the role, the problem you’re working on, or the idea
          you’d like to explore.
        </p>
        <a className="button primary" href="mailto:contact@jorgesandoval.dev">
          Email Jorge <span aria-hidden="true">↗</span>
        </a>
        <p className="form-note">
          The inquiry form is temporarily unavailable. Direct email is always
          welcome.
        </p>
      </div>
    );
  return (
    <form
      className="contact-form"
      action={endpoint}
      method="POST"
      aria-describedby="contact-notice"
    >
      <input
        type="hidden"
        name="subject"
        value="New inquiry — jorgesandoval.dev"
      />
      <div className="form-pair">
        <div className="field">
          <label htmlFor="contact-name">Name</label>
          <input
            id="contact-name"
            name="name"
            autoComplete="name"
            required
            maxLength={100}
          />
        </div>
        <div className="field">
          <label htmlFor="contact-email">Email</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="contact-topic">I’d like to discuss</label>
        <select id="contact-topic" name="topic" defaultValue="Role">
          <option value="Role">An engineering role</option>
          <option value="Project">A freelance project</option>
          <option value="Collaboration">A collaboration</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="contact-message">Message</label>
        <textarea
          id="contact-message"
          name="message"
          placeholder="A little about the opportunity, project, or idea…"
          required
          minLength={20}
          maxLength={4000}
          rows={5}
        />
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input
          id="contact-website"
          name="_gotcha"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <p id="contact-notice" className="form-note">
        Your details are used to respond to your inquiry. No newsletter signup.{" "}
        <Link href="/privacy">Privacy details</Link>. Formspree will confirm
        your submission on the next page.
      </p>
      <button className="button primary" type="submit">
        Send inquiry <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}
