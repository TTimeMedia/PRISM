import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '../supabase/client';

/**
 * Support requests (Screen 66). Contact support, Report a problem and
 * Privacy concern are in-app forms: each request is saved to
 * `support_requests` and emailed to the support address by the
 * `submit-support` Edge Function, with Reply-To set to the sender's account
 * email, so support answers by replying. The address is the one published on
 * the Prism page (docs/website/prism.html) and is still shown for people who
 * would rather write directly.
 */
export const SUPPORT_EMAIL = 'support@ttimemedia.org';

export type SupportKind = 'contact' | 'problem' | 'privacy';

export const SUPPORT_KINDS: Record<
  SupportKind,
  { title: string; intro: string; placeholder: string; sent: string }
> = {
  contact: {
    title: 'Contact support',
    intro: 'Ask anything about Prism. We reply by email, usually within two working days.',
    placeholder: 'How can we help?',
    sent: "Sent. We'll reply to the email on your account.",
  },
  problem: {
    title: 'Report a problem',
    intro:
      "Tell us what happened and what you expected. Please leave out details about your medications or health; we don't need them to fix things.",
    placeholder: 'What happened?',
    sent: 'Thanks. Your report reached us, and we may email you about it.',
  },
  privacy: {
    title: 'Privacy concern',
    intro:
      'Questions or worries about your data, or a request about it. Privacy messages are read first.',
    placeholder: 'What would you like us to know?',
    sent: "Sent. We'll reply to the email on your account.",
  },
};

export const MAX_SUPPORT_MESSAGE = 5000;

export function isSupportKind(value: unknown): value is SupportKind {
  return value === 'contact' || value === 'problem' || value === 'privacy';
}

export interface SupportRequestInput {
  userId: string;
  kind: SupportKind;
  message: string;
  /** The screen it was sent about, e.g. "/care/medications". */
  screen?: string | null;
  /** A local screenshot file to attach, only when the person chose to. */
  screenshotUri?: string | null;
}

/**
 * Sends a request. Resolves when it's saved; `emailed` is false if saving
 * worked but the email to support didn't (it is still in the table).
 * A screenshot that can't be uploaded never stops the report: it is sent
 * without one, and `screenshotDropped` says so.
 */
export async function submitSupportRequest(
  input: SupportRequestInput,
): Promise<{ emailed: boolean; screenshotDropped: boolean }> {
  let screenshotPath: string | null = null;
  let screenshotDropped = false;
  if (input.screenshotUri) {
    try {
      screenshotPath = await uploadScreenshot(input.userId, input.screenshotUri);
    } catch {
      screenshotDropped = true;
    }
  }
  const { data, error } = await supabase.functions.invoke<{ emailed: boolean }>('submit-support', {
    body: {
      kind: input.kind,
      message: input.message.trim(),
      screen: input.screen ?? null,
      appVersion: Constants.expoConfig?.version ?? 'unknown',
      platform: Platform.OS,
      osVersion: String(Platform.Version),
      screenshotPath,
    },
  });
  if (error) throw error;
  return { emailed: !!data?.emailed, screenshotDropped };
}

/**
 * The screenshot library returns a bare path on iOS ("/private/var/…/x.jpg").
 * `<Image>` shows that fine, but `fetch` can only read it as a file:// URI.
 */
export function toFileUri(uri: string): string {
  return uri.startsWith('/') ? `file://${uri}` : uri;
}

/** Screenshots go in the private `attachments` bucket, so deleting the account removes them. */
async function uploadScreenshot(userId: string, uri: string): Promise<string> {
  const response = await fetch(toFileUri(uri));
  const arrayBuffer = await response.arrayBuffer();
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const path = `${userId}/support/${unique}.jpg`;
  const { error } = await supabase.storage
    .from('attachments')
    .upload(path, arrayBuffer, { contentType: 'image/jpeg' });
  if (error) throw error;
  return path;
}
