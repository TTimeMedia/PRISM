/**
 * Support contact for Screen 66. The address is the one published on the
 * Prism page (docs/website/prism.html). The draft email carries only what
 * helps triage (topic, app version, platform), never anything about the
 * person's care, so opening it can't leak health data to a mail provider.
 */
export const SUPPORT_EMAIL = 'support@ttimemedia.org';

export type SupportTopic = 'contact' | 'problem' | 'privacy';

const SUBJECTS: Record<SupportTopic, string> = {
  contact: 'Prism support',
  problem: 'Prism problem report',
  privacy: 'Prism privacy concern',
};

const PROMPTS: Record<SupportTopic, string> = {
  contact: 'How can we help?',
  problem:
    'What happened, and what did you expect to happen? Please leave out anything about your medications or health.',
  privacy: 'What would you like us to know?',
};

export interface SupportDevice {
  appVersion: string;
  platform: string;
  osVersion: string | number;
}

export function supportMailto(topic: SupportTopic, device: SupportDevice): string {
  const body = [
    PROMPTS[topic],
    '',
    '',
    '---',
    `Prism ${device.appVersion} · ${device.platform} ${device.osVersion}`,
  ].join('\n');
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(SUBJECTS[topic])}&body=${encodeURIComponent(body)}`;
}
