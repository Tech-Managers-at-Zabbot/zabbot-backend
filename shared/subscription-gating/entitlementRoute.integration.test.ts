// @ts-nocheck
/**
 * D2: exercise the REAL entitlement Express route with controlled authentication
 * and entitlement-resolver fakes. No Stripe, Neon, credentials, or remote APIs.
 * This verifies routing/response semantics; deployed STAGING verification remains separate.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import express from "express";
import Module from "node:module";

const PATH = "/payment-services/subscription-plans/entitlement";
const NO_ACCESS = { hasAccess: false, reason: "no_entitlement", planType: null, accessUntil: null };
const TRIAL = { hasAccess: true, reason: "recurring_period", planType: "monthly", accessUntil: "2026-11-30T00:00:00.000Z" };
const calls: string[] = [];
const mockedAuth = {
  generalAuthFunction(req: any, res: any, next: any) {
    const identity = req.headers["x-test-identity"];
    if (!identity) return res.status(401).json({ status: "error", code: "LOGIN_REQUIRED" });
    req.user = identity === "missing-user-id" ? {} : { userId: identity, role: "user" };
    return next();
  },
  rolePermit: () => (_req: any, _res: any, next: any) => next(),
};
const mockedEntitlement = {
  async getUserEntitlement(userId: string) {
    calls.push(userId);
    if (userId === "outage") throw new Error("sensitive database failure details");
    if (userId === "trial") return TRIAL;
    return NO_ACCESS;
  },
};
const mockController = () => (_req: any, res: any) => res.status(200).json({ unused: true });
const fakeControllers = { subscriptionControllers: new Proxy({}, { get: mockController }) };
const fakeValidation = { JoiValidators: {
  inputValidator: () => (_req: any, _res: any, next: any) => next(),
  createSubscriptionPlanSchema: {},
} };

function loadRealRoute() {
  const path = require.resolve("../../payment-service/src/routes/subscriptionRoutes/subscriptions.routes");
  delete require.cache[path];
  const original = (Module as any)._load;
  (Module as any)._load = function (request: string, parent: any, isMain: boolean) {
    if (request.endsWith("/authorization.middleware")) return mockedAuth;
    if (request.endsWith("/getUserEntitlement")) return mockedEntitlement;
    if (request === "../../controllers" && parent?.filename?.includes("subscriptionRoutes")) return fakeControllers;
    if (request === "../../validations" && parent?.filename?.includes("subscriptionRoutes")) return fakeValidation;
    return original.call(this, request, parent, isMain);
  };
  try { return require(path).default; }
  finally { (Module as any)._load = original; }
}

async function get(origin: string, identity?: string) {
  const headers: Record<string, string> = identity ? { "x-test-identity": identity } : {};
  const response = await fetch(origin + PATH, { headers });
  return { status: response.status, headers: response.headers, body: await response.json() };
}

test("D2 entitlement route: anonymous denial, user scoping, decision shape, no-store, repeated reads and safe failure", async () => {
  const app = express();
  // Include the same mounted payment-service route path as the production Express app.
  app.use("/payment-services/subscription-plans", loadRealRoute());
  const server = app.listen(0, "127.0.0.1");
  try {
    await new Promise<void>(resolve => server.listening ? resolve() : server.once("listening", resolve));
    const origin = "http://127.0.0.1:" + (server.address() as any).port;

    const beforeAnonymous = calls.length;
    const anonymous = await get(origin);
    assert.equal(anonymous.status, 401);
    assert.equal(anonymous.body.code, "LOGIN_REQUIRED");
    assert.equal(calls.length, beforeAnonymous, "anonymous requests must not call resolver");

    const missing = await get(origin, "missing-user-id");
    assert.equal(missing.status, 401);
    assert.equal(missing.body.code, "LOGIN_REQUIRED");
    assert.equal(calls.length, beforeAnonymous, "missing user ID must not call resolver");

    for (let i = 0; i < 2; i++) {
      const free = await get(origin, "free-learner");
      assert.equal(free.status, 200);
      assert.deepEqual(free.body, { status: "success", data: NO_ACCESS });
      assert.match(free.headers.get("cache-control") ?? "", /no-store/);
      assert.deepEqual(Object.keys(free.body.data).sort(), ["accessUntil", "hasAccess", "planType", "reason"]);
    }
    assert.deepEqual(calls.slice(-2), ["free-learner", "free-learner"], "each request resolves the authenticated user");

    const trial = await get(origin, "trial");
    assert.equal(trial.status, 200);
    assert.deepEqual(trial.body, { status: "success", data: TRIAL });
    assert.match(trial.headers.get("cache-control") ?? "", /no-store/);

    const outage = await get(origin, "outage");
    assert.equal(outage.status, 503);
    assert.deepEqual(outage.body, { status: "error", code: "ENTITLEMENT_UNAVAILABLE" });
    assert.doesNotMatch(JSON.stringify(outage.body), /sensitive database failure details/);
    assert.equal(calls.at(-1), "outage");
  } finally {
    await new Promise<void>((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
  }
});
