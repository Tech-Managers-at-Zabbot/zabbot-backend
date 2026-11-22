// @ts-nocheck
/**
 * HTTP-level route integration tests: load the REAL Express route definitions
 * and REAL Phase 2 guard middleware with controlled DB and entitlement fakes.
 * No Neon, Stripe, user credentials, or production environment is accessed.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import express from "express";
import Module from "node:module";
import { FREE_PREVIEW_LESSON_ID, FREE_PREVIEW_JOURNEY_ID } from "./freePreview";

const paidLesson = "premium-lesson-test";
const premiumJourney = "premium-journey-test";
const fakeLessons: Record<string, any> = {
  [FREE_PREVIEW_LESSON_ID]: { id: FREE_PREVIEW_LESSON_ID, courseId: FREE_PREVIEW_JOURNEY_ID, isActive: true },
  [paidLesson]: { id: paidLesson, courseId: premiumJourney, isActive: true },
  "disabled-lesson": { id: "disabled-lesson", courseId: premiumJourney, isActive: false },
  "disabled-parent-lesson": { id: "disabled-parent-lesson", courseId: "disabled-journey", isActive: true },
};
const fakeJourneys: Record<string, any> = {
  [FREE_PREVIEW_JOURNEY_ID]: { id: FREE_PREVIEW_JOURNEY_ID, isActive: true },
  [premiumJourney]: { id: premiumJourney, isActive: true },
  "disabled-journey": { id: "disabled-journey", isActive: false },
};
const fakeContents: Record<string, any> = {
  "free-content": { id: "free-content", lessonId: FREE_PREVIEW_LESSON_ID },
  "premium-content": { id: "premium-content", lessonId: paidLesson },
  "disabled-content": { id: "disabled-content", lessonId: "disabled-parent-lesson" },
};

const fakeModel = (records: Record<string, any>) => ({
  __esModule: true,
  default: { findByPk: async (id: string) => records[id] ?? null },
});
const mockControllers = new Proxy({}, {
  get: (_target, key) => (_req: any, res: any) => res.status(200).json({ controllerReached: String(key) }),
});
const mockAuth = {
  generalAuthFunction: (req: any, res: any, next: any) => {
    const identity = req.headers["x-test-identity"];
    if (!identity) return res.status(401).json({ code: "LOGIN_REQUIRED" });
    req.user = { userId: identity, role: req.headers["x-test-role"] ?? "user" };
    return next();
  },
  rolePermit: () => (_req: any, _res: any, next: any) => next(),
};

let calls = 0;
function mockedRequire(request: string, parent: any, original: any) {
  const parentFile = (parent?.filename ?? "").replace(/\\/g, "/");
  if (request.endsWith("/authorization.middleware")) return mockAuth;
  if (request.endsWith("/getUserEntitlement")) {
    return { getUserEntitlement: async (id: string) => {
      calls++;
      if (id === "outage") throw new Error("simulated entitlement outage");
      return { hasAccess: id === "paid" };
    }};
  }
  if (request.endsWith("/lesson/lesson")) return fakeModel(fakeLessons);
  if (request.endsWith("/course/course")) return fakeModel(fakeJourneys);
  if (request.endsWith("/content/content")) return fakeModel(fakeContents);
  if (/\/controllers(?:\/|$)/.test(request) && parentFile.includes("/src/routes/")) {
    return new Proxy({ __esModule: true }, {
      get: (_obj, prop) => prop === "__esModule" ? true : mockControllers[prop],
    });
  }
  if (request.endsWith("/validations") && parentFile.includes("/src/routes/")) {
    return { JoiValidators: { inputValidator: () => (_req: any, _res: any, next: any) => next() }};
  }
  return original.call(Module, request, parent, false);
}

function loadRoute(relativePath: string) {
  const loader = (Module as any)._load;
  const routePath = require.resolve(relativePath);
  // Discard the previous route and guard modules to get flag-sensitive
  // registration and fresh module-bound dependency mocks.
  for (const path of Object.keys(require.cache)) {
    if (path === routePath || /\/shared\/subscription-gating\/(require.*Entitlement|getUserEntitlement)\.(ts|js)$/.test(path)) {
      delete require.cache[path];
    }
  }
  (Module as any)._load = function (request: string, parent: any) {
    return mockedRequire(request, parent, loader);
  };
  try {
    return require(routePath).default;
  } finally {
    (Module as any)._load = loader;
  }
}

async function withApp(route: string, router: any, run: (url: string) => Promise<void>) {
  const app = express();
  app.use(express.json());
  app.use(route, router);
  const server = app.listen(0, "127.0.0.1");
  try {
    await new Promise<void>((resolve) => {
      if (server.listening) resolve();
      else server.once("listening", resolve);
    });
    const address: any = server.address();
    await run("http://127.0.0.1:" + address.port + route);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
  }
}
async function request(base: string, path: string, identity: string | null, method = "GET", body?: any) {
  const headers: Record<string, string> = {};
  if (identity) headers["x-test-identity"] = identity;
  if (body !== undefined) headers["content-type"] = "application/json";
  const response = await fetch(base + path, {
    method, headers, body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, json: await response.json() };
}
function assertDenied(result: any, status: number, code: string) {
  assert.equal(result.status, status, JSON.stringify(result));
  assert.equal(result.json.code, code);
}
function assertAllowed(result: any) {
  assert.equal(result.status, 200, JSON.stringify(result));
  assert.ok(result.json.controllerReached, "actual route controller was reached");
}

test("real Phase 2 lesson, content, quiz and flashcard routes enforce HTTP decisions", async () => {
  const originalFlag = process.env.ZABBOT_SUBSCRIPTION_GATING_ENFORCE;
  process.env.ZABBOT_SUBSCRIPTION_GATING_ENFORCE = "true"; // test process ONLY
  try {
    const routes = [
      ["/lesson", "../../lesson-service/src/routes/lesson.route"],
      ["/content", "../../lesson-service/src/routes/content.route"],
      ["/quiz", "../../lesson-service/src/routes/quiz.route"],
      ["/flashcards", "../../lesson-service/src/routes/flashcard.route"],
      ["/user-lesson", "../../lesson-service/src/routes/userLesson.route"],
    ];
    const app = express();
    app.use(express.json());
    for (const [prefix, modulePath] of routes) app.use(prefix, loadRoute(modulePath));
    const server = app.listen(0, "127.0.0.1");
    try {
      await new Promise<void>(resolve => server.listening ? resolve() : server.once("listening", resolve));
      const origin = "http://127.0.0.1:" + (server.address() as any).port;
      assertDenied(await request(origin, "/lesson/lesson-with-contents/" + paidLesson, null), 401, "LOGIN_REQUIRED");
      assertDenied(await request(origin, "/lesson/lesson-with-contents/" + paidLesson, "free"), 403, "SUBSCRIPTION_REQUIRED");
      assertAllowed(await request(origin, "/lesson/lesson-with-contents/" + paidLesson, "paid"));
      assertAllowed(await request(origin, "/lesson/lesson-with-contents/" + FREE_PREVIEW_LESSON_ID, "free"));
      assertDenied(await request(origin, "/lesson/lesson-with-contents/disabled-lesson", "paid"), 403, "CURRICULUM_UNAVAILABLE");
      assertDenied(await request(origin, "/lesson/lesson-with-contents/disabled-parent-lesson", "paid"), 403, "CURRICULUM_UNAVAILABLE");
      assertDenied(await request(origin, "/lesson/lesson-with-contents/" + paidLesson, "outage"), 503, "ENTITLEMENT_UNAVAILABLE");
      assertDenied(await request(origin, "/content/premium-content", "free"), 403, "SUBSCRIPTION_REQUIRED");
      assertAllowed(await request(origin, "/content/premium-content", "paid"));
      assertAllowed(await request(origin, "/content/free-content", "free"));
      assertDenied(await request(origin, "/content/disabled-content", "paid"), 403, "CURRICULUM_UNAVAILABLE");
      assertDenied(await request(origin, "/content/not-a-content", "paid"), 404, "CONTENT_NOT_FOUND");
      assertDenied(await request(origin, "/content/lesson/" + paidLesson, "free"), 403, "SUBSCRIPTION_REQUIRED");
      assertAllowed(await request(origin, "/content/lesson/" + FREE_PREVIEW_LESSON_ID, "free"));
      assertDenied(await request(origin, "/content/", "free"), 403, "SUBSCRIPTION_REQUIRED");
      assertAllowed(await request(origin, "/content/", "paid"));
      assertDenied(await request(origin, "/quiz/" + premiumJourney, "free"), 403, "SUBSCRIPTION_REQUIRED");
      assertAllowed(await request(origin, "/quiz/" + premiumJourney, "paid"));
      assertDenied(await request(origin, "/flashcards/", "free"), 403, "SUBSCRIPTION_REQUIRED");
      assertAllowed(await request(origin, "/flashcards/", "paid"));
      assertDenied(await request(origin, "/flashcards/item", "free"), 403, "SUBSCRIPTION_REQUIRED");
      assertDenied(await request(origin, "/user-lesson/" + paidLesson, "free", "PUT"), 403, "SUBSCRIPTION_REQUIRED");
      assertAllowed(await request(origin, "/user-lesson/" + paidLesson, "paid", "PUT"));
      assertAllowed(await request(origin, "/user-lesson/" + FREE_PREVIEW_LESSON_ID, "free", "PUT"));
      assertDenied(await request(origin, "/user-lesson/", "free", "POST", {lessonId:paidLesson}), 403, "SUBSCRIPTION_REQUIRED");
      assertAllowed(await request(origin, "/user-lesson/", "free", "POST", {lessonId:FREE_PREVIEW_LESSON_ID}));
      assert.ok(calls > 0, "server entitlement resolver was invoked");
    } finally {
      await new Promise<void>((resolve, reject) => server.close(e => e ? reject(e) : resolve()));
    }
  } finally {
    if (originalFlag === undefined) delete process.env.ZABBOT_SUBSCRIPTION_GATING_ENFORCE;
    else process.env.ZABBOT_SUBSCRIPTION_GATING_ENFORCE = originalFlag;
  }
});
