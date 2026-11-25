import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { decideParaAsrEvidence } from "../src/services/para-asr-evidence-gating";

const good = {
  expectedWord: "GBOGBO",
  referenceTranscript: "Gbo gbo",
  learnerTranscript: "Gbogbo",
  acousticScore: 0.82,
  acousticReferenceVoicedFrames: 25,
  acousticLearnerVoicedFrames: 32,
  syllableToneScore: 0.941,
  referencePatternScore: 0.97,
  alignmentConfidence: "moderate" as const,
};

test("when both ASR outputs are usable, retain original 55/25/20 formula", () => {
  const result = decideParaAsrEvidence(good);
  assert.equal(result.kind, "retain");
  if(result.kind !== "retain") return;
  assert.equal(result.asrScore, 0.86);
  assert.ok(Math.abs(result.score - (0.55 * 0.82 + 0.25 * 0.941 + 0.20 * result.asrScore)) < 1e-10);
});

test("unreliable reference ASR is excluded, preserving 55:25 evidence ratio", () => {
  for(const ref of ["", "Buh-bye."]) {
    const result = decideParaAsrEvidence({ ...good, referenceTranscript: ref, learnerTranscript: "Blah, blah." });
    assert.equal(result.kind, "withhold");
    if(result.kind === "withhold") {
      assert.equal(result.asrScore, null);
      assert.ok(Math.abs(result.score - ((0.55 * 0.82 + 0.25 * 0.941) / 0.80)) < 1e-10);
    }
  }
});

test("unreliable learner word with trusted reference requests retry, never unearned credit", () => {
  const result = decideParaAsrEvidence({ ...good, learnerTranscript: "different word" });
  assert.equal(result.kind, "retry");
});

test("insufficient acoustic evidence still requests another recording", () => {
  const variants = [
    { ...good, acousticScore: null },
    { ...good, acousticScore: Number.NaN },
    { ...good, acousticReferenceVoicedFrames: 2 },
    { ...good, expectedWord: null },
  ];
  for (const attempt of variants) {
    const result = decideParaAsrEvidence(attempt);
    assert.equal(result.kind, "retry");
    assert.ok(!("score" in result));
  }
});

test("limited graph boundaries cannot reject available independent tone evidence", () => {
  for (const confidence of ["limited", null] as const) {
    const result = decideParaAsrEvidence({ ...good, alignmentConfidence: confidence });
    assert.equal(result.kind, "retain");
    if (result.kind === "retain") assert.ok(result.score > 0.7);
  }
});

test("an unavailable syllable score falls back to old 60/40 acoustic+text rather than 422", () => {
  for (const variant of [
    { syllableToneScore: null, referencePatternScore: null },
    { syllableToneScore: 0.8, referencePatternScore: 0.5 },
  ]) {
    const result = decideParaAsrEvidence({ ...good, ...variant, alignmentConfidence: "limited" });
    assert.equal(result.kind, "fallback");
    if (result.kind === "fallback") {
      const expectedText = 0.86;
      assert.equal(result.asrScore, expectedText);
      assert.ok(Math.abs(result.score - (0.60 * good.acousticScore + 0.40 * expectedText)) < 1e-10);
    }
  }
});

test("unrecognized baseline text does not manufacture a high grade from missing syllables", () => {
  const r = decideParaAsrEvidence({
    ...good, expectedWord: "ÌLÙ", referenceTranscript: "Buh-bye",
    learnerTranscript: "Woof, woof", syllableToneScore: null,
    referencePatternScore: null, alignmentConfidence: "limited",
  });
  assert.equal(r.kind, "fallback");
  if (r.kind === "fallback") {
    assert.ok(r.score <= 0.6 * good.acousticScore + 0.001);
    assert.ok(r.score < 0.5);
  }
});

test("STAGING standalone scoring uses decision only after acoustic and syllable evidence checks", () => {
  const source = fs.readFileSync(path.join(__dirname, "../src/services/pronunciation-feedback.service.ts"), "utf8");
  assert.ok(source.includes('process.env.ZABBOT_PARA_ACOUSTIC_SCORING_V1 === "true"'));
  assert.ok(source.includes('const conditionalAsrEnabled = !isInLesson'));
  assert.ok(source.includes("decideParaAsrEvidence({"));
  assert.ok(source.includes('throw errorUtilities.createError(decision.reason, 422)'));
  assert.ok(source.includes("selectedSimilarity = decision.score"));
  assert.ok(source.includes('scorePath = "acoustic-syllable-transcript"'));
  assert.ok(source.includes('scorePath = "acoustic-transcript-fallback"'));
  assert.ok(source.includes('decision.kind === "fallback"'));
});

test("genuine tonal mismatch produces a low score, not a false unavailable-evidence retry", () => {
  const result = decideParaAsrEvidence({ ...good, acousticScore: 0.1, syllableToneScore: 0.15 });
  assert.equal(result.kind, "retain");
  if(result.kind === "retain") assert.ok(result.score < 0.4);
});
