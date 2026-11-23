/**
 * STAGING-only E6 verification.
 * GET requests only, using short-lived encrypted GH Actions test tokens.
 * This script prints status codes and scenario labels, never tokens or bodies.
 */
"use strict";
const assert = require("node:assert/strict");
const BASE = "https://zabbot-backend-development-no68m.ondigitalocean.app";
const FREE_JOURNEY = "1a64676a-f16e-4054-9d61-bef443f32339";
const FREE_STEP = "2dfcd37e-364e-4490-a8ef-7e3b18caa6c6";
const free = process.env.E6_FREE_TEST_ACCESS_TOKEN || "";
const lifetime = process.env.E6_LIFETIME_TEST_ACCESS_TOKEN || "";
const premiumStep = (process.env.E6_PREMIUM_STEP_ID || "").trim();
const epath = "/api/v1/payments/payment-services/subscription-plans/entitlement";
const checks = [];
if (!free || !lifetime || free === lifetime) {
  console.error("BLOCKED: two distinct STAGING-only access-token secrets are required. No authenticated E6 checks executed.");
  process.exit(2);
}
if (!premiumStep || !/^[0-9a-f-]{36}$/i.test(premiumStep) || premiumStep === FREE_STEP) {
  console.error("BLOCKED: set E6_PREMIUM_STEP_ID to an active non-preview STAGING Step UUID. No authenticated E6 checks executed.");
  process.exit(2);
}
async function api(path, token) {
  const r = await fetch(BASE + path, {
    method: "GET",
    redirect: "manual",
    headers: { authorization: "Bearer " + token, accept: "application/json", "cache-control": "no-store" },
    signal: AbortSignal.timeout(15000),
  });
  let payload = null;
  // Parse bounded body only from the entitlement route, to validate auth
  // and entitlement without logging any response data.
  if (path === epath && r.ok) {
    const text = (await r.text()).slice(0, 4096);
    try { payload = JSON.parse(text); } catch { payload = null; }
  } else {
    await r.body?.cancel();
  }
  return { status: r.status, payload };
}
async function check(label, token, path, status, expectedCode) {
  const r = await api(path, token);
  const ok = r.status === status && (!expectedCode || r.payload?.data?.hasAccess === expectedCode);
  console.log((ok ? "PASS " : "FAIL ") + label + ": HTTP " + r.status);
  assert.ok(ok, label + " returned unexpected status or entitlement decision");
}
async function main() {
  const un = await api(epath, free);
  assert.equal(un.status, 200, "Free learner entitlement endpoint must return 200");
  assert.equal(un.payload?.status, "success");
  assert.equal(un.payload?.data?.hasAccess, false, "Free learner must not receive premium entitlement");
  console.log("PASS E6 authenticated free learner entitlement: HTTP 200 / hasAccess false");
  const paid = await api(epath, lifetime);
  assert.equal(paid.status, 200, "Lifetime learner entitlement endpoint must return 200");
  assert.equal(paid.payload?.status, "success");
  assert.equal(paid.payload?.data?.hasAccess, true, "Lifetime learner must receive premium entitlement");
  console.log("PASS E6 authenticated lifetime entitlement: HTTP 200 / hasAccess true");
  await check("E6 free preview for unsubscribed learner", free,
    "/api/v1/lessons/lessons/lesson-with-contents/" + FREE_STEP, 200);
  await check("E6 premium Step denies unsubscribed learner", free,
    "/api/v1/lessons/lessons/lesson-with-contents/" + premiumStep, 403);
  await check("E6 premium Step allows lifetime learner", lifetime,
    "/api/v1/lessons/lessons/lesson-with-contents/" + premiumStep, 200);
  await check("E6 bulk contents denies unsubscribed learner", free, "/api/v1/lessons/contents/", 403);
  await check("E6 bulk contents allows lifetime learner", lifetime, "/api/v1/lessons/contents/", 200);
  await check("E6 coursewide quizzes deny unsubscribed learner", free,
    "/api/v1/lessons/quizzes/" + FREE_JOURNEY, 403);
  await check("E6 coursewide quizzes allow lifetime learner", lifetime,
    "/api/v1/lessons/quizzes/" + FREE_JOURNEY, 200);
  console.log("E6 authenticated GET-only tests passed; write methods and outage scenarios require isolated testing.");
}
main().catch(err => {
  // Do not print request objects, payloads, or tokens.
  console.error("Authenticated E6 failed: " + (err?.name === "AssertionError" ? err.message : err?.name || "unknown error"));
  process.exitCode = 1;
});
