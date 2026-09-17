import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Contact privacy — Jorge Sandoval" };
export default function Privacy() {
  return (
    <main id="main" className="wrap section legal">
      <p className="eyebrow">Contact privacy · September 16, 2026</p>
      <h1>Your inquiry, handled with care.</h1>
      <p>
        Jorge Sandoval uses the name, email address, topic, and message you
        provide to respond to your inquiry and discuss the opportunity you
        describe. Please do not include sensitive personal information.
      </p>
      <h2>How your message is handled</h2>
      <p>
        When enabled, the contact form sends your inquiry to Formspree, which
        stores submissions in Jorge’s Formspree account and can forward them to
        his email inbox. Your email is used as the reply address. The website
        does not store inquiries in an application database or enroll you in
        marketing emails. The form provider, email provider, and hosting service
        may process technical delivery and security information.
      </p>
      <h2>Questions and deletion requests</h2>
      <p>
        To ask about your information or request deletion of your inquiry, email{" "}
        <a href="mailto:contact@jorgesandoval.dev">contact@jorgesandoval.dev</a>
        . Messages may remain in Formspree and the email inbox until removed;
        technical provider retention is governed by the provider’s policies.
      </p>
      <p>
        <a href="https://formspree.io/legal/privacy-policy/">
          Formspree privacy policy ↗
        </a>
      </p>
      <p>
        <Link href="/#contact">← Back to contact</Link>
      </p>
    </main>
  );
}
