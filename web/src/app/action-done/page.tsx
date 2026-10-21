import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ActionResult, ActionResultFallback } from './ActionResult';

export const metadata: Metadata = {
  title: 'Done · Resurface',
  robots: { index: false, follow: false },
};

/**
 * Public landing page for one-click email actions.
 * The backend's GET /v1/actions/:token redirects here with ?result=reviewed|snoozed|expired|error.
 */
export default function ActionDonePage() {
  return (
    <Suspense fallback={<ActionResultFallback />}>
      <ActionResult />
    </Suspense>
  );
}
