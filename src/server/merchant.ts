import { randomUUID } from 'node:crypto';
import { ApiError } from '../lib/api/types.ts';
import { bank, DISTRIBUTOR_ACCOUNT } from './bank/index.ts';
import { kvGet, kvSet } from './db.ts';

/**
 * Ade Foods as a collections merchant, so buyers pay Ade Foods (not a
 * stand-in merchant). Onboarded once with POST /merchants/onboard; the
 * sandbox activates it 60 seconds later (merchant.activated).
 * BANK_MERCHANT_ID pins the id across pod restarts.
 */

export function merchantId(): string {
  const pinned = process.env.BANK_MERCHANT_ID;
  if (pinned) return pinned;
  if (bank.mode === 'mock') return 'mer_mock';
  const id = kvGet('merchant_id');
  const liveAfter = kvGet('merchant_live_after');
  const active = kvGet('merchant_active') === '1' || (!!liveAfter && Date.now() > new Date(liveAfter).getTime());
  if (id && active) return id;
  throw new ApiError(id ? 'Ade Foods merchant is activating. Try again in a minute.' : 'Merchant not set up yet.');
}

export async function onboardMerchant() {
  if (process.env.BANK_MERCHANT_ID) return { merchantId: process.env.BANK_MERCHANT_ID, status: 'pinned' };
  const existing = kvGet('merchant_id');
  if (existing) return { merchantId: existing, status: kvGet('merchant_active') === '1' ? 'active' : 'under_review', liveAfter: kvGet('merchant_live_after') };
  let idem = kvGet('merchant_idem');
  if (!idem) {
    idem = randomUUID();
    kvSet('merchant_idem', idem);
  }
  const m = await bank.onboardMerchant(
    {
      businessName: 'Ade Foods',
      rcNumber: 'RC 7704512',
      businessType: 'limited_liability',
      tin: '41029837-0001',
      category: 'retail',
      address: { line1: '14 Agege Motor Road', city: 'Mushin', state: 'Lagos' },
      directors: [{ name: 'Babatunde Olumide Adeyemi', bvn: '22200000002' }],
      settlementAccount: DISTRIBUTOR_ACCOUNT,
      contactEmail: 'ade@adefoods.example.ng',
    },
    idem,
  );
  kvSet('merchant_id', m.merchantId);
  if (m.liveAfter) kvSet('merchant_live_after', m.liveAfter);
  if (m.status === 'active') kvSet('merchant_active', '1');
  console.log(`[merchant] onboarded ${m.merchantId} (${m.status})`);
  return m;
}

export function onMerchantEvent(type: string, data: Record<string, any>) {
  if (type === 'merchant.activated' && (!data?.merchant_id || data.merchant_id === kvGet('merchant_id'))) {
    kvSet('merchant_active', '1');
    console.log('[merchant] activated');
  }
}
