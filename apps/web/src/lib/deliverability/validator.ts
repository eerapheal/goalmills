import dns from 'dns';
import { promisify } from 'util';
import type { EmailValidationResult } from '@goalmills/types';

const resolveMx = promisify(dns.resolveMx);

// 1. Blacklist of known disposable/temporary email domains
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com',
  '10minutemail.com',
  'mailinator.com',
  'guerrillamail.com',
  'sharklasers.com',
  'throwawaymail.com',
  'yopmail.com',
  'trashmail.com',
  'getairmail.com',
  'dispostable.com',
  'temp-mail.org',
  'fakemailgenerator.com',
  'mohmal.com',
  'burnermail.io',
  'crazymailing.com',
  'emailondeck.com',
  'tempmailaddress.com',
  'mytemp.email',
  'generator.email',
]);

// 2. Role-based prefix accounts (low individual engagement)
const ROLE_BASED_PREFIXES = new Set([
  'admin',
  'administrator',
  'webmaster',
  'hostmaster',
  'postmaster',
  'support',
  'help',
  'info',
  'sales',
  'billing',
  'contact',
  'marketing',
  'jobs',
  'careers',
  'hr',
  'office',
  'legal',
  'press',
  'media',
  'security',
  'compliance',
  'abuse',
  'noc',
  'root',
]);

// 3. Typo dictionary for popular mail provider domains
const TYPO_MAP: Record<string, string> = {
  'gmial.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmaii.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmaul.com': 'gmail.com',
  'gmaill.co': 'gmail.com',
  'gmail.co': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yaho.co': 'yahoo.com',
  'yhaoo.com': 'yahoo.com',
  'ymail.co': 'ymail.com',
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'hotmial.co': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'outlock.com': 'outlook.com',
  'outloook.com': 'outlook.com',
  'iclou.com': 'icloud.com',
  'icoud.com': 'icloud.com',
  'icould.com': 'icloud.com',
};

// RFC 5322 standard compliant regex
const RFC_EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validates an email address against syntax, MX records, disposable domains,
 * role accounts, and detects common domain typos.
 */
export async function validateEmail(
  rawEmail: string,
  options: { checkDns?: boolean } = { checkDns: true }
): Promise<EmailValidationResult> {
  if (!rawEmail || typeof rawEmail !== 'string') {
    return {
      isValid: false,
      isSendable: false,
      emailNormalized: '',
      domain: '',
      isDisposable: false,
      isRoleAccount: false,
      hasMxRecord: false,
      hasTypo: false,
      reason: 'Empty or non-string email provided',
    };
  }

  const normalized = rawEmail.trim().toLowerCase();

  // 1. Syntax Check
  if (!RFC_EMAIL_REGEX.test(normalized)) {
    return {
      isValid: false,
      isSendable: false,
      emailNormalized: normalized,
      domain: '',
      isDisposable: false,
      isRoleAccount: false,
      hasMxRecord: false,
      hasTypo: false,
      reason: 'Invalid email syntax (RFC 5322 violation)',
    };
  }

  const parts = normalized.split('@');
  if (parts.length !== 2) {
    return {
      isValid: false,
      isSendable: false,
      emailNormalized: normalized,
      domain: '',
      isDisposable: false,
      isRoleAccount: false,
      hasMxRecord: false,
      hasTypo: false,
      reason: 'Email must contain exactly one @ symbol',
    };
  }

  const [localPart, domain] = parts;

  // 2. Typo Detection
  let hasTypo = false;
  let suggestedCorrection: string | undefined;
  if (TYPO_MAP[domain]) {
    hasTypo = true;
    suggestedCorrection = `${localPart}@${TYPO_MAP[domain]}`;
  }

  // 3. Disposable Domain Blacklist
  const isDisposable = DISPOSABLE_DOMAINS.has(domain);

  // 4. Role Account Detection
  const isRoleAccount = ROLE_BASED_PREFIXES.has(localPart);

  // 5. DNS MX Check (optional/safe)
  let hasMxRecord = true;
  if (options.checkDns && !isDisposable && process.env.NODE_ENV !== 'test') {
    try {
      const mxRecords = await Promise.race([
        resolveMx(domain),
        new Promise<dns.MxRecord[]>((_, reject) =>
          setTimeout(() => reject(new Error('DNS Timeout')), 1500)
        ),
      ]);
      hasMxRecord = Array.isArray(mxRecords) && mxRecords.length > 0;
    } catch (dnsErr) {
      // If DNS resolution fails, domain likely doesn't have a mail exchange
      hasMxRecord = false;
    }
  }

  const isSendable = !isDisposable && hasMxRecord && !hasTypo;

  let reason: string | undefined;
  if (isDisposable) reason = 'Disposable/temporary email domains are blocked';
  else if (hasTypo) reason = `Did you mean ${suggestedCorrection}?`;
  else if (!hasMxRecord) reason = 'Domain does not have valid mail exchange (MX) records';

  return {
    isValid: true,
    isSendable,
    emailNormalized: normalized,
    domain,
    isDisposable,
    isRoleAccount,
    hasMxRecord,
    hasTypo,
    suggestedCorrection,
    reason,
  };
}
