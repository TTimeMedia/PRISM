/**
 * Suggested answers for the pick-from-a-list fields. They are suggestions
 * only: every field also accepts a person's own words, and nothing here is
 * ever required.
 */

export const PRONOUN_OPTIONS = [
  'she/her',
  'he/him',
  'they/them',
  'she/they',
  'he/they',
  'any pronouns',
  'ask me',
  'prefer not to say',
] as const;

export const GENDER_OPTIONS = [
  'Woman',
  'Man',
  'Non-binary',
  'Transgender woman',
  'Transgender man',
  'Genderqueer',
  'Genderfluid',
  'Agender',
  'Questioning',
  'Prefer not to say',
] as const;

/**
 * Common medications people bring to Prism, alphabetical. This is a
 * convenience list, not medical guidance, and not exhaustive: anything
 * else can be typed in.
 */
export const MEDICATION_OPTIONS = [
  'Anastrozole',
  'Bicalutamide',
  'Cyproterone acetate',
  'Dutasteride',
  'Estradiol (gel)',
  'Estradiol (patch)',
  'Estradiol (pill)',
  'Estradiol cypionate',
  'Estradiol valerate',
  'Finasteride',
  'Histrelin implant',
  'Leuprolide',
  'Medroxyprogesterone',
  'Minoxidil',
  'Progesterone',
  'Spironolactone',
  'Testosterone (gel)',
  'Testosterone cypionate',
  'Testosterone enanthate',
  'Testosterone undecanoate',
  'Triptorelin',
  'Vitamin D',
] as const;
