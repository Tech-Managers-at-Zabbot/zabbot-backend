import { Op } from "sequelize";
import UserSubscription from "../entities/payment-service-entities/subscriptions/userSubscriptions";
import SubscriptionPlan from "../entities/payment-service-entities/subscriptions/subscriptions";
import Transactions from "../entities/payment-service-entities/transactions/transactions";
import {
  decideSubscriptionEntitlement,
  EntitlementDecision,
  EntitlementSubscription,
  EntitlementPaymentEvidence,
  SubscriptionPlanKind,
} from "./entitlementDecision";

/**
 * Read-only server-side entitlement lookup for the authenticated user.
 * Returns no raw payment data or provider identifiers to callers.
 *
 * This endpoint is informational. NO curriculum gates are enabled by this
 * service. Billing reconciliation (refunds, disputes, legacy paid lifetime)
 * must be completed and tested before wiring it to enforcement middleware.
 */
export async function getUserEntitlement(
  authenticatedUserId: string,
  now: Date = new Date(),
): Promise<EntitlementDecision> {
  const subscriptions = await UserSubscription.findAll({
    where: { userId: authenticatedUserId },
    raw: true,
  });

  if (subscriptions.length === 0) {
    return decideSubscriptionEntitlement([], {}, [], now);
  }

  const planIds = Array.from(new Set(subscriptions.map(s => s.planId)));
  const [plans, transactions] = await Promise.all([
    SubscriptionPlan.findAll({
      where: { id: { [Op.in]: planIds } },
      raw: true,
    }),
    Transactions.findAll({
      where: {
        userId: authenticatedUserId,
        planId: { [Op.in]: planIds },
      },
      raw: true,
    }),
  ]);

  const planTypeById: Record<string, SubscriptionPlanKind> = {};
  for (const plan of plans) {
    if (
      plan.planType === "monthly" ||
      plan.planType === "annual" ||
      plan.planType === "lifetime"
    ) {
      planTypeById[plan.id] = plan.planType;
    }
  }

  const subscriptionData: EntitlementSubscription[] = subscriptions.map(s => ({
    id: s.id,
    planId: s.planId,
    gatewaySubscriptionId: s.gatewaySubscriptionId ?? null,
    status: s.status,
    startDate: s.startDate,
    endDate: s.endDate ?? null,
    trialEndsAt: s.trialEndsAt ?? null,
  }));

  const paymentData: EntitlementPaymentEvidence[] = transactions
    .filter(t => t.planId != null)
    .map(t => ({
      planId: t.planId as string,
      status: t.status,
      subscriptionId: t.gatewaySubscriptionId ?? null,
      transactionId: t.id,
      paidAt: t.paidAt ?? null,
      billingPeriodEnd: t.metadata?.stripePeriodEnd ?? null,
      refundedAt: t.refundedAt ?? null,
      revoked: t.refundedAt != null || t.metadata?.disputed === true || t.metadata?.entitlementRevoked === true,
    }));

  return decideSubscriptionEntitlement(
    subscriptionData,
    planTypeById,
    paymentData,
    now,
  );
}
