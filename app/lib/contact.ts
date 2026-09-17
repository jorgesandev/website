/** Public Formspree submission endpoint, never an API key. Invalid config fails closed. */
export function contactEndpoint(
  endpoint: string | undefined,
  enabled: string | undefined,
): string | null {
  if (enabled !== "true" || !endpoint) return null;
  return /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(endpoint)
    ? endpoint
    : null;
}
