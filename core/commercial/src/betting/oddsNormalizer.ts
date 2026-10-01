/**
 * GoalMills Odds Normalizer & Margin Engine
 * Pure math and formatting domain utilities.
 */

export type OddsFormat = 'DECIMAL' | 'FRACTIONAL' | 'AMERICAN';

export interface NormalizedOdds {
  decimal: number;
  fractional: string;
  american: string;
  impliedProbability: number; // 0 to 1
}

export function normalizeDecimalOdds(decimal: number): NormalizedOdds {
  const dec = Math.max(1.01, Number(decimal.toFixed(2)));
  const impliedProbability = Number((1 / dec).toFixed(4));

  // Convert to American
  let american: string;
  if (dec >= 2.0) {
    american = `+${Math.round((dec - 1) * 100)}`;
  } else {
    american = `-${Math.round(100 / (dec - 1))}`;
  }

  // Convert to Fractional (approximate common fractions)
  const fractional = decimalToFraction(dec - 1);

  return {
    decimal: dec,
    fractional,
    american,
    impliedProbability,
  };
}

/**
 * Calculates bookmaker margin (overround) on a market set
 * e.g. for 1X2 market [1.80, 3.50, 4.20]
 */
export function calculateBookmakerMargin(odds: number[]): number {
  if (!odds || odds.length === 0) return 0;
  const sumProbabilities = odds.reduce((acc, odd) => {
    if (odd <= 1) return acc;
    return acc + 1 / odd;
  }, 0);
  const marginPercentage = (sumProbabilities - 1) * 100;
  return Number(marginPercentage.toFixed(2));
}

function decimalToFraction(decimal: number): string {
  const tolerance = 1.0e-4;
  let h1 = 1;
  let h2 = 0;
  let k1 = 0;
  let k2 = 1;
  let b = decimal;
  do {
    const a = Math.floor(b);
    let aux = h1;
    h1 = a * h1 + h2;
    h2 = aux;
    aux = k1;
    k1 = a * k1 + k2;
    k2 = aux;
    b = 1 / (b - a);
  } while (Math.abs(decimal - h1 / k1) > decimal * tolerance);

  return `${h1}/${k1}`;
}
