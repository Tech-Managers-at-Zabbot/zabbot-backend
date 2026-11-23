import Stripe from "stripe";
import { QueryTypes } from "sequelize";
import { users_service_db } from "../../../../config/databases";
import Transactions, {
  TransactionStatus,
  PaymentGateway,
} from "../../../../shared/entities/payment-service-entities/transactions/transactions";

/**
 * Reconcile charge refunds and disputes against specific Stripe payments.
 * Called only AFTER the existing Stripe signature verification in webhook.
 * Never revoke unrelated plans just because they share the same plan ID.
 *
 * A charge may correspond to a checkout, renewal invoice, or delayed lifetime
 * payment; payment_intent is recorded in metadata by the respective handlers.
 * Historical charges without this metadata require a separate backfill.
 */
export async function reconcileStripePaymentReversal(
  event: Stripe.Event,
): Promise<number> {
  const obj = event.data.object as any;
  const intent = obj?.payment_intent;
  const paymentIntentId = typeof intent === "string" ? intent : intent?.id;
  if (typeof paymentIntentId !== "string" || !paymentIntentId.startsWith("pi_")) {
    console.warn("Stripe reversal missing payment intent reference", event.id);
    return 0;
  }
  const matching = await users_service_db.query<{ id: string }>(
    `SELECT id FROM public.transactions
      WHERE "paymentGateway" = :gateway
      AND (
        metadata->>'stripePaymentIntentId' = :intentId
        OR metadata->>'chargePaymentIntentId' = :intentId
      )`,
    {
      replacements: { gateway: PaymentGateway.STRIPE, intentId: paymentIntentId },
      type: QueryTypes.SELECT,
    },
  );
  if (matching.length === 0) {
    console.warn("Stripe reversal has no mapped transaction; reconciliation needed", event.id);
    return 0;
  }

  const chargeFullyRefunded =
    event.type === "charge.refunded" && obj?.refunded === true;
  const disputed = event.type === "charge.dispute.created";
  if (!chargeFullyRefunded && !disputed) return 0;

  let updated = 0;
  for (const match of matching) {
    const transaction = await Transactions.findByPk(match.id);
    if (!transaction) continue;
    // Only update a transaction that was previously considered paid.
    if (transaction.status === TransactionStatus.REFUNDED) continue;
    if (transaction.status !== TransactionStatus.SUCCESS) continue;
    await transaction.update({
      status: TransactionStatus.REFUNDED,
      refundedAt: new Date(),
      metadata: {
        ...(transaction.metadata ?? {}),
        entitlementRevoked: true,
        disputed,
        reversalEventId: event.id,
        reversalType: event.type,
      },
    });
    updated++;
  }
  return updated;
}
