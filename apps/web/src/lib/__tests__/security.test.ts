import { describe, it, expect } from 'vitest';
import {
  escapeRegex,
  isValidObjectId,
  sanitizeHtml,
  sanitizeObject,
} from '../security';

describe('Security & Injection Prevention Suite', () => {
  describe('escapeRegex', () => {
    it('should escape regex metacharacters to prevent ReDoS and wildcard exploits', () => {
      const malicious = '.*+?^${}()|[]\\test';
      const escaped = escapeRegex(malicious);
      expect(escaped).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\test');
    });

    it('should handle empty or non-string inputs safely', () => {
      expect(escapeRegex('')).toBe('');
      expect(escapeRegex(null as any)).toBe('');
    });
  });

  describe('isValidObjectId', () => {
    it('should validate 24-character hexadecimal MongoDB ObjectIds', () => {
      expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
      expect(isValidObjectId('64f1a2b3c4d5e6f7a8b9c0d1')).toBe(true);
    });

    it('should reject invalid, short, or injected ObjectIds', () => {
      expect(isValidObjectId('not-an-object-id')).toBe(false);
      expect(isValidObjectId('507f1f77bcf86cd79943901')).toBe(false); // 23 chars
      expect(isValidObjectId('507f1f77bcf86cd7994390111')).toBe(false); // 25 chars
      expect(isValidObjectId('{"$gt": ""}')).toBe(false);
      expect(isValidObjectId(null)).toBe(false);
    });
  });

  describe('sanitizeHtml', () => {
    it('should strip script tags and iframe injection vectors', () => {
      const dirty = '<p>Hello</p><script>alert("xss")</script><iframe src="evil.com"></iframe>';
      const clean = sanitizeHtml(dirty);
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('alert("xss")');
      expect(clean).not.toContain('<iframe');
    });

    it('should strip inline javascript and event handler attributes', () => {
      const dirty = '<button onclick="exploit()">Click</button><a href="javascript:void(0)">Link</a>';
      const clean = sanitizeHtml(dirty);
      expect(clean).not.toContain('onclick=');
      expect(clean).not.toContain('javascript:');
    });
  });

  describe('sanitizeObject (NoSQL Injection Mitigation)', () => {
    it('should strip MongoDB operator keys ($where, $gt, $ne, $regex) from payload', () => {
      const maliciousPayload = {
        username: 'admin',
        password: { $ne: null },
        filter: { $where: 'this.password.length > 0' },
        normalField: 'goalmills',
      };

      const sanitized = sanitizeObject(maliciousPayload);
      expect(sanitized.username).toBe('admin');
      expect(sanitized.normalField).toBe('goalmills');
      expect(sanitized.password).toEqual({});
      expect(sanitized.filter).toEqual({});
    });

    it('should strip dot notation path injection keys', () => {
      const maliciousPayload = {
        'profile.role': 'admin',
        'account.isSuperAdmin': true,
        displayName: 'John Doe',
      };

      const sanitized = sanitizeObject(maliciousPayload);
      expect(sanitized.displayName).toBe('John Doe');
      expect(sanitized['profile.role']).toBeUndefined();
      expect(sanitized['account.isSuperAdmin']).toBeUndefined();
    });

    it('should recursively sanitize nested arrays and objects', () => {
      const nested = [
        { name: 'item1', query: { $gt: 10 } },
        { name: 'item2', query: { safe: 'value' } },
      ];

      const sanitized = sanitizeObject(nested);
      expect(sanitized[0].name).toBe('item1');
      expect(sanitized[0].query).toEqual({});
      expect(sanitized[1].query).toEqual({ safe: 'value' });
    });
  });
});
