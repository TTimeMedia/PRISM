import { demoParams } from './setup';

/**
 * Sample data for demo mode (see ./demoFetch.ts). A made-up person, about
 * eight months into their journey. Dates are relative to today so Today
 * always has something due.
 */

export const DEMO_USER = {
  id: '00000000-0000-4000-8000-000000000001',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'sam@example.com',
  email_confirmed_at: '2026-02-01T00:00:00Z',
  app_metadata: { provider: 'email' },
  user_metadata: {},
  created_at: '2026-02-01T00:00:00Z',
  updated_at: '2026-02-01T00:00:00Z',
};

const uid = DEMO_USER.id;
const stamp = '2026-02-01T00:00:00Z';
const base = { user_id: uid, created_at: stamp, updated_at: stamp };

function day(offset: number): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date;
}
const isoDate = (offset: number) => {
  const d = day(offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const at = (offset: number, hours: number, minutes = 0) => {
  const d = day(offset);
  d.setHours(hours, minutes);
  return d.toISOString();
};
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

export function demoTables(): Record<string, Record<string, unknown>[]> {
  const today = day(0).getDay();
  const medications = [
    {
      ...base,
      id: id(101),
      name: 'Estradiol',
      form: 'pill',
      dosage_text: '2 mg',
      frequency_type: 'daily',
      frequency_config: { time_of_day: '08:00' },
      start_date: isoDate(-240),
      end_date: null,
      reminder_enabled: true,
      notes: null,
    },
    {
      ...base,
      id: id(102),
      name: 'Progesterone',
      form: 'pill',
      dosage_text: '100 mg',
      frequency_type: 'daily',
      frequency_config: { time_of_day: '21:00' },
      start_date: isoDate(-120),
      end_date: null,
      reminder_enabled: true,
      notes: 'With a snack.',
    },
    {
      ...base,
      id: id(103),
      name: 'Estradiol valerate',
      form: 'injection',
      dosage_text: '4 mg',
      frequency_type: 'weekly',
      frequency_config: { days_of_week: [today], time_of_day: '19:00' },
      start_date: isoDate(-60),
      end_date: null,
      reminder_enabled: true,
      notes: null,
    },
  ];

  const medication_logs: Record<string, unknown>[] = [];
  let logId = 500;
  for (let offset = -13; offset < 0; offset += 1) {
    medication_logs.push({
      ...base,
      id: id(logId++),
      medication_id: id(101),
      scheduled_at: at(offset, 8),
      completed_at: at(offset, 8, 12),
      status: 'completed',
      notes: null,
      site: null,
    });
    {
      medication_logs.push({
        ...base,
        id: id(logId++),
        medication_id: id(102),
        scheduled_at: at(offset, 21),
        completed_at: at(offset, 21, 5),
        status: 'completed',
        notes: null,
        site: null,
      });
    }
  }
  for (const offset of [-7, -14]) {
    medication_logs.push({
      ...base,
      id: id(logId++),
      medication_id: id(103),
      scheduled_at: at(offset, 19),
      completed_at: at(offset, 19, 10),
      status: 'completed',
      notes: null,
      site: offset === -7 ? 'left_thigh' : 'right_thigh',
    });
  }

  const tables = {
    profiles: [
      {
        ...base,
        id: id(1),
        display_name: 'Sam',
        pronouns: 'they/them',
        gender: 'Nonbinary',
        birthday: '1998-04-26',
        journey_start_date: isoDate(-240),
        profile_photo_url: null,
        onboarding_completed: true,
        journey_stage: null,
        intent: ['medications', 'appointments', 'milestones', 'journal'],
        onboarding_step: 'ready',
      },
    ],
    settings: [
      {
        ...base,
        theme: demoParams.get('theme') ?? 'light',
        app_lock_enabled: false,
        biometric_lock: false,
        notification_privacy: true,
        reduced_motion: false,
        calendar_sync_enabled: false,
        accent_color: demoParams.get('palette') ?? 'prism',
        palette: demoParams.get('palette') ?? 'prism',
        push_preferences: { security: true, updates: false },
        reminder_messages: {},
        accessibility_preferences: null,
      },
    ],
    modules: ['medications', 'injections', 'appointments', 'milestones', 'journal'].map(
      (module_key, index) => ({
        ...base,
        id: id(20 + index),
        module_key,
        enabled: true,
        configuration: {},
      }),
    ),
    medications,
    medication_logs,
    injections: [],
    appointments: [
      {
        ...base,
        id: id(201),
        title: 'Check-in with Dr. Rivera',
        provider: 'Dr. Rivera',
        category: 'Endocrinology',
        starts_at: at(2, 10, 30),
        ends_at: at(2, 11, 0),
        location: 'Riverside Health, Suite 4',
        notes: 'Bring questions about dose timing.',
        reminder_enabled: true,
      },
      {
        ...base,
        id: id(202),
        title: 'Lab work',
        provider: null,
        category: 'Labs',
        starts_at: at(9, 8, 15),
        ends_at: null,
        location: 'Quest Diagnostics',
        notes: 'Fasting.',
        reminder_enabled: true,
      },
      {
        ...base,
        id: id(203),
        title: 'Therapy',
        provider: 'Jordan Lee, LMHC',
        category: 'Therapy',
        starts_at: at(5, 17, 0),
        ends_at: at(5, 17, 50),
        location: null,
        notes: null,
        reminder_enabled: false,
      },
    ],
    milestones: [
      {
        ...base,
        id: id(301),
        title: 'Started HRT',
        description: 'Nervous and so ready.',
        date: isoDate(-240),
        category: 'First steps',
        icon: 'flag',
        image_path: null,
        image_paths: [],
      },
      {
        ...base,
        id: id(302),
        title: 'Came out to my sister',
        description: 'She hugged me for a long time.',
        date: isoDate(-180),
        category: 'Family',
        icon: 'heart',
        image_path: null,
        image_paths: [],
      },
      {
        ...base,
        id: id(303),
        title: 'Name change approved',
        description: 'Court order in hand.',
        date: isoDate(-45),
        category: 'Legal',
        icon: 'award',
        image_path: null,
        image_paths: [],
      },
      {
        ...base,
        id: id(304),
        title: 'Six months',
        description: null,
        date: isoDate(-58),
        category: 'Anniversary',
        icon: 'party-popper',
        image_path: null,
        image_paths: [],
      },
    ],
    journal_entries: [
      {
        ...base,
        id: id(401),
        title: 'A good week',
        content:
          'Wore the green jacket to work and nobody blinked. Small thing, big feeling. Remember this.',
        mood: 'Proud',
        date: isoDate(-1),
        tags: ['Work', 'Self-care'],
        image_path: null,
        image_paths: [],
      },
      {
        ...base,
        id: id(402),
        title: null,
        content: 'Tired today. Took it slow, made soup, called Mom. That was enough.',
        mood: 'Peaceful',
        date: isoDate(-4),
        tags: ['Family'],
        image_path: null,
        image_paths: [],
      },
      {
        ...base,
        id: id(403),
        title: 'After the appointment',
        content: 'Labs look steady. Dr. Rivera listened. Writing down questions helped.',
        mood: 'Hopeful',
        date: isoDate(-12),
        tags: ['Appointment', 'HRT'],
        image_path: null,
        image_paths: [],
      },
    ],
    reminders: [],
    memories: [],
    attachments: [],
    push_tokens: [],
    euphoria_moments: [
      {
        ...base,
        id: id(601),
        text: 'A stranger complimented my earrings and I glowed all day.',
        created_at: at(-3, 18),
      },
      {
        ...base,
        id: id(602),
        text: 'My sister used my name without thinking about it.',
        created_at: at(-20, 20),
      },
    ],
    appointment_questions: [
      {
        ...base,
        id: id(651),
        appointment_id: null,
        question: 'Is it okay to take my estradiol at night instead?',
        asked: false,
      },
      {
        ...base,
        id: id(652),
        appointment_id: null,
        question: 'When should we recheck my levels?',
        asked: false,
      },
    ],
    supplies: [
      {
        ...base,
        id: id(701),
        name: 'Estradiol valerate vial',
        medication_id: id(103),
        quantity: 3,
        unit: 'mL',
        per_dose: 0.2,
        refill_on: isoDate(20),
        pharmacy: 'Riverside Pharmacy',
        notes: null,
      },
      {
        ...base,
        id: id(702),
        name: 'Syringes',
        medication_id: id(103),
        quantity: 4,
        unit: 'syringes',
        per_dose: 1,
        refill_on: null,
        pharmacy: null,
        notes: null,
      },
    ],
  };
  return demoParams.get('persona') === 'eli' ? { ...tables, ...eliTables() } : tables;
}

/**
 * A second made-up person (?persona=eli): a trans man about ten months on
 * testosterone. Same account and settings as Sam; only the records differ.
 */
function eliTables(): Record<string, Record<string, unknown>[]> {
  const today = day(0).getDay();
  const medications = [
    {
      ...base,
      id: id(111),
      name: 'Testosterone cypionate',
      form: 'injection',
      dosage_text: '50 mg (0.25 mL)',
      frequency_type: 'weekly',
      frequency_config: { days_of_week: [today], time_of_day: '08:00' },
      start_date: isoDate(-300),
      end_date: null,
      reminder_enabled: true,
      notes: 'Alternate thighs.',
    },
    {
      ...base,
      id: id(112),
      name: 'Vitamin D',
      form: 'pill',
      dosage_text: '2,000 IU',
      frequency_type: 'daily',
      frequency_config: { time_of_day: '12:00' },
      start_date: isoDate(-90),
      end_date: null,
      reminder_enabled: false,
      notes: null,
    },
  ];

  const medication_logs: Record<string, unknown>[] = [];
  let logId = 800;
  for (const offset of [-7, -14, -21, -28]) {
    medication_logs.push({
      ...base,
      id: id(logId++),
      medication_id: id(111),
      scheduled_at: at(offset, 8),
      completed_at: at(offset, 8, 6),
      status: 'completed',
      notes: null,
      site: offset % 14 === 0 ? 'right_thigh' : 'left_thigh',
    });
  }
  for (let offset = -12; offset < 0; offset += 1) {
    medication_logs.push({
      ...base,
      id: id(logId++),
      medication_id: id(112),
      scheduled_at: at(offset, 12),
      completed_at: at(offset, 12, 20),
      status: 'completed',
      notes: null,
      site: null,
    });
  }

  return {
    profiles: [
      {
        ...base,
        id: id(1),
        display_name: 'Eli',
        pronouns: 'he/him',
        gender: 'Trans man',
        birthday: '1996-09-14',
        journey_start_date: isoDate(-300),
        profile_photo_url: null,
        onboarding_completed: true,
        journey_stage: null,
        intent: ['medications', 'appointments', 'milestones', 'journal'],
        onboarding_step: 'ready',
      },
    ],
    medications,
    medication_logs,
    appointments: [
      {
        ...base,
        id: id(211),
        title: 'Top surgery consult',
        provider: 'Dr. Okafor',
        category: 'Surgery',
        starts_at: at(3, 14, 0),
        ends_at: at(3, 15, 0),
        location: 'Bayview Surgical Associates',
        notes: 'Ask about recovery time and binder after.',
        reminder_enabled: true,
      },
      {
        ...base,
        id: id(212),
        title: 'T levels lab draw',
        provider: null,
        category: 'Labs',
        starts_at: at(6, 7, 45),
        ends_at: null,
        location: 'Quest Diagnostics',
        notes: 'Midway between shots.',
        reminder_enabled: true,
      },
      {
        ...base,
        id: id(213),
        title: 'Check-in with Dr. Shah',
        provider: 'Dr. Shah',
        category: 'Primary care',
        starts_at: at(13, 10, 0),
        ends_at: at(13, 10, 30),
        location: 'Community Health Center',
        notes: null,
        reminder_enabled: true,
      },
    ],
    milestones: [
      {
        ...base,
        id: id(311),
        title: 'First T shot',
        description: 'Hands shaking, heart full.',
        date: isoDate(-300),
        category: 'First steps',
        icon: 'flag',
        image_path: null,
        image_paths: [],
      },
      {
        ...base,
        id: id(312),
        title: 'Did my own shot',
        description: 'No nurse, just me and a deep breath.',
        date: isoDate(-280),
        category: 'Achievement',
        icon: 'award',
        image_path: null,
        image_paths: [],
      },
      {
        ...base,
        id: id(313),
        title: 'Voice dropped',
        description: 'Answered the phone and Mom asked who this was.',
        date: isoDate(-150),
        category: 'Changes',
        icon: 'sparkles',
        image_path: null,
        image_paths: [],
      },
      {
        ...base,
        id: id(314),
        title: 'Name change approved',
        description: 'New license in my wallet.',
        date: isoDate(-40),
        category: 'Legal',
        icon: 'party-popper',
        image_path: null,
        image_paths: [],
      },
    ],
    euphoria_moments: [
      { ...base, id: id(611), text: 'Got called “sir” at the coffee shop.', created_at: at(-2, 9) },
      {
        ...base,
        id: id(612),
        text: 'Voice cracked low on the phone and I laughed out loud.',
        created_at: at(-15, 19),
      },
      {
        ...base,
        id: id(613),
        text: 'First swim in a binder-friendly shirt. Felt free.',
        created_at: at(-40, 16),
      },
    ],
    appointment_questions: [
      {
        ...base,
        id: id(661),
        appointment_id: null,
        question: 'How long is recovery before I can lift again?',
        asked: false,
      },
      {
        ...base,
        id: id(662),
        appointment_id: null,
        question: 'Should I stop T before surgery?',
        asked: false,
      },
      {
        ...base,
        id: id(663),
        appointment_id: null,
        question: 'What does aftercare with a binder look like?',
        asked: true,
      },
    ],
    supplies: [
      {
        ...base,
        id: id(711),
        name: 'Testosterone vial',
        medication_id: id(111),
        quantity: 2,
        unit: 'mL',
        per_dose: 0.25,
        refill_on: isoDate(24),
        pharmacy: 'Community Pharmacy',
        notes: '200 mg/mL',
      },
      {
        ...base,
        id: id(712),
        name: 'Syringes',
        medication_id: id(111),
        quantity: 3,
        unit: 'syringes',
        per_dose: 1,
        refill_on: null,
        pharmacy: null,
        notes: null,
      },
      {
        ...base,
        id: id(713),
        name: 'Alcohol swabs',
        medication_id: null,
        quantity: 40,
        unit: null,
        per_dose: null,
        refill_on: null,
        pharmacy: null,
        notes: null,
      },
    ],
    journal_entries: [
      {
        ...base,
        id: id(411),
        title: 'Sir',
        content:
          'The barista said "thanks, sir" without a second look. Grinned the whole walk home.',
        mood: 'Proud',
        date: isoDate(-2),
        tags: ['Self-care'],
        image_path: null,
        image_paths: [],
      },
      {
        ...base,
        id: id(412),
        title: null,
        content:
          'Shot day tomorrow. Laid out everything tonight so morning-me just has to show up.',
        mood: 'Peaceful',
        date: isoDate(-1),
        tags: ['HRT'],
        image_path: null,
        image_paths: [],
      },
      {
        ...base,
        id: id(413),
        title: 'Consult booked',
        content:
          'Top surgery consult is on the calendar. Writing my questions here so I remember them.',
        mood: 'Excited',
        date: isoDate(-9),
        tags: ['Appointment'],
        image_path: null,
        image_paths: [],
      },
    ],
  };
}
