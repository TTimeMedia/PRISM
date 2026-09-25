import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  BUILT_IN_MESSAGES,
  MAX_CUSTOM_MESSAGES,
  MAX_MESSAGE_LENGTH,
  SAMPLE_VARS,
  messageOptions,
  reminderKindForMedication,
  renderMessage,
  renderReminder,
  resolveReminderMessages,
  selectedMessage,
} from '../reminderMessages';

describe('renderMessage', () => {
  it('fills in the placeholders', () => {
    expect(
      renderMessage('Take your {name} at {time}.', { name: 'Estradiol', time: '9:00 AM' }),
    ).toBe('Take your Estradiol at 9:00 AM.');
  });

  it('leaves no gap when a value is missing', () => {
    expect(renderMessage('Take {name} {dose}.', { name: 'Estradiol' })).toBe('Take Estradiol.');
    expect(renderMessage('{name} is coming up {when}.', { name: 'Lab work' })).toBe(
      'Lab work is coming up.',
    );
  });

  it('leaves text without placeholders alone', () => {
    expect(renderMessage("It's shot day.", {})).toBe("It's shot day.");
  });
});

describe('the built-in messages', () => {
  it('render to something for every kind with sample values', () => {
    for (const kind of Object.keys(BUILT_IN_MESSAGES) as (keyof typeof BUILT_IN_MESSAGES)[]) {
      for (const option of BUILT_IN_MESSAGES[kind]) {
        const text = renderMessage(option.text, SAMPLE_VARS[kind]);
        expect(text.length).toBeGreaterThan(3);
        expect(text).not.toContain('{');
      }
    }
  });

  it('have unique ids within a kind', () => {
    for (const options of Object.values(BUILT_IN_MESSAGES)) {
      const ids = options.map((option) => option.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe('choosing a version', () => {
  it('uses the first built-in one until something is chosen', () => {
    expect(selectedMessage('injection', {}).id).toBe('shot-day');
    expect(renderReminder('injection', {}, {}).body).toBe("It's shot day.");
  });

  it('uses the chosen built-in version', () => {
    const messages = resolveReminderMessages({ medication: { selected: 'time-for' } });
    expect(renderReminder('medication', { name: 'Estradiol' }, messages).body).toBe(
      "It's time for your Estradiol.",
    );
  });

  it("uses the person's own version", () => {
    const messages = resolveReminderMessages({
      medication: {
        selected: 'mine',
        custom: [{ id: 'mine', text: 'Meds time, {name} at {time}!' }],
      },
    });
    expect(messageOptions('medication', messages).at(-1)?.id).toBe('mine');
    expect(renderReminder('medication', { name: 'T', time: '8 PM' }, messages)).toEqual({
      title: 'Prism',
      body: 'Meds time, T at 8 PM!',
    });
  });

  it('falls back to the first version if the chosen one was deleted', () => {
    const messages = resolveReminderMessages({ medication: { selected: 'gone' } });
    expect(selectedMessage('medication', messages).id).toBe('take-at');
  });
});

describe('resolveReminderMessages', () => {
  it('gives nothing for junk', () => {
    expect(resolveReminderMessages(null)).toEqual({});
    expect(resolveReminderMessages('x')).toEqual({});
    expect(resolveReminderMessages({ other: { selected: 'a' } })).toEqual({});
  });

  it('drops blank messages and caps how many and how long', () => {
    const custom = Array.from({ length: 8 }, (_, i) => ({ id: `c${i}`, text: `Message ${i}` }));
    custom.push({ id: 'blank', text: '   ' });
    custom[0] = { id: 'long', text: 'x'.repeat(500) };
    const result = resolveReminderMessages({ medication: { custom } });
    expect(result.medication?.custom).toHaveLength(MAX_CUSTOM_MESSAGES);
    expect(result.medication?.custom?.[0]?.text).toHaveLength(MAX_MESSAGE_LENGTH);
  });
});

describe('reminderKindForMedication', () => {
  it('treats injections as shot day and everything else as a medication', () => {
    expect(reminderKindForMedication('injection')).toBe('injection');
    expect(reminderKindForMedication('pill')).toBe('medication');
    expect(reminderKindForMedication(null)).toBe('medication');
  });
});

describe('the server copy', () => {
  it('is identical, so the server and the app word reminders the same way', () => {
    const app = readFileSync(resolve(__dirname, '../reminderMessages.ts'), 'utf8');
    const server = readFileSync(
      resolve(__dirname, '../../../../supabase/functions/_shared/reminderMessages.ts'),
      'utf8',
    );
    expect(server.replace(/\r\n/g, '\n')).toBe(app.replace(/\r\n/g, '\n'));
  });
});
