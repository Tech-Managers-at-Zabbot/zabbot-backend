/**
 * Phase 2 subscription entitlement policy.
 *
 * Pure calculation only: DOES NOT alter records or enforce access on routes.
 * Caller must load all of the user's subscription rows, associated plan types,
 * and payment evidence from trusted server-side database records.
 *
 * Never rely on "active" status alone for lifetime access: Zabbot creates an
 * active lifetime subscription before collecting the delayed trial payment.
 *
 * During a lifetime trial we require both an unexpired trialEndsAt and a
 * matching TRIALING transaction. A completed lifetime purchase requires a
 * successful payment transaction for that plan, and no active trial marker.
 * Further reconciliation of refunds/disputes belongs in the billing audit
 * before enabling enforcement.
 */

export type SubscriptionPlanKind = "monthly" | "annual" | "lifetime";
export type StoredSubscriptionStatus =
  | "active"
  | "cancelling"
  | "cancelled"
  | "expired"
  | "paused"
  | "failed";

export interface EntitlementSubscription {
  id: string;
  planId: string;
  status: StoredSubscriptionStatus;
  startDate: Date | string;
  endDate?: Date | string | null;
  trialEndsAt?: Date | string | null;
}

export interface EntitlementPaymentEvidence {
  planId: string | null;
  status: "success" | "trialing" | "pending" | "processing" |
    "failed" | "refunded" | "cancelled";
  /** Optional gateway identifier; evidence must belong to current user. */
  subscriptionId?: string | null;
}

export type EntitlementReason =
  | "lifetime_paid"
  | "lifetime_trial"
  | "recurring_period"
  | "no_entitlement";

export interface EntitlementDecision {
  hasAccess: boolean;
  reason: EntitlementReason;
  planType: SubscriptionPlanKind | null;
  accessUntil: string | null;
}

const NO_ACCESS: EntitlementDecision = {
  hasAccess: false,
  reason: "no_entitlement",
  planType: null,
  accessUntil: null,
};

function time(value: Date | string | null | undefined): number | null {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

export function decideSubscriptionEntitlement(
  subscriptions: ReadonlyArray<EntitlementSubscription>,
  planTypeById: Readonly<Record<string, SubscriptionPlanKind>>,
  payments: ReadonlyArray<EntitlementPaymentEvidence>,
  now: Date = new Date(),
): EntitlementDecision {
  const current = now.getTime();
  if (!Number.isFinite(current)) return NO_ACCESS;

  // Prefer permanent, then recurring, then temporary trial access.
  let recurring: EntitlementDecision | null = null;
  let lifetimeTrial: EntitlementDecision | null = null;

  for (const sub of subscriptions) {
    if (sub.status !== "active" && sub.status !== "cancelling") continue;
    const planType = planTypeById[sub.planId];
    if (!planType) continue;
    const start = time(sub.startDate);
    if (start === null || start > current) continue;

    if (planType === "lifetime") {
      // A pending or active trial must NOT be mistaken for paid lifetime access.
      if (sub.status !== "active") continue;
      const trialEnds = time(sub.trialEndsAt);
      if (trialEnds !== null) {
        if (
          trialEnds > current &&
          payments.some(p => p.planId === sub.planId && p.status === "trialing")
        ) {
          lifetimeTrial = {
            hasAccess: true,
            reason: "lifetime_trial",
            planType,
            accessUntil: new Date(trialEnds).toISOString(),
          };
        }
      } else if (
        payments.some(p => p.planId === sub.planId && p.status === "success")
      ) {
        return {
          hasAccess: true,
          reason: "lifetime_paid",
          planType,
          accessUntil: null,
        };
      }
      continue;
    }

    const end = time(sub.endDate);
    if (end === null || end <= current) continue;
    // Cancelling means Stripe is scheduled to cancel at period end.
    // Both active and cancelling are valid only inside the recorded period.
    const candidate: EntitlementDecision = {
      hasAccess: true,
      reason: "recurring_period",
      planType,
      accessUntil: new Date(end).toISOString(),
    };
    if (
      recurring === null ||
      new Date(recurring.accessUntil as string).getTime() < end
    ) {
      recurring = candidate;
    }
  }
  return recurring ?? lifetimeTrial ?? NO_ACCESS;
}
