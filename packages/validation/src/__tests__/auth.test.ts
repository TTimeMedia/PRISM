import { describe, expect, it } from 'vitest';
import { forgotPasswordSchema, resetPasswordSchema, signInSchema, signUpSchema } from '../auth';

describe('signUpSchema', () => {
  it('accepts a valid email and matching passwords', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: 'longenough',
      confirmPassword: 'longenough',
    });
    expect(result.success).toBe(true);
  });

  it('rejects mismatched passwords, flagging confirmPassword', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: 'longenough',
      confirmPassword: 'different',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['confirmPassword']);
    }
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: 'short1',
      confirmPassword: 'short1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a malformed email', () => {
    const result = signUpSchema.safeParse({
      email: 'not-an-email',
      password: 'longenough',
      confirmPassword: 'longenough',
    });
    expect(result.success).toBe(false);
  });
});

describe('signInSchema', () => {
  it('accepts any non-empty password (server enforces strength at sign-up, not sign-in)', () => {
    const result = signInSchema.safeParse({ email: 'user@example.com', password: 'x' });
    expect(result.success).toBe(true);
  });

  it('rejects an empty password', () => {
    const result = signInSchema.safeParse({ email: 'user@example.com', password: '' });
    expect(result.success).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  it('accepts a valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'user@example.com' }).success).toBe(true);
  });

  it('rejects an empty email', () => {
    expect(forgotPasswordSchema.safeParse({ email: '' }).success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('accepts matching passwords at the minimum length', () => {
    const result = resetPasswordSchema.safeParse({
      password: '12345678',
      confirmPassword: '12345678',
    });
    expect(result.success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const result = resetPasswordSchema.safeParse({
      password: '12345678',
      confirmPassword: '87654321',
    });
    expect(result.success).toBe(false);
  });
});
