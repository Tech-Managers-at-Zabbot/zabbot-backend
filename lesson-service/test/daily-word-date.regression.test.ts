import assert from "node:assert/strict";
import { test } from "node:test";
import { dailyWordDateAndReuseCutoff } from "../src/services/wordForTheDayServices/dailyWordDates";

test("WAT midnight correctly reuses October 25 on local November 24", () => {
  const now = new Date("2026-11-23T23:24:00Z"); // 00:24 Nov 24, Lagos
  assert.deepEqual(dailyWordDateAndReuseCutoff(now, "Africa/Lagos"), {
    today: "2026-11-24",
    reuseCutoff: "2026-10-25",
  });
  assert.deepEqual(dailyWordDateAndReuseCutoff(now, "UTC"), {
    today: "2026-11-23",
    reuseCutoff: "2026-10-24",
  });
});

test("UTC cron and learner request use the same cutoff when on the same calendar day", () => {
  const now = new Date("2026-11-24T01:00:00Z");
  assert.deepEqual(dailyWordDateAndReuseCutoff(now), {
    today: "2026-11-24",
    reuseCutoff: "2026-10-25",
  });
  assert.deepEqual(dailyWordDateAndReuseCutoff(now, "Africa/Lagos"), {
    today: "2026-11-24",
    reuseCutoff: "2026-10-25",
  });
});

test("western timezones do not advance reuse before their local midnight", () => {
  const now = new Date("2026-11-24T01:00:00Z");
  assert.deepEqual(dailyWordDateAndReuseCutoff(now, "America/New_York"), {
    today: "2026-11-23",
    reuseCutoff: "2026-10-24",
  });
});

test("30 calendar days across daylight-saving and leap-year boundaries", () => {
  assert.deepEqual(
    dailyWordDateAndReuseCutoff(new Date("2024-03-31T00:30:00Z"), "Europe/London"),
    { today: "2024-03-31", reuseCutoff: "2024-03-01" },
  );
  assert.deepEqual(
    dailyWordDateAndReuseCutoff(new Date("2024-03-01T13:00:00Z"), "UTC"),
    { today: "2024-03-01", reuseCutoff: "2024-01-31" },
  );
});
