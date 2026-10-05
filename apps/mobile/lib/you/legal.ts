/**
 * Where Prism's legal pages live. They are published on ttimemedia.org from
 * docs/website/ (prism.html → /prism, prism-terms.html → /prism-terms), so
 * a change goes live with a website push and never needs an app update.
 * The App Store listing links to the same privacy policy.
 */
export const LEGAL_LINKS = {
  privacy: 'https://www.ttimemedia.org/prism#privacy',
  terms: 'https://www.ttimemedia.org/prism-terms',
} as const;
