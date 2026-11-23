import assert from "node:assert/strict";
import { test } from "node:test";
import { configuredFlashcardPreviewIds } from "./flashcardPreview";

const FIVE_IDS = [
  "11111111-1111-4111-8111-111111111111",
  "22222222-2222-4222-8222-222222222222",
  "33333333-3333-4333-8333-333333333333",
  "44444444-4444-4444-8444-444444444444",
  "55555555-5555-4555-8555-555555555555",
];

test("Flashcards preview requires both flags, five distinct UUIDs and no fallback to full deck", () => {
  const names = [
    "ZABBOT_SUBSCRIPTION_GATING_ENFORCE",
    "ZABBOT_FLASHCARDS_FREE_PREVIEW_ENABLED",
    "ZABBOT_FLASHCARDS_FREE_PREVIEW_IDS",
  ] as const;
  const prior = names.map(name => process.env[name]);
  try {
    delete process.env.ZABBOT_SUBSCRIPTION_GATING_ENFORCE;
    process.env.ZABBOT_FLASHCARDS_FREE_PREVIEW_ENABLED = "true";
    process.env.ZABBOT_FLASHCARDS_FREE_PREVIEW_IDS = FIVE_IDS.join(",");
    assert.equal(configuredFlashcardPreviewIds(), null);

    process.env.ZABBOT_SUBSCRIPTION_GATING_ENFORCE = "true";
    delete process.env.ZABBOT_FLASHCARDS_FREE_PREVIEW_ENABLED;
    assert.equal(configuredFlashcardPreviewIds(), null);

    process.env.ZABBOT_FLASHCARDS_FREE_PREVIEW_ENABLED = "true";
    assert.deepEqual(configuredFlashcardPreviewIds(), FIVE_IDS);
    process.env.ZABBOT_FLASHCARDS_FREE_PREVIEW_IDS = FIVE_IDS.slice(0, 4).join(",");
    assert.equal(configuredFlashcardPreviewIds(), null);
    process.env.ZABBOT_FLASHCARDS_FREE_PREVIEW_IDS = [...FIVE_IDS.slice(0, 4), FIVE_IDS[0]].join(",");
    assert.equal(configuredFlashcardPreviewIds(), null);
    process.env.ZABBOT_FLASHCARDS_FREE_PREVIEW_IDS = [...FIVE_IDS.slice(0, 4), "not-a-uuid"].join(",");
    assert.equal(configuredFlashcardPreviewIds(), null);
    delete process.env.ZABBOT_FLASHCARDS_FREE_PREVIEW_IDS;
    assert.equal(configuredFlashcardPreviewIds(), null);
  } finally {
    names.forEach((name, index) => {
      if (prior[index] === undefined) delete process.env[name];
      else process.env[name] = prior[index];
    });
  }
});
