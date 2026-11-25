/**
 * Post slugs from before the November 2026 renumbering (08-12 became 01-05), mapped to the
 * current slug. Old links, e.g. ones shared on X, redirect to the new page.
 */
export const legacyPostSlugs: Record<string, string> = {
  '08-precious-metals-map': '01-precious-metals-map',
  '09-oil-reserves-map': '02-oil-reserves-map',
  '10-gold-real-yields-vs-commodities': '03-gold-real-yields-vs-commodities',
  '11-alternative-commodities-correlations': '04-alternative-commodities-correlations',
  '12-use-cases-of-riemanns-hypothesis': '05-use-cases-of-riemanns-hypothesis',
};
