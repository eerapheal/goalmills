import { BetToolsProvider } from '@goalmills/types';
import { getBetloyConfig } from './betloy/betloyConfig';
import { BetloyProvider } from './betloy/betloyAdapter';
import { MockBetToolsProvider } from './betloy/mockBetloyProvider';

let activeProviderInstance: BetToolsProvider | null = null;

/**
 * Returns the configured BetToolsProvider.
 * Falls back to MockBetToolsProvider in test/offline environments or when BETLOY_API_KEY is unset.
 */
export function getBetToolsProvider(): BetToolsProvider {
  if (activeProviderInstance) {
    return activeProviderInstance;
  }

  const config = getBetloyConfig();
  if (config.enabled && config.apiKey) {
    activeProviderInstance = new BetloyProvider();
  } else {
    activeProviderInstance = new MockBetToolsProvider();
  }

  return activeProviderInstance;
}

/**
 * Override provider for unit tests or mocked integration tests.
 */
export function setBetToolsProvider(provider: BetToolsProvider | null): void {
  activeProviderInstance = provider;
}
