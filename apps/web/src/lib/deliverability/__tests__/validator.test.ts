import { describe, it, expect } from 'vitest';
import { validateEmail } from '../validator';

describe('Two-Stage Email Validator', () => {
  it('should accept valid standard email addresses', async () => {
    const res = await validateEmail('editor@goalmills.com', { checkDns: false });
    expect(res.isValid).toBe(true);
    expect(res.isSendable).toBe(true);
    expect(res.emailNormalized).toBe('editor@goalmills.com');
  });

  it('should detect and suggest correction for common domain typos', async () => {
    const res = await validateEmail('sportsfan@gmial.com', { checkDns: false });
    expect(res.isValid).toBe(true);
    expect(res.hasTypo).toBe(true);
    expect(res.suggestedCorrection).toBe('sportsfan@gmail.com');
    expect(res.isSendable).toBe(false);
  });

  it('should reject known disposable/temporary email domains', async () => {
    const res = await validateEmail('throwaway@tempmail.com', { checkDns: false });
    expect(res.isDisposable).toBe(true);
    expect(res.isSendable).toBe(false);
  });

  it('should flag role-based addresses', async () => {
    const res = await validateEmail('admin@goalmills.com', { checkDns: false });
    expect(res.isRoleAccount).toBe(true);
  });

  it('should reject invalid syntax', async () => {
    const res = await validateEmail('not-an-email', { checkDns: false });
    expect(res.isValid).toBe(false);
    expect(res.isSendable).toBe(false);
  });
});
