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
const fakeAudioFiles: Record<string, any> = {
  "free-audio": { id: "free-audio", contentId: "free-content", contentType: "audio", filePath: "https://test.invalid/free.mp3" },
  "premium-audio": { id: "premium-audio", contentId: "premium-content", contentType: "audio", filePath: "https://test.invalid/premium.mp3" },
  "disabled-audio": { id: "disabled-audio", contentId: "disabled-content", contentType: "audio", filePath: "https://test.invalid/disabled.mp3" },
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
  if (request.endsWith("/contentFile/content-file")) return fakeModel(fakeAudioFiles);
  if (/\/controllers(?:\/|$)/.test(request) && parentFile.includes("/src/routes/")) {
    return new Proxy({ __esModule: true }, {
      get: (_obj, prop) => prop === "__esModule" ? true : (prop === "quizController" || prop === "flashcardController") ? mockControllers : mockControllers[prop],
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
      ["/courses", "../../lesson-service/src/routes/course.route"],
      ["/pronunciation", "../../pronunciation-feedback-service/src/routes/pronunciationFeedback.routes"],
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
      assertDenied(await request(origin, "/courses/add-user-course/lang/" + premiumJourney, "free", "POST", { lastLessonId: paidLesson }), 403, "SUBSCRIPTION_REQUIRED");
      assertAllowed(await request(origin, "/courses/add-user-course/lang/" + premiumJourney, "paid", "POST", { lastLessonId: paidLesson }));
      assertAllowed(await request(origin, "/courses/add-user-course/lang/" + FREE_PREVIEW_JOURNEY_ID, "free", "POST", { lastLessonId: FREE_PREVIEW_LESSON_ID }));
      assertDenied(await request(origin, "/courses/update-user-course/" + premiumJourney, "free", "PUT", { lastLessonId: paidLesson }), 403, "SUBSCRIPTION_REQUIRED");
      assertAllowed(await request(origin, "/courses/update-user-course/" + premiumJourney, "paid", "PUT", { lastLessonId: paidLesson }));
      assertDenied(await request(origin, "/courses/update-user-course/" + premiumJourney, "paid", "PUT", { lastLessonId: "missing" }), 404, "CURRICULUM_NOT_FOUND");
      assertDenied(await request(origin, "/courses/update-user-course/disabled-journey", "paid", "PUT", { lastLessonId: "disabled-parent-lesson" }), 403, "CURRICULUM_UNAVAILABLE");
      assertDenied(await request(origin, "/courses/update-user-course/" + premiumJourney, "paid", "PUT", {}), 400, "LESSON_ID_REQUIRED");
      // Pronunciation feedback is protected by the actual route and DB-linked audio guard.
      assertAllowed(await request(origin, "/pronunciation/free-audio/feedback", "free", "POST", { isInLesson: "true" }));
      assertDenied(await request(origin, "/pronunciation/premium-audio/feedback", "free", "POST", { isInLesson: "true" }), 403, "SUBSCRIPTION_REQUIRED");
      assertAllowed(await request(origin, "/pronunciation/premium-audio/feedback", "paid", "POST", { isInLesson: "true" }));
      assertDenied(await request(origin, "/pronunciation/disabled-audio/feedback", "paid", "POST", { isInLesson: "true" }), 403, "CURRICULUM_UNAVAILABLE");
      assertDenied(await request(origin, "/pronunciation/not-real/feedback", "paid", "POST", { isInLesson: "true" }), 400, "INVALID_LESSON_AUDIO");
      assertDenied(await request(origin, "/pronunciation/premium-audio/feedback", "free", "POST", {}), 403, "SUBSCRIPTION_REQUIRED");
      assertAllowed(await request(origin, "/pronunciation/premium-audio/feedback", "paid", "POST", {}));
      // Regression: a client-supplied lesson ID never changes the trusted
      // content -> lesson -> Journey authorization mapping.
      assertDenied(await request(origin, "/content/premium-content?lessonId=" + FREE_PREVIEW_LESSON_ID, "free"), 403, "SUBSCRIPTION_REQUIRED");
      assertDenied(await request(origin, "/content/language-contents/lang", "free"), 403, "SUBSCRIPTION_REQUIRED");
      assertAllowed(await request(origin, "/content/language-contents/lang", "paid"));
      // The bulk quiz route is premium; the approved free lesson must instead
      // render its lesson-scoped embedded quizzes through the allowed detail API.
      assertDenied(await request(origin, "/quiz/" + FREE_PREVIEW_JOURNEY_ID, "free"), 403, "SUBSCRIPTION_REQUIRED");
      assertAllowed(await request(origin, "/lesson/lesson-with-contents/" + FREE_PREVIEW_LESSON_ID, "free"));
      // ADMIN unavailable overrides both free entitlement and paid entitlement.
      assertDenied(await request(origin, "/lesson/lesson-with-contents/disabled-lesson", "free"), 403, "CURRICULUM_UNAVAILABLE");
      assertDenied(await request(origin, "/content/disabled-content", "free"), 403, "CURRICULUM_UNAVAILABLE");
      // Fail closed on expired/failed entitlements and resolver failure.
      assertDenied(await request(origin, "/flashcards/", "expired"), 403, "SUBSCRIPTION_REQUIRED");
      assertDenied(await request(origin, "/quiz/" + premiumJourney, "outage"), 503, "ENTITLEMENT_UNAVAILABLE");
      // Journey-progress payload is FLAT in the actual browser API. Explicitly
      // reject nested-only and absent IDs rather than silently writing progress.
      assertDenied(await request(origin, "/courses/add-user-course/lang/" + premiumJourney, "paid", "POST", { userCourseData: { lastLessonId: paidLesson } }), 400, "LESSON_ID_REQUIRED");
      assertDenied(await request(origin, "/courses/update-user-course/" + premiumJourney, "paid", "PUT", { userCourseData: { lastLessonId: paidLesson } }), 400, "LESSON_ID_REQUIRED");
      assertDenied(await request(origin, "/courses/add-user-course/lang/" + FREE_PREVIEW_JOURNEY_ID, "free", "POST", { lastLessonId: paidLesson }), 404, "CURRICULUM_NOT_FOUND");
      assertDenied(await request(origin, "/courses/update-user-course/" + premiumJourney, "free", "PUT", { lastLessonId: FREE_PREVIEW_LESSON_ID }), 404, "CURRICULUM_NOT_FOUND");
      assertAllowed(await request(origin, "/courses/update-user-course/" + FREE_PREVIEW_JOURNEY_ID, "free", "PUT", { lastLessonId: FREE_PREVIEW_LESSON_ID }));
      assertDenied(await request(origin, "/courses/update-user-course/" + premiumJourney, "outage", "PUT", { lastLessonId: paidLesson }), 503, "ENTITLEMENT_UNAVAILABLE");
      // Pronunciation uses the DB audio identifier in the request URL. A
      // browser-provided free-lesson audio claim must not authorize premium.
      assertDenied(await request(origin, "/pronunciation/premium-audio/feedback", "free", "POST", { isInLesson: "true", isInLessonAudioId: "free-audio", isInLessonUrl: "https://test.invalid/free.mp3" }), 403, "SUBSCRIPTION_REQUIRED");
      assertDenied(await request(origin, "/pronunciation/premium-audio/feedback", "outage", "POST", { isInLesson: "true" }), 503, "ENTITLEMENT_UNAVAILABLE");
      assertDenied(await request(origin, "/pronunciation/missing/feedback", "paid", "POST", { isInLesson: "true", isInLessonUrl: "https://untrusted.invalid/sound.wav" }), 400, "INVALID_LESSON_AUDIO");
            assert.ok(calls > 0, "server entitlement resolver was invoked");
    } finally {
      await new Promise<void>((resolve, reject) => server.close(e => e ? reject(e) : resolve()));
    }
  } finally {
    if (originalFlag === undefined) delete process.env.ZABBOT_SUBSCRIPTION_GATING_ENFORCE;
    else process.env.ZABBOT_SUBSCRIPTION_GATING_ENFORCE = originalFlag;
  }
});

