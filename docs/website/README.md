# Prism's web pages

The live pages are in the website repo (`rageinstall/ttimemedia.org`), not here:

- `src/pages/prism.astro` → https://www.ttimemedia.org/prism (about, support, privacy policy)
- `src/pages/prism-terms.astro` → https://www.ttimemedia.org/prism-terms (terms of service)

Since 2026-10-05 they use the site's own layout. The `.html` files in this folder are the
earlier standalone versions, kept as a record of the wording. **Edit the policy in the website
repo**, then copy the wording change here. Never copy these `.html` files into the site's
`public/` folder: they would replace the designed pages.

Pushing to the website repo's `main` deploys it (Vercel). Work from a fresh clone: the local
clone at `~/Projects/ttimemedia` is out of date.
