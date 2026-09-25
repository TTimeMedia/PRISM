import { resolvePushPreferences } from '../pushToken';

jest.mock('expo-constants', () => ({ __esModule: true, default: { expoConfig: {} } }));
jest.mock('expo-notifications', () => ({}));
jest.mock('../../supabase/client', () => ({ supabase: {} }));

describe('resolvePushPreferences', () => {
  it('gives the defaults when nothing has been chosen', () => {
    expect(resolvePushPreferences(undefined)).toEqual({
      security: true,
      updates: false,
      nudges: false,
      reminders: false,
    });
  });

  it('keeps what was chosen and fills in the rest', () => {
    expect(resolvePushPreferences({ updates: true, security: false })).toEqual({
      security: false,
      updates: true,
      nudges: false,
      reminders: false,
    });
  });

  it('ignores values that are not on or off', () => {
    expect(resolvePushPreferences({ security: 'yes', nudges: 1, reminders: true }).security).toBe(
      true,
    );
    expect(resolvePushPreferences({ nudges: 1 }).nudges).toBe(false);
    expect(resolvePushPreferences('junk').reminders).toBe(false);
  });
});
