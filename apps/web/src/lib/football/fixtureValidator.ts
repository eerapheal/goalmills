import { NormalizedFixture, CanonicalCompetition } from '@goalmills/types';
import { CANONICAL_COMPETITIONS, getCanonicalCompetition } from './competitionRegistry';
import { UNRESOLVED_COMPETITION_ID } from './competitionResolver';

export interface FixtureValidationResult {
  isValid: boolean;
  isQuarantined: boolean;
  quarantineReason?: string;
  errors: string[];
  fixture: NormalizedFixture;
}

/**
 * 10-Rule Automated Validation & Quarantine Engine for GoalMills Football Platform.
 * Prevents contaminated or misclassified fixtures from entering production caches.
 */
export function validateFixture(fixture: NormalizedFixture): FixtureValidationResult {
  const errors: string[] = [];
  let isQuarantined = false;
  let quarantineReason: string | undefined;

  // Clone to maintain immutability
  const validatedFixture: NormalizedFixture = { ...fixture };

  // Rule 1: Competition Registered & Exists
  const comp: CanonicalCompetition | undefined =
    validatedFixture.competitionId && validatedFixture.competitionId !== UNRESOLVED_COMPETITION_ID
      ? CANONICAL_COMPETITIONS[validatedFixture.competitionId] ||
        getCanonicalCompetition(validatedFixture.competitionId)
      : undefined;

  if (!comp) {
    isQuarantined = true;
    quarantineReason = `Competition "${validatedFixture.competitionId}" is unmapped or not in canonical registry`;
    errors.push(quarantineReason);
    validatedFixture.competitionId = UNRESOLVED_COMPETITION_ID;
    validatedFixture.classificationStatus = 'UNRESOLVED';
  } else {
    // Rule 2: Competition Active
    if (comp.status !== 'ACTIVE') {
      isQuarantined = true;
      quarantineReason = `Competition "${comp.id}" status is ${comp.status}, not ACTIVE`;
      errors.push(quarantineReason);
      validatedFixture.competitionId = UNRESOLVED_COMPETITION_ID;
      validatedFixture.classificationStatus = 'QUARANTINED';
    }

    // Rule 3: Country Consistency (for domestic competitions)
    if (comp.isDomestic && comp.countryCode) {
      const fCountry = (validatedFixture.countryCode || '').toUpperCase();
      const compCountry = comp.countryCode.toUpperCase();
      // Allow GB-ENG to match UK / England codes if country matches
      const isCountryMatch =
        fCountry === compCountry ||
        (compCountry === 'GB-ENG' && (fCountry === 'GB' || fCountry === 'ENGLAND' || fCountry === 'UK'));

      if (!isCountryMatch) {
        isQuarantined = true;
        quarantineReason = `Country mismatch: fixture country "${fCountry}" does not match domestic league country "${compCountry}"`;
        errors.push(quarantineReason);
        validatedFixture.competitionId = UNRESOLVED_COMPETITION_ID;
        validatedFixture.classificationStatus = 'QUARANTINED';
      }
    }

    // Rule 4: Gender Consistency (Strict Firewall)
    if (comp.gender && comp.gender !== 'MIXED' && comp.gender !== 'UNKNOWN') {
      if (validatedFixture.gender && validatedFixture.gender !== comp.gender) {
        isQuarantined = true;
        quarantineReason = `Gender mismatch: fixture gender "${validatedFixture.gender}" contradicts competition gender "${comp.gender}"`;
        errors.push(quarantineReason);
        validatedFixture.competitionId = UNRESOLVED_COMPETITION_ID;
        validatedFixture.classificationStatus = 'QUARANTINED';
      }
    }

    // Rule 5: Age-Category Consistency (Senior vs Youth Firewall)
    if (comp.isSenior && validatedFixture.ageCategory !== 'SENIOR') {
      isQuarantined = true;
      quarantineReason = `Age mismatch: Youth fixture (${validatedFixture.ageCategory}) cannot be placed in Senior tournament "${comp.id}"`;
      errors.push(quarantineReason);
      validatedFixture.competitionId = UNRESOLVED_COMPETITION_ID;
      validatedFixture.classificationStatus = 'QUARANTINED';
    } else if (comp.isYouth && validatedFixture.ageCategory === 'SENIOR') {
      isQuarantined = true;
      quarantineReason = `Age mismatch: Senior fixture cannot be placed in Youth tournament "${comp.id}"`;
      errors.push(quarantineReason);
      validatedFixture.competitionId = UNRESOLVED_COMPETITION_ID;
      validatedFixture.classificationStatus = 'QUARANTINED';
    }
  }

  // Rule 6: Valid Home Team
  if (!validatedFixture.homeTeamName || validatedFixture.homeTeamName.trim() === '') {
    errors.push('Missing home team name');
    validatedFixture.homeTeamName = 'Home Team';
  }

  // Rule 7: Valid Away Team
  if (!validatedFixture.awayTeamName || validatedFixture.awayTeamName.trim() === '') {
    errors.push('Missing away team name');
    validatedFixture.awayTeamName = 'Away Team';
  }

  // Rule 8: Scheduled Date Valid
  const parsedDate = new Date(validatedFixture.scheduledAt);
  if (isNaN(parsedDate.getTime())) {
    errors.push(`Invalid scheduledAt timestamp: "${validatedFixture.scheduledAt}"`);
    validatedFixture.scheduledAt = new Date().toISOString();
  }

  // Rule 9: Valid Status
  if (!validatedFixture.status || validatedFixture.status.trim() === '') {
    validatedFixture.status = 'Scheduled';
  }

  // Rule 10: Fixture ID exists
  if (!validatedFixture.fixtureId) {
    validatedFixture.fixtureId = `gm-fix-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }

  return {
    isValid: errors.length === 0,
    isQuarantined,
    quarantineReason,
    errors,
    fixture: validatedFixture,
  };
}

/**
 * Batch validates fixtures and separates them into verified production fixtures vs quarantined fixtures.
 */
export function validateFixtures(fixtures: NormalizedFixture[]): {
  validFixtures: NormalizedFixture[];
  quarantinedFixtures: NormalizedFixture[];
  results: FixtureValidationResult[];
} {
  const validFixtures: NormalizedFixture[] = [];
  const quarantinedFixtures: NormalizedFixture[] = [];
  const results: FixtureValidationResult[] = [];

  for (const f of fixtures) {
    const res = validateFixture(f);
    results.push(res);
    if (res.isQuarantined) {
      quarantinedFixtures.push(res.fixture);
    } else {
      validFixtures.push(res.fixture);
    }
  }

  return { validFixtures, quarantinedFixtures, results };
}
