import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeTranscript, transcriptSimilarity, transcriptScore, transcriptFeedback } from "../src/services/transcription-scoring";

test("exact recognized phrase is 100% identical, ignoring punctuation and case", () => {
  assert.equal(transcriptScore("Ẹ káàrọ̀!", "ẹ káàrọ̀"), 1);
});

test("Yorùbá lexical tone marks are not silently stripped from transcript comparison", () => {
  assert.equal(normalizeTranscript("ìlú"), "ìlú");
  assert.equal(normalizeTranscript("ílú"), "ílú");
  assert.ok(transcriptScore("ìlú", "ílú") < 1);
});

test("different words and empty recognized speech never score perfectly", () => {
  assert.equal(transcriptScore("hello", "goodbye"), 0);
  assert.equal(transcriptScore("", "ẹ káàrọ̀"), 0);
  assert.equal(transcriptScore("ẹ káàrọ̀", ""), 0);
});

test("transcript scoring stays finite and in the 0..1 range across sample pairs", () => {
  for (const [a, b] of [
    ["Báwo ni", "Báwo ni"],
    ["Mo wà dáadáa", "Mo wà"],
    ["Good morning", "Good evening"],
    ["  ", "Word"],
  ]) {
    const value = transcriptSimilarity(a, b);
    assert.ok(Number.isFinite(value));
    assert.ok(value >= 0 && value <= 1);
  }
});

test("feedback does not claim measured Yorùbá tones or perfect pronunciation", () => {
  for (const score of [0, 0.45, 0.7, 0.95, 1]) {
    const feedback = transcriptFeedback(score);
    assert.match(feedback, /tone/i);
    assert.doesNotMatch(feedback, /pronunciation is perfect/i);
  }
});
