import { createMockApi } from '../mock/adapter.ts';
import type { SecondShelfApi } from './types.ts';

export * from './types.ts';

/**
 * Screens import `api` from here and nothing else.
 *
 * VITE_DEMO_MODE (default "true") selects the demo adapter in src/lib/mock.
 * To use a real backend, write an adapter that implements SecondShelfApi
 * and return it below when the flag is "false". No screen changes needed.
 */
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';

function createApi(): SecondShelfApi {
  if (!DEMO_MODE) {
    console.warn('VITE_DEMO_MODE=false but no live adapter is wired in yet. Using demo data.');
  }
  return createMockApi();
}

export const api: SecondShelfApi = createApi();
