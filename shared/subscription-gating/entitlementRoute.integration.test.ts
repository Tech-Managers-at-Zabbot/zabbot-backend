// @ts-nocheck
/**
 * D2: Exercise the REAL payment-service entitlement Express route and its
 * authentication boundary using deterministic in-memory fakes.
 * No database, Stripe, STAGING credentials, or production services are used.
 * This does NOT claim that the deployed STAGING endpoint has been checked.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import express from "express";
import Module from "node:module";

const routeModulePath = require.resolve("../../payment-service/src/routes/subscriptionRoutes/subscriptions.routes");
let lookupCalls: string[] = [];
const fakeDecisions: Record<string, any> = {
  unsubscribed: {
    hasAccess: false, reason: "no_entitlement", planType: null, accessUntil: null,
  },
  paid: {
    hasAccess: true, reason: "recurring_period", planType: "monthly",
    accessUntil: "2026-12-01T00:00:00.000Z",
  },
  trial: {
    hasAccess: true, reason: "lifetime_trial", planType: "lifetime",
    accessUntil: "2026-11-30T00:00:00.000Z",
  },
};
const mockAuth = {
  generalAuthFunction: (req: any, res: any, next: any) => {
    const identity = req.headers["x-test-identity"];
    if (!identity) return res.status(401).json({ status: "error", code: "LOGIN_REQUIRED" });
    // Deliberately exercise the route's defensive missing-identity check.
    req.user = identity === "no-user-id" ? {} : { userId: identity, role: "user" };
    return next();
  },
  rolePermit: () => (_req: any, _res: any, next: any) => next(),
};

function loadRealRouter() {
  const originalLoad = (Module as any)._load;
  delete require.cache[routeModulePath];
  (Module as any)._load = function (request: string, parent: any, isMain: boolean) {
    const source = (parent?.filename ?? "").replace(/\\/g, "/");
    if (source === routeModulePath) {
      if (request.endsWith("/authorization.middleware")) return mockAuth;
      if (request.endsWith("/getUserEntitlement")) {
        return {
          getUserEntitlement: async (userId: string) => {
            lookupCalls.push(userId);
            if (userId === "outage") throw new Error("simulated database outage");
            return fakeDecisions[userId] ?? fakeDecisions.unsubscribed;
          },
        };
      }
      if (request === "../../controllers") {
        return { subscriptionControllers: {
          createSubscriptionController: (_req: any, res: any) => res.sendStatus(200),
          getUserSubscriptionController: (_req: any, res: any) => res.sendStatus(200),
        }};
      }
      if (request === "../../validations") {
        return { JoiValidators: {
          createSubscriptionPlanSchema: {},
          inputValidator: () => (_req: any, _res: any, next: any) => next(),
        }};
      }
    }
    return originalLoad.call(this, request, parent, isMain);
  };
  try {
    return require(routeModulePath).default;
  } finally {
    (Module as any)._load = originalLoad;
  }
}

async function withServer(run: (base: string) => Promise<void>) {
  const app = express();
  // Use the real payment-service mounting prefix from payment-service/src/routes/index.ts.
  app.use("/payment-services/subscription-plans", loadRealRouter());
  const server = app.listen(0, "127.0.0.1");
  try {
    await new Promise<void>(resolve =>
      server.listening ? resolve() : server.once("listening", resolve));
    const address = server.address() as any;
    await run("http://127.0.0.1:" + address.port + "/payment-services/subscription-plans/entitlement");
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(error => error ? reject(error) : resolve()));
  }
}
async function get(url: string, identity?: string) {
  const response = await fetch(url, {
    headers: identity ? { "x-test-identity": identity } : {},
  });
  return { status: response.status, headers: response.headers, body: await response.json() };
}

test("D2 real route: authentication, safe identity scoping, entitlement responses, cache, and outages", async () => {
  lookupCalls = [];
  await withServer(async url => {
    const anonymous = await get(url);
    assert.equal(anonymous.status, 401);
    assert.equal(anonymous.body.code, "LOGIN_REQUIRED");
    assert.deepEqual(lookupCalls, [], "anonymous request must not trigger lookup");

    const missingId = await get(url, "no-user-id");
    assert.equal(missingId.status, 401);
    assert.equal(missingId.body.code, "LOGIN_REQUIRED");
    assert.deepEqual(lookupCalls, [], "request without authenticated user ID must not trigger lookup");

    const noSubscription = await get(url, "unsubscribed");
    assert.equal(noSubscription.status, 200);
    assert.equal(noSubscription.body.status, "success");
    assert.deepEqual(noSubscription.body.data, fakeDecisions.unsubscribed);
    assert.equal(noSubscription.headers.get("cache-control"), "no-store");

    const paid = await get(url, "paid");
    assert.equal(paid.status, 200);
    assert.deepEqual(paid.body.data, fakeDecisions.paid);
    assert.equal(paid.headers.get("cache-control"), "no-store");

    const trial = await get(url, "trial");
    assert.equal(trial.status, 200);
    assert.deepEqual(trial.body.data, fakeDecisions.trial);

    const repeated = await get(url, "unsubscribed");
    assert.equal(repeated.status, 200);
    assert.deepEqual(repeated.body.data, noSubscription.body.data);
    assert.equal(repeated.headers.get("cache-control"), "no-store");

    const outage = await get(url, "outage");
    assert.equal(outage.status, 503);
    assert.deepEqual(outage.body, { status: "error", code: "ENTITLEMENT_UNAVAILABLE" });
    assert.equal(outage.body.data, undefined, "outage must not grant access");

    assert.deepEqual(lookupCalls, [
      "unsubscribed", "paid", "trial", "unsubscribed", "outage",
    ], "entitlements must be looked up only for the authenticated caller");
    for (const result of [noSubscription, paid, trial, repeated, outage]) {
      const serialized = JSON.stringify(result.body).toLowerCase();
      for (const sensitive of ["gatewaySubscriptionId", "paymentintent", "cardnumber", "transactionid"]) {
        assert.equal(serialized.includes(sensitive.toLowerCase()), false);
      }
    }
  });
});
