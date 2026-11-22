-- Phase 2: READ ONLY reconciliation checks.
-- Run against STAGING only first. Does not expose user email or names.
-- Requires reviewing all nonzero counts before enabling entitlement gating.

-- 1) Subscription rows lacking exact transaction evidence.
SELECT p."planType" AS plan_type, s.status, COUNT(*) AS subscriptions_missing_payment_link
FROM public.user_subscriptions s
JOIN public.subscription_plans p ON p.id = s."planId"
WHERE s.status IN ('active', 'cancelling')
  AND (
    s."gatewaySubscriptionId" IS NULL
    OR (
      p."planType" = 'lifetime'
      AND (
        s."gatewaySubscriptionId" NOT LIKE 'lifetime:%'
        OR NOT EXISTS (
          SELECT 1 FROM public.transactions t
          WHERE t.id::text = SUBSTRING(s."gatewaySubscriptionId" FROM 10)
            AND t."userId" = s."userId"
            AND t."planId" = s."planId"
            AND t.status IN ('success', 'trialing')
        )
      )
    )
    OR (
      p."planType" IN ('monthly','annual')
      AND NOT EXISTS (
        SELECT 1 FROM public.transactions t
        WHERE t."gatewaySubscriptionId" = s."gatewaySubscriptionId"
          AND t."userId" = s."userId"
          AND t."planId" = s."planId"
          AND t.status IN ('success','trialing')
      )
    )
  )
GROUP BY p."planType", s.status
ORDER BY p."planType", s.status;

-- 2) Paid transactions missing Stripe payment-intent linkage.
SELECT t."planType", COUNT(*) AS paid_without_intent_reference
FROM public.transactions t
WHERE t."paymentGateway" = 'stripe'
  AND t.status = 'success'
  AND COALESCE(t.metadata->>'stripePaymentIntentId',
               t.metadata->>'chargePaymentIntentId','') = ''
GROUP BY t."planType";

-- 3) Lifetime trial charges in PROCESSING longer than two hours.
SELECT COUNT(*) AS stuck_lifetime_processing
FROM public.transactions
WHERE "planType" = 'lifetime'
  AND status = 'processing'
  AND "updatedAt" < NOW() - INTERVAL '2 hours';

-- 4) Subscription status/dates that need Stripe reconciliation.
SELECT status, COUNT(*) AS count_past_end
FROM public.user_subscriptions
WHERE status IN ('active','cancelling')
  AND "endDate" IS NOT NULL AND "endDate" <= NOW()
GROUP BY status;

-- 5) Successfully paid invoices attached to still-FAILED subscriptions.
SELECT COUNT(DISTINCT s.id) AS paid_retry_not_recovered
FROM public.user_subscriptions s
JOIN public.transactions t
  ON t."gatewaySubscriptionId" = s."gatewaySubscriptionId"
 AND t."userId" = s."userId"
WHERE s.status = 'failed' AND t.status = 'success'
  AND t."transactionType" = 'renewal'
  AND t."paidAt" >= COALESCE(s."updatedAt" - INTERVAL '30 days',
                             TIMESTAMP '2000-01-01');
