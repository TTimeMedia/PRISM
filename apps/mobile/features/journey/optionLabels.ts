/**
 * Suggested milestones (Screen 45) — always optional, always paired with
 * "Create your own." See docs/MASTER_BUILD_SPEC.md §09.
 */
export const SUGGESTED_MILESTONE_TITLES = [
  'Came out',
  'Started HRT',
  'First appointment',
  'First injection',
  'Name change',
  'Pronoun change',
  'Legal gender marker change',
  'Surgery consultation',
  'Surgery',
  'One month',
  'Six months',
  'One year',
] as const;

/**
 * Suggested moods (Screen 48/49) — optional, tap-to-fill words that
 * supplement the free-text mood field; never a rating scale or required
 * selection. See docs/DESIGN_SYSTEM.md §17 ("Mood is optional and must
 * never be a forced rating").
 */
export const SUGGESTED_JOURNAL_MOODS = [
  'Hopeful',
  'Tired',
  'Grateful',
  'Anxious',
  'Proud',
  'Overwhelmed',
  'Peaceful',
  'Frustrated',
  'Excited',
  'Uncertain',
] as const;

/** Suggested journal tags — optional, alongside free-text custom tags. */
export const SUGGESTED_JOURNAL_TAGS = [
  'HRT',
  'Appointment',
  'Milestone',
  'Therapy',
  'Family',
  'Friends',
  'Work',
  'Self-care',
  'Community',
  'Reflection',
] as const;
