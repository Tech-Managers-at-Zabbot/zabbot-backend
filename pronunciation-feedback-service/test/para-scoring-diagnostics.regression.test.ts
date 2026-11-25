import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { buildParaScoringDiagnostics, wordIdentityAgreement } from "../src/services/para-scoring-diagnostics";

const base = {
  referenceId: "trusted-gbogbo",
  voice: "femaleVoice",
  expectedWord: "gbogbo",
  referenceTranscript: "Gbogbo.",
  learnerTranscript: "Gbo gbo!",
  acousticScore: 0.67,
  syllableScore: 0.94,
  syllablePatternScore: 0.95,
  interSyllableScore: 0.93,
  transcriptComponent: 0.23,
  referenceAudio: null,
  learnerAudio: null,
};

test("trusted-word diagnostic normalizes harmless spaces and punctuation", () => {
  assert.equal(wordIdentityAgreement("Gbo gbo!", "gbogbo"), 1);
  assert.equal(wordIdentityAgreement("gbogbo", null), null);
  assert.equal(wordIdentityAgreement("", "gbogbo"), 0);
});

test("existing 55/25/20 score is decomposed precisely; shadow is separate", () => {
  const expected = 0.55 * 0.67 + 0.25 * 0.94 + 0.20 * 0.23;
  const d = buildParaScoringDiagnostics({
    ...base, path: "acoustic-syllable-transcript" as const, liveScore: Math.round(expected * 100) / 100,
  });
  assert.equal(d.scoring.path, "acoustic-syllable-transcript");
  assert.equal(d.scoring.reconstruction, Math.round(expected * 1000) / 1000);
  assert.equal(d.scoring.liveScore, 0.65);
  assert.equal(d.reference.voice, "femaleVoice");
  assert.equal(d.recognition.expectedWordAgreement, 1);
  assert.equal(d.shadowCalibration.isLearnerScore, false);
  assert.ok(d.shadowCalibration.score !== null);
  assert.ok(d.shadowCalibration.score > d.scoring.liveScore);
  assert.equal(d.pitchQuality.referenceOctaveJumpCandidates, null);
});

test("fallback scoring path is correctly labeled and cannot invent tone evidence", () => {
  const d = buildParaScoringDiagnostics({
    ...base, syllableScore: null, syllablePatternScore: null, interSyllableScore: null,
    transcriptComponent: 0.62, path: "acoustic-transcript-fallback", liveScore: 0.65,
  });
  assert.equal(d.scoring.weights.transcript, 0.4);
  assert.equal(d.scoring.weights.syllableTone, 0);
  assert.equal(d.scoring.components.syllableTone, null);
  assert.equal(d.scoring.reconstruction, 0.65);
  assert.equal(d.shadowCalibration.weights?.transcript, 0.05);
});

test("legacy score path has no fabricated calibration result", () => {
  const d = buildParaScoringDiagnostics({
    ...base, path: "legacy-text-only", acousticScore: null, syllableScore: null,
    transcriptComponent: 0.71, liveScore: 0.71,
  });
  assert.equal(d.shadowCalibration.score, null);
  assert.equal(d.scoring.reconstruction, 0.71);
});

test("the scoring diagnostic is gated, not involved in grading or feedback", () => {
  const source = fs.readFileSync(path.join(__dirname, "../src/services/pronunciation-feedback.service.ts"), "utf8");
  assert.ok(source.includes('process.env.ZABBOT_PARA_SCORING_DIAGNOSTICS_V1 === "true"'));
  assert.ok(source.includes("...(scoringDiagnostics ? { scoringDiagnostics } : {})"));
  assert.ok(source.indexOf("const scoringDiagnostics") > source.indexOf("const finalScore ="));
  assert.ok(source.indexOf("const scoringDiagnostics") < source.indexOf("let remark ="));
});
