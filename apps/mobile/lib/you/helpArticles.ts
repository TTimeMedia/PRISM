/**
 * The Help center's articles. They ship inside the app, so they read offline
 * and reach phones with an over-the-air update like any other text. Each
 * one describes what the app really does today: when a feature changes,
 * change its article in the same commit.
 *
 * A block is a paragraph, a numbered list of steps, or a tip.
 */
export type HelpBlock =
  { type: 'p'; text: string } | { type: 'steps'; items: string[] } | { type: 'tip'; text: string };

export interface HelpArticle {
  slug: string;
  title: string;
  category: HelpCategory;
  /** One line under the title in the list, and what search matches besides the title. */
  summary: string;
  blocks: HelpBlock[];
}

export const HELP_CATEGORIES = [
  'Getting started',
  'Reminders',
  'Care',
  'Journey',
  'Privacy and security',
  'Your account and data',
] as const;
export type HelpCategory = (typeof HELP_CATEGORIES)[number];

export const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: 'what-prism-does',
    title: 'What Prism does',
    category: 'Getting started',
    summary: 'An organizer for your care. It never gives medical advice.',
    blocks: [
      {
        type: 'p',
        text: 'Prism keeps the details of your care in one place: medications and doses, appointments, milestones and a journal. It reminds you when you ask it to.',
      },
      {
        type: 'p',
        text: 'Prism stores and organizes what you tell it. It never interprets, recommends or diagnoses. For anything about your health, talk to your care team.',
      },
      {
        type: 'p',
        text: 'Every question Prism asks is optional. Skip anything you like; nothing breaks without it.',
      },
    ],
  },
  {
    slug: 'choose-what-shows',
    title: 'Choose what shows',
    category: 'Getting started',
    summary: 'Turn features on and off so Prism only shows what you use.',
    blocks: [
      {
        type: 'p',
        text: "Prism is built from parts: medications, appointments, milestones and the journal. Turn off the ones you don't need and they disappear from Today, Care and your Timeline. Nothing you saved is deleted.",
      },
      {
        type: 'steps',
        items: [
          'Open the menu (top left) and tap Choose what shows.',
          'Switch features on or off.',
        ],
      },
    ],
  },
  {
    slug: 'reminders-not-arriving',
    title: "Reminders aren't arriving",
    category: 'Reminders',
    summary: 'Check notifications are allowed, then send a test reminder.',
    blocks: [
      {
        type: 'p',
        text: "Reminders are scheduled on your iPhone itself, so they work without a connection. If they don't show up, it's almost always a phone setting.",
      },
      {
        type: 'steps',
        items: [
          'On your iPhone, open Settings, then Notifications, then Prism, and make sure Allow Notifications is on.',
          "Check that a Focus mode (like Sleep or Do Not Disturb) isn't hiding them.",
          'In Prism, open the menu, tap Reminders, and tap Send a test reminder. It arrives in a few seconds.',
          'Open Prism once after changing a medication or appointment, so its reminders are updated.',
        ],
      },
      {
        type: 'tip',
        text: 'A dot on the bell at the top of Today means reminders are on in Prism but your phone is blocking them.',
      },
    ],
  },
  {
    slug: 'private-notifications',
    title: 'Private notifications',
    category: 'Reminders',
    summary: 'Why reminders say only "Your Prism reminder is ready."',
    blocks: [
      {
        type: 'p',
        text: 'Private notifications is on to start with. While it is, every reminder on your lock screen says only "Your Prism reminder is ready." Nobody glancing at your phone learns what it\'s for.',
      },
      {
        type: 'p',
        text: 'Turn it off to see your own wording instead, like "Shot day: Testosterone cypionate at 10:00 AM." You can pick the wording for medications, shot days and appointments, or write your own.',
      },
      {
        type: 'steps',
        items: [
          'Open the menu and tap Reminders.',
          'Turn Private notifications on or off.',
          'Tap Choose reminder wording to pick what reminders say.',
        ],
      },
    ],
  },
  {
    slug: 'done-snooze-follow-up',
    title: 'Done, Snooze and follow-ups',
    category: 'Reminders',
    summary: 'Log a dose from the notification, or ask again in 10 minutes.',
    blocks: [
      {
        type: 'p',
        text: 'Press and hold a medication reminder to see its buttons. Done logs the dose. Snooze reminds you again in 10 minutes.',
      },
      {
        type: 'p',
        text: "With Gentle follow-up on, Prism sends one more nudge if a dose isn't marked done 30 minutes after its reminder. Logging the dose cancels the nudge. Turn it off under Reminders, then Doses.",
      },
    ],
  },
  {
    slug: 'duplicate-reminders',
    title: 'I got the same reminder more than once',
    category: 'Reminders',
    summary: 'Open Prism to refresh your reminders, and remove old copies of the app.',
    blocks: [
      {
        type: 'p',
        text: "Opening Prism rebuilds your phone's whole reminder schedule from your account, which clears any leftovers.",
      },
      {
        type: 'steps',
        items: [
          'Open Prism, close it completely, and open it again.',
          'If you have an older copy of Prism on your phone (for example a test version with a different icon), delete it. It keeps its own reminders.',
          "If it still happens, report it from Support and we'll look into it.",
        ],
      },
    ],
  },
  {
    slug: 'apple-watch',
    title: 'Prism on Apple Watch',
    category: 'Reminders',
    summary: "See today's doses and your next appointment, and log a dose from your wrist.",
    blocks: [
      {
        type: 'p',
        text: "Prism on Apple Watch shows today's doses and your next appointment. Tap a dose and choose Taken to log it, or press Done on a reminder.",
      },
      {
        type: 'steps',
        items: [
          'On your iPhone, open the Watch app, find Prism under Available Apps, and tap Install.',
          'Open Prism on your iPhone once, so it can send your day to the watch.',
        ],
      },
      {
        type: 'p',
        text: 'Your watch gets everything from your iPhone, never from the internet. With Private notifications on, it shows "Dose" and "Appointment" instead of names.',
      },
      {
        type: 'tip',
        text: 'A dose logged while your iPhone is out of reach shows as taken on the watch straight away, and is saved the next time you open Prism on your iPhone.',
      },
    ],
  },
  {
    slug: 'medications-and-doses',
    title: 'Medications and doses',
    category: 'Care',
    summary: 'Add a medication, log doses and injection sites, and pause one.',
    blocks: [
      {
        type: 'steps',
        items: [
          'Go to Care and tap Medications, then add one with its schedule and an optional reminder.',
          'Log a dose from Today, from the medication, or with Done on its reminder. For injections you can note the site.',
          'Tap Pause on a medication you stop taking. Its reminders stop and its history stays.',
        ],
      },
      {
        type: 'p',
        text: 'Prism offers common medication names as a shortcut. It is not a list of recommendations, and you can type any name.',
      },
    ],
  },
  {
    slug: 'appointments-and-calendar',
    title: 'Appointments and your calendar',
    category: 'Care',
    summary: 'Reminders before appointments, calendar sync and import.',
    blocks: [
      {
        type: 'p',
        text: 'Add an appointment under Care, then Appointments. Choose how early to be reminded under Reminders, then Appointment reminders.',
      },
      {
        type: 'p',
        text: 'To see appointments in Apple Calendar, open the menu, tap Calendar and turn on Sync to calendar. Then open any appointment to add it to your calendar.',
      },
      {
        type: 'p',
        text: 'To bring appointments in, tap the calendar icon at the top of Appointments and pick the events to add, or open an invite file (.ics) from email or Files and choose Prism.',
      },
      {
        type: 'tip',
        text: "Turn on Suggest appointments from my calendar (menu, then Calendar) and Today will offer bookings you've added to your calendar, for example with Gmail's Add to Calendar, so adding them to Prism is one tap.",
      },
    ],
  },
  {
    slug: 'journey',
    title: 'Milestones, journal and photos',
    category: 'Journey',
    summary: 'Keep your story, with up to five photos each that only you can see.',
    blocks: [
      {
        type: 'p',
        text: 'Milestones mark the moments that matter to you. The journal is for anything else. Each can hold up to five photos: swipe through them on the entry, and they pop up as small bubbles on your Timeline, which shows everything in order.',
      },
      {
        type: 'p',
        text: 'Photos are stored privately in your account. Prism only sees the photo you pick, never the rest of your library.',
      },
    ],
  },
  {
    slug: 'app-lock',
    title: 'App Lock and Face ID',
    category: 'Privacy and security',
    summary: 'Lock Prism with a PIN or Face ID, and what to do if you forget the PIN.',
    blocks: [
      {
        type: 'steps',
        items: [
          'Open the menu, tap Privacy, then App lock.',
          'Turn on Enable App Lock and choose a PIN.',
          'Optionally turn on Use biometrics to unlock with Face ID.',
        ],
      },
      {
        type: 'p',
        text: 'Prism locks whenever you leave it, so nobody can pick up your phone and open it.',
      },
      {
        type: 'p',
        text: 'Forgot your PIN? On the lock screen, tap Forgot your PIN? and sign out. Your data stays in your account. Sign back in with your email and password, then set a new PIN.',
      },
    ],
  },
  {
    slug: 'who-sees-my-data',
    title: 'Who can see my data',
    category: 'Privacy and security',
    summary:
      'Your account is yours alone. No ads, nothing sold, and usage counts only if you say yes.',
    blocks: [
      {
        type: 'p',
        text: 'Everything you add is stored in your Prism account, and the database only lets your account read it. Prism has no advertising and never sells your data.',
      },
      {
        type: 'p',
        text: 'If you said yes to sharing anonymous usage, Prism counts which screens and features get used, never what you write or record, and not linked to your account. Turn it off any time in Privacy & security.',
      },
      {
        type: 'p',
        text: 'The privacy policy, in About Prism, lists every company that helps run Prism and exactly what each one receives.',
      },
    ],
  },
  {
    slug: 'export-data',
    title: 'Export your data',
    category: 'Your account and data',
    summary: 'Save a copy of everything in your account.',
    blocks: [
      {
        type: 'steps',
        items: [
          'Open the menu and tap Data and export.',
          'Tap Export my data, then choose where to save or send the file.',
        ],
      },
      {
        type: 'p',
        text: 'The file contains every section of your account, including reminders. Keep it somewhere safe: it holds your health information.',
      },
    ],
  },
  {
    slug: 'delete-account',
    title: 'Delete your account',
    category: 'Your account and data',
    summary: 'Permanently removes your account, your records and your photos.',
    blocks: [
      {
        type: 'steps',
        items: [
          'Export your data first if you want a copy.',
          'Open the menu, tap Data and export, then Delete my account.',
          'Type DELETE to confirm.',
        ],
      },
      {
        type: 'p',
        text: "This can't be undone. Your account, every record and every photo are deleted.",
      },
    ],
  },
  {
    slug: 'reset-password',
    title: 'Reset your password',
    category: 'Your account and data',
    summary: "Get a reset link by email if you can't sign in.",
    blocks: [
      {
        type: 'steps',
        items: [
          'On the sign-in screen, tap Forgot password?',
          'Enter your email. A reset link arrives from no-reply@ttimemedia.org.',
          'Open the link on your iPhone. It opens Prism, where you choose a new password.',
        ],
      },
      {
        type: 'tip',
        text: 'No email after a few minutes? Check your junk folder, and that you typed the address you signed up with.',
      },
    ],
  },
  {
    slug: 'offline',
    title: 'Using Prism without a connection',
    category: 'Your account and data',
    summary: 'Changes wait and save when you are back online.',
    blocks: [
      {
        type: 'p',
        text: "Reminders work offline. If you add or change something without a connection, Prism shows a banner and saves it as soon as you're back online.",
      },
    ],
  },
];

export function findHelpArticle(slug: string | undefined): HelpArticle | undefined {
  return HELP_ARTICLES.find((article) => article.slug === slug);
}

/** Articles whose title, summary or text contain every word typed. */
export function searchHelpArticles(query: string): HelpArticle[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return HELP_ARTICLES;
  return HELP_ARTICLES.filter((article) => {
    const haystack = [
      article.title,
      article.summary,
      ...article.blocks.flatMap((block) => (block.type === 'steps' ? block.items : [block.text])),
    ]
      .join(' ')
      .toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
}
