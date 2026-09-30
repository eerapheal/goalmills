import { BookmakerMarketEntry } from './oddsComparisonEngine';

export type BookmakerSortOption = 'BEST_ODDS' | 'FEATURED' | 'PAYOUT' | 'ALPHABETICAL';

export interface CommercialDisclosure {
  title: string;
  body: string;
  responsibleGamblingText: string;
  helplineUrl: string;
}

export const DEFAULT_COMMERCIAL_DISCLOSURE: CommercialDisclosure = {
  title: 'Commercial Notice & Responsible Gambling',
  body: 'GoalMills receives advertising compensation from featured bookmaker partners. This commercial relationship may influence the prominence of bookmaker listings, but does not affect the calculation of actual odds or objective best odds.',
  responsibleGamblingText: '18+ Only. Please gamble responsibly. Odds are dynamic and subject to change.',
  helplineUrl: 'https://www.begambleaware.org',
};

/**
 * Sorts bookmaker market entries according to user preference or default business logic.
 * Ensures that commercial prominence is transparently badged and never alters odds values.
 */
export function sortBookmakerEntries(
  entries: BookmakerMarketEntry[],
  sortOption: BookmakerSortOption = 'BEST_ODDS',
  activeOutcome?: string
): BookmakerMarketEntry[] {
  const cloned = [...entries];

  switch (sortOption) {
    case 'BEST_ODDS':
      return cloned.sort((a, b) => {
        // If a specific outcome is active (e.g. Home win), sort by that outcome's price descending
        if (activeOutcome) {
          const priceA = a.outcomes[activeOutcome]?.price || 0;
          const priceB = b.outcomes[activeOutcome]?.price || 0;
          if (priceB !== priceA) return priceB - priceA;
        }

        // Otherwise sort by highest best-odds count or max price
        const bestCountA = Object.values(a.outcomes).filter((o) => o.isBest).length;
        const bestCountB = Object.values(b.outcomes).filter((o) => o.isBest).length;
        if (bestCountB !== bestCountA) return bestCountB - bestCountA;

        // Fallback to highest payout
        return (b.payoutPercent || 0) - (a.payoutPercent || 0);
      });

    case 'FEATURED':
      return cloned.sort((a, b) => {
        // Pinned featured partners first
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;

        // Within same tier, sort by payout
        return (b.payoutPercent || 0) - (a.payoutPercent || 0);
      });

    case 'PAYOUT':
      return cloned.sort((a, b) => (b.payoutPercent || 0) - (a.payoutPercent || 0));

    case 'ALPHABETICAL':
      return cloned.sort((a, b) => a.bookmakerName.localeCompare(b.bookmakerName));

    default:
      return cloned;
  }
}
