import { test } from "node:test";
import assert from "node:assert/strict";
import { contactEndpoint } from "../app/lib/contact.ts";
test("incomplete or disabled configuration exposes no submission action", () => {
  for (const flag of [undefined, "", "false"])
    assert.equal(
      contactEndpoint("https://formspree.io/f/example123", flag),
      null,
    );
  assert.equal(contactEndpoint(undefined, "true"), null);
});
test("only a public HTTPS Formspree endpoint is accepted", () => {
  assert.equal(
    contactEndpoint("https://formspree.io/f/example123", "true"),
    "https://formspree.io/f/example123",
  );
  for (const url of [
    "javascript:alert(1)",
    "http://formspree.io/f/example",
    "https://formspree.io.evil.test/f/example",
    "https://formspree.io@evil.test/f/example",
    "https://formspree.io/f/",
    "https://formspree.io/f/example?redirect=elsewhere",
  ])
    assert.equal(contactEndpoint(url, "true"), null);
});
