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

test("unreliable learner word with trusted reference yields ungraded evidence, never unearned credit", () => {
  const result = decideParaAsrEvidence({ ...good, learnerTranscript: "different word" });
  assert.equal(result.kind, "ungraded");
});

test("missing acoustic evidence never produces a fabricated score", () => {
  for (const attempt of [
    { ...good, acousticScore: null },
    { ...good, acousticScore: Number.NaN },
    { ...good, acousticReferenceVoicedFrames: 2 },
    { ...good, expectedWord: null },
  ]) {
    const result = decideParaAsrEvidence(attempt);
    assert.equal(result.kind, "ungraded");
    assert.ok(!("score" in result));
  }
});

test("limited graph alignment does NOT veto independent valid syllable analysis", () => {
  for (const confidence of ["limited", null] as const) {
    const result = decideParaAsrEvidence({ ...good, alignmentConfidence: confidence });
    assert.equal(result.kind, "retain");
    if (result.kind === "retain") assert.ok(result.score > 0.7);
  }
});

test("missing syllable evidence only falls back to 60/40 when both words are reliably recognized", () => {
  for (const override of [
    { syllableToneScore: null, referencePatternScore: null },
    { syllableToneScore: 0.82, referencePatternScore: 0.3 },
  ]) {
    const result = decideParaAsrEvidence({ ...good, ...override, alignmentConfidence: "limited" });
    assert.equal(result.kind, "retainFallback");
    if (result.kind === "retainFallback") {
      assert.ok(Math.abs(result.score - (0.6 * good.acousticScore + 0.4 * result.asrScore)) < 1e-10);
    }
    for (const referenceTranscript of ["", "Buh-bye"]) {
      const uncertain = decideParaAsrEvidence({ ...good, ...override, referenceTranscript });
      assert.equal(uncertain.kind, "ungraded");
      assert.ok(!("score" in uncertain));
    }
  }
});

test("STAGING standalone scoring uses decision only after acoustic and syllable evidence checks", () => {
  const source = fs.readFileSync(path.join(__dirname, "../src/services/pronunciation-feedback.service.ts"), "utf8");
  assert.ok(source.includes('process.env.ZABBOT_PARA_ACOUSTIC_SCORING_V1 === "true"'));
  assert.ok(source.includes('const conditionalAsrEnabled = !isInLesson'));
  assert.ok(source.includes("decideParaAsrEvidence({"));
  assert.ok(source.includes('if (decision.kind === "ungraded")'));
  assert.ok(source.includes('assessmentStatus: "ungraded"'));
  assert.ok(source.includes("selectedSimilarity = decision.score"));
  assert.ok(source.includes('scorePath = "acoustic-syllable-transcript"'));
  assert.ok(source.includes('scorePath = "acoustic-transcript-fallback"'));
  assert.ok(source.includes("compareShortWordAcousticTones("));
});

test("genuine tonal mismatch produces a low score, not a false unavailable-evidence retry", () => {
  const result = decideParaAsrEvidence({ ...good, acousticScore: 0.1, syllableToneScore: 0.15 });
  assert.equal(result.kind, "retain");
  if(result.kind === "retain") assert.ok(result.score < 0.4);
});

test("supported short words and hyphenated words are not rejected as broken recordings", () => {
  for (const word of ["BÀTÀ", "Ẹ̀JẸ̀", "ÌLÙ", "OMI", "GBOGBO", "MẸ́Ẹ̀-D-ÓGÚN"]) {
    const result = decideParaAsrEvidence({
      ...good, expectedWord: word,
      syllableToneScore: null, referencePatternScore: null, alignmentConfidence: "limited",
      referenceTranscript: "", learnerTranscript: "",
    });
    assert.equal(result.kind, "ungraded", word);
    assert.ok(!("score" in result));
  }
});
