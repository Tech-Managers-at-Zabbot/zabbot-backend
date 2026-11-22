import assert from "node:assert/strict";
import { test } from "node:test";
import {
  decideSubscriptionEntitlement,
  EntitlementSubscription,
  EntitlementPaymentEvidence,
} from "./entitlementDecision";

const now = new Date("2026-11-22T12:00:00.000Z");
const plans = { monthly: "monthly", yearly: "annual", life: "lifetime" } as const;
const base = (overrides: Partial<EntitlementSubscription> = {}): EntitlementSubscription => ({
  id: "sub-1",
  planId: "monthly",
  status: "active",
  startDate: "2026-11-01T00:00:00.000Z",
  endDate: "2026-12-01T00:00:00.000Z",
  ...overrides,
});
const payment = (
  status: EntitlementPaymentEvidence["status"],
  planId: string = "life",
): EntitlementPaymentEvidence => ({ planId, status });

test("no subscription denies premium access", () => {
  assert.equal(decideSubscriptionEntitlement([], plans, [], now).hasAccess, false);
});

test("valid monthly period grants access", () => {
  const result = decideSubscriptionEntitlement([base()], plans, [], now);
  assert.equal(result.hasAccess, true);
  assert.equal(result.reason, "recurring_period");
});

test("expired monthly period denies access even with active status", () => {
  const result = decideSubscriptionEntitlement(
    [base({ endDate: "2026-11-21T00:00:00.000Z" })], plans, [], now,
  );
  assert.equal(result.hasAccess, false);
});

test("period-end cancelling subscription retains access until end", () => {
  const result = decideSubscriptionEntitlement(
    [base({ status: "cancelling" })], plans, [], now,
  );
  assert.equal(result.hasAccess, true);
});

test("failed and immediately cancelled subscriptions deny access", () => {
  for (const status of ["failed", "cancelled"] as const) {
    assert.equal(
      decideSubscriptionEntitlement([base({ status })], plans, [], now).hasAccess,
      false,
    );
  }
});

test("lifetime setup trial needs valid trial date and trialing payment", () => {
  const trial = base({
    planId: "life", endDate: null,
    trialEndsAt: "2026-11-25T00:00:00.000Z",
  });
  const valid = decideSubscriptionEntitlement([trial], plans, [payment("trialing")], now);
  assert.equal(valid.reason, "lifetime_trial");
  assert.equal(decideSubscriptionEntitlement([trial], plans, [], now).hasAccess, false);
  assert.equal(
    decideSubscriptionEntitlement(
      [{ ...trial, trialEndsAt: "2026-11-21T00:00:00.000Z" }],
      plans, [payment("trialing")], now,
    ).hasAccess,
    false,
  );
});

test("paid lifetime requires a success transaction and no active trial marker", () => {
  const purchased = base({
    planId: "life", endDate: null, trialEndsAt: null,
  });
  assert.equal(
    decideSubscriptionEntitlement([purchased], plans, [payment("success")], now).reason,
    "lifetime_paid",
  );
  assert.equal(decideSubscriptionEntitlement([purchased], plans, [], now).hasAccess, false);
  assert.equal(
    decideSubscriptionEntitlement(
      [{ ...purchased, trialEndsAt: "2026-11-25T00:00:00.000Z" }],
      plans, [payment("success")], now,
    ).hasAccess,
    false,
  );
});

test("future-dated subscriptions do not grant early access", () => {
  assert.equal(
    decideSubscriptionEntitlement(
      [base({ startDate: "2026-12-01T00:00:00.000Z" })], plans, [], now,
    ).hasAccess,
    false,
  );
});
