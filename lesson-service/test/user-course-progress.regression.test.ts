// @ts-nocheck
/**
 * Exercise the REAL user-course service and repository against an in-memory
 * Sequelize model with the STAGING database's unique (userId, courseId) rule.
 * No external database, credentials, migrations, or application server.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import Module from "node:module";

const records: any[] = [];
let inserts = 0;
let counter = 0;
let concurrentInsert = false;
const lessonIds: Record<string, string> = {
  "lesson-a": "journey-a",
  "lesson-b": "journey-a",
  "lesson-other": "journey-b",
};
const makeDuplicate = () => {
  const error: any = new Error("Validation error");
  error.name = "SequelizeUniqueConstraintError";
  error.parent = { constraint: "user_courses_user_id_course_id", code: "23505" };
  return error;
};
const fakeUserCourses = {
  findOne: async ({ where }: any) =>
    records.find(r => Object.entries(where).every(([key, value]) => r[key] === value)) ?? null,
  findAll: async ({ where }: any) =>
    records.filter(r => Object.entries(where).every(([key, value]) => r[key] === value)),
  create: async (payload: any) => {
    inserts++;
    const duplicate = records.find(r => r.userId === payload.userId && r.courseId === payload.courseId);
    if (duplicate) throw makeDuplicate();
    if (concurrentInsert) {
      concurrentInsert = false;
      // Simulate another request winning the unique-key race at the DB.
      records.push({ ...payload, id: "other-request-id" });
      throw makeDuplicate();
    }
    const row = { progress: 0, isCompleted: false, isActive: true, ...payload };
    records.push(row);
    return row;
  },
  update: async (payload: any, { where }: any) => {
    const record = records.find(r => Object.entries(where).every(([key, value]) => r[key] === value));
    if (!record) return [0, []];
    Object.assign(record, payload);
    return [1, [record]];
  },
};
const mockUtilities = {
  errorUtilities: {
    withServiceErrorHandling: (fn: any) => fn,
    createError: (message: string, statusCode: number) => Object.assign(new Error(message), { statusCode }),
  },
  responseUtilities: {
    handleServicesResponse: (statusCode: number, message: string, data: any) => ({ statusCode, message, data }),
  },
};
const originalLoad = (Module as any)._load;
(Module as any)._load = function(request: string, parent: any, isMain: boolean) {
  const parentFile = String(parent?.filename || "").replace(/\\/g, "/");
  if (request.endsWith("/userCourse/user-course")) return { __esModule: true, default: fakeUserCourses };
  if (request.endsWith("/utilities") && parentFile.includes("/lesson-service/src/")) return mockUtilities;
  if (request.endsWith("/course.repository")) return { __esModule: true, default: {} };
  if (request.endsWith("/lesson.repository")) return {
    __esModule: true,
    default: { getLesson: async (id: string) => lessonIds[id] ? { id, courseId: lessonIds[id] } : null },
  };
  if (request.endsWith("/statusCodes.responses")) return { StatusCodes: { OK: 200, NotFound: 404 } };
  if (request.endsWith("/responses") && parentFile.includes("/lesson-service/src/")) {
    return { CourseResponses: {
      PROCESS_SUCCESSFUL: "Process Successful", USER_COURSE_NOT_FOUND: "User course not found",
      LESSON_NOT_FOUND: "Lesson not found",
    }};
  }
  if (request === "uuid") return { v4: () => "test-id-" + (++counter) };
  return originalLoad.apply(this, arguments);
};
let service: any;
try {
  service = require("../src/services/lessonServices/user-course.service").default;
} finally {
  (Module as any)._load = originalLoad;
}
const data = (userId: string, courseId: string, lastLessonId: string) => ({
  userId, courseId, languageId: "language-y", lastLessonId,
  lastContentId: null, isActive: true, isCompleted: false, progress: 0,
});
const reset = () => { records.length = 0; inserts = 0; counter = 0; concurrentInsert = false; };

test("journey progress lookup uses the learner and Journey, not last visited lesson", async () => {
  reset();
  records.push({ id: "original", ...data("learner-a", "journey-a", "lesson-a"), progress: 45 });
  const fetched = await service.getUserCourse("language-y", "learner-a", "journey-a", "lesson-b");
  assert.equal(fetched.statusCode, 200);
  assert.equal(fetched.data.id, "original");
  assert.equal(fetched.data.progress, 45);
  // Isolation: another learner or Journey cannot observe this row.
  await assert.rejects(() => service.getUserCourse("language-y", "learner-b", "journey-a", "lesson-b"), /not found/i);
  await assert.rejects(() => service.getUserCourse("language-y", "learner-a", "journey-b", "lesson-b"), /not found/i);
});

test("reopening a different lesson does not insert duplicate Journey progress", async () => {
  reset();
  records.push({ id: "original", ...data("learner-a", "journey-a", "lesson-a"), progress: 60 });
  const response = await service.addUserCourse(data("learner-a", "journey-a", "lesson-b"));
  assert.equal(response.statusCode, 200);
  assert.equal(response.data.id, "original");
  assert.equal(response.data.progress, 60);
  assert.equal(inserts, 0);
  assert.equal(records.length, 1);
});

test("first Journey enrollment creates exactly one row; repeated enrollment is idempotent", async () => {
  reset();
  const created = await service.addUserCourse(data("learner-a", "journey-a", "lesson-a"));
  assert.equal(created.statusCode, 200);
  assert.equal(records.length, 1);
  const repeated = await service.addUserCourse(data("learner-a", "journey-a", "lesson-b"));
  assert.equal(repeated.data.id, created.data.id);
  assert.equal(records.length, 1);
  assert.equal(inserts, 1);
  await service.addUserCourse(data("learner-b", "journey-a", "lesson-a"));
  await service.addUserCourse(data("learner-a", "journey-b", "lesson-other"));
  assert.equal(records.length, 3);
});

test("concurrent create recovers the existing same-learner record after unique-key race", async () => {
  reset();
  concurrentInsert = true;
  const response = await service.addUserCourse(data("learner-a", "journey-a", "lesson-a"));
  assert.equal(response.statusCode, 200);
  assert.equal(response.data.id, "other-request-id");
  assert.equal(records.length, 1);
});

test("update moves between lessons without replacing ownership or Journey identity", async () => {
  reset();
  records.push({ id: "original", ...data("learner-a", "journey-a", "lesson-a"), progress: 25 });
  const response = await service.updateUserCourse("journey-a", "learner-a", {
    lastLessonId: "lesson-b", lastContentId: null, progress: 90,
    id: "spoofed", userId: "attacker", courseId: "journey-b", languageId: "other",
  }, "lesson-b");
  assert.equal(response.statusCode, 200);
  assert.equal(records.length, 1);
  assert.equal(records[0].id, "original");
  assert.equal(records[0].userId, "learner-a");
  assert.equal(records[0].courseId, "journey-a");
  assert.equal(records[0].languageId, "language-y");
  assert.equal(records[0].lastLessonId, "lesson-b");
  assert.equal(records[0].progress, 90);
});

test("completed Journey stays completed after revisiting another lesson", async () => {
  reset();
  records.push({ id: "original", ...data("learner-a", "journey-a", "lesson-a"),
    isCompleted: true, progress: 100 });
  const response = await service.updateUserCourse("journey-a", "learner-a", {
    lastLessonId: "lesson-b", isCompleted: false, progress: 40,
  }, "lesson-b");
  assert.equal(response.data.isCompleted, true);
  assert.equal(records[0].isCompleted, true);
});

test("update rejects a lesson belonging to another Journey and preserves prior progress", async () => {
  reset();
  records.push({ id: "original", ...data("learner-a", "journey-a", "lesson-a"), progress: 70 });
  await assert.rejects(() => service.updateUserCourse("journey-a", "learner-a", {
    lastLessonId: "lesson-other", progress: 100,
  }, "lesson-other"), /not found/i);
  assert.equal(records[0].progress, 70);
  assert.equal(records[0].lastLessonId, "lesson-a");
});