test("feature flag OFF preserves existing route behavior without entitlement checks", async () => {
  const original = process.env.ZABBOT_SUBSCRIPTION_GATING_ENFORCE;
  process.env.ZABBOT_SUBSCRIPTION_GATING_ENFORCE = "false";
  try {
    const app = express();
    app.use(express.json());
    app.use("/lesson", loadRoute("../../lesson-service/src/routes/lesson.route"));
    app.use("/content", loadRoute("../../lesson-service/src/routes/content.route"));
    app.use("/quiz", loadRoute("../../lesson-service/src/routes/quiz.route"));
    app.use("/courses", loadRoute("../../lesson-service/src/routes/course.route"));
    const server = app.listen(0, "127.0.0.1");
    try {
      await new Promise<void>(resolve => server.listening ? resolve() : server.once("listening", resolve));
      const origin = "http://127.0.0.1:" + (server.address() as any).port;
      const before = calls;
      assertAllowed(await request(origin, "/lesson/lesson-with-contents/" + paidLesson, "free"));
      assertAllowed(await request(origin, "/content/premium-content", null));
      assertAllowed(await request(origin, "/content/", null));
      assertAllowed(await request(origin, "/quiz/" + premiumJourney, "free"));
      assertAllowed(await request(origin, "/courses/add-user-course/lang/" + premiumJourney, "free", "POST", {}));
      assert.equal(calls, before, "OFF-mode routes must not query entitlements");
    } finally {
      await new Promise<void>((resolve, reject) => server.close(e => e ? reject(e) : resolve()));
    }
  } finally {
    if (original === undefined) delete process.env.ZABBOT_SUBSCRIPTION_GATING_ENFORCE;
    else process.env.ZABBOT_SUBSCRIPTION_GATING_ENFORCE = original;
  }
});
