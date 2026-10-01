import { BetSlipLeg, BetSlipEditRequest, BetSlipEditResult } from '@goalmills/types';

/**
 * Service to manage and recalculate modified accumulator slips in the Bet Editor.
 */
export function recalculateBetSlip(request: BetSlipEditRequest): BetSlipEditResult {
  const legs = request.legs || [];
  const stake = request.stake || 10;

  if (legs.length === 0) {
    return {
      totalOdds: 1.0,
      legCount: 0,
      legs: [],
      potentialPayout: stake,
      oddsDeltaPercent: 0,
      estimatedWinProbability: 100,
    };
  }

  // Calculate product of decimal odds
  let totalOdds = 1.0;
  let estimatedProbabilityProduct = 1.0;

  for (const leg of legs) {
    const odd = leg.selection?.odds || 1.0;
    totalOdds *= odd;

    // Estimate probability if available, otherwise implied probability (1 / odd * 0.95 margin)
    const prob = leg.selection?.probability ?? (1 / Math.max(1.01, odd)) * 0.93;
    estimatedProbabilityProduct *= Math.min(0.99, Math.max(0.01, prob));
  }

  totalOdds = parseFloat(totalOdds.toFixed(2));
  const potentialPayout = parseFloat((stake * totalOdds).toFixed(2));
  const estimatedWinProbability = parseFloat((estimatedProbabilityProduct * 100).toFixed(1));

  return {
    totalOdds,
    legCount: legs.length,
    legs,
    potentialPayout,
    oddsDeltaPercent: 0,
    estimatedWinProbability,
  };
}

/**
 * Removes a leg from the slip and recalculates totals.
 */
export function removeLegFromSlip(legs: BetSlipLeg[], legIdToRemove: string): BetSlipLeg[] {
  return legs.filter((l) => l.id !== legIdToRemove);
}

/**
 * Updates a leg's selection and odds.
 */
export function updateLegSelection(
  legs: BetSlipLeg[],
  legId: string,
  newSelection: { market: string; selection: string; odds: number; probability?: number }
): BetSlipLeg[] {
  return legs.map((leg) => {
    if (leg.id === legId) {
      return {
        ...leg,
        selection: {
          ...leg.selection,
          ...newSelection,
        },
      };
    }
    return leg;
  });
}
