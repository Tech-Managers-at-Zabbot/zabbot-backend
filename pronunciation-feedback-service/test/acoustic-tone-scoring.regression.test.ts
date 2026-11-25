import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import {
  compareAcousticTones,
  normalizedPitchContour,
  contourDistance,
  repairIsolatedOctaveFrames,
} from "../src/services/acoustic-tone-scoring";
import { isolateActiveSpeech } from "../src/services/para-pitch-feedback";

const sampleRate = 16000;

/** Generate real PCM instead of mocking pitch estimates. */
function generateSpeechLikeSignal(
  baseFrequency: number,
  pitchContour: (fraction: number) => number,
  duration = 1.5,
  amplitude = 0.25,
): Float32Array {
  const length = Math.floor(sampleRate * duration);
  const samples = new Float32Array(length);
  let phase = 0;
  for (let i = 0; i < length; i++) {
    const fraction = i / length;
    const hz = baseFrequency * Math.pow(2, pitchContour(fraction) / 12);
    phase += 2 * Math.PI * hz / sampleRate;
    const envelope = Math.min(1, fraction * 30, (1 - fraction) * 30);
    samples[i] = amplitude * Math.max(0, envelope) *
      (Math.sin(phase) + 0.1 * Math.sin(2 * phase));
  }
  return samples;
}

const riseFall = (t: number): number => t <= 0.5 ? t * 6 : (1 - t) * 6;
const fallRise = (t: number): number => -riseFall(t);
const flat = (_t: number): number => 0;

test("independent pitch centering prevents baritone/soprano systematic penalty", () => {
  const low = generateSpeechLikeSignal(115, riseFall);
  const high = generateSpeechLikeSignal(235, riseFall);
  const result = compareAcousticTones(low, high);
  assert.ok(result, "both speaker ranges should yield usable voiced pitch");
  assert.ok(result.score >= 0.65, "speaker-centered pitch should match; got " + result.score);
  assert.ok(result.meanCentsDifference < 210);
});

test("different pitch movements are distinguishable at the same vocal range", () => {
  const reference = generateSpeechLikeSignal(170, riseFall);
  const matching = compareAcousticTones(reference, generateSpeechLikeSignal(170, riseFall));
  const opposite = compareAcousticTones(reference, generateSpeechLikeSignal(170, fallRise));
  assert.ok(matching && opposite);
  assert.ok(matching.score > opposite.score + 0.15,
    "opposite contour should score lower: " + matching.score + " vs " + opposite.score);
});

test("tempo differences are tolerated without erasing the shape of tones", () => {
  const reference = generateSpeechLikeSignal(140, riseFall, 1.2);
  const learner = generateSpeechLikeSignal(180, riseFall, 1.8);
  const comparison = compareAcousticTones(reference, learner);
  assert.ok(comparison);
  assert.ok(comparison.score >= 0.6);
});

test("silent, short, and unvoiced clips cannot generate confident tone scores", () => {
  const reference = generateSpeechLikeSignal(150, riseFall);
  assert.equal(compareAcousticTones(reference, new Float32Array(sampleRate)), null);
  assert.equal(compareAcousticTones(new Float32Array(40), reference), null);
  assert.equal(normalizedPitchContour(new Float32Array(sampleRate)), null);
});

test("large duration mismatch is rejected rather than confidently aligned", () => {
  assert.equal(contourDistance(new Array(10).fill(0), new Array(30).fill(0)), Infinity);
});

test("returned experimental similarity stays finite and bounded", () => {
  for (const [a, b] of [
    [generateSpeechLikeSignal(120, flat), generateSpeechLikeSignal(240, flat)],
    [generateSpeechLikeSignal(130, riseFall), generateSpeechLikeSignal(230, fallRise)],
  ] as const) {
    const result = compareAcousticTones(a, b);
    assert.ok(result);
    assert.ok(Number.isFinite(result.score) && result.score >= 0 && result.score <= 1);
    assert.ok(Number.isFinite(result.meanCentsDifference));
  }
});

test("acoustic experiment does not modify existing learner-facing copy or entitlement rules", () => {
  const source = fs.readFileSync(path.join(__dirname, "../src/services/pronunciation-feedback.service.ts"), "utf8");
  assert.match(source, /process\.env\.ZABBOT_PARA_ACOUSTIC_SCORING_V1 === "true"/);
  assert.match(source, /selectedSimilarity = acoustic\.score \* 0\.6 \+ lexicalMatch \* 0\.4/);
  assert.match(source, /const finalScore = Math\.round/);
  assert.match(source, /Excellent! Your pronunciation is perfect or close to perfect\./);
  assert.match(source, /Good attempt — there is room for improvement\./);
  assert.match(source, /Needs improvement — listen and try again\./);
});


test("same recognized syllables but distinctly level versus falling pitch are not scored alike", () => {
  // Synthetic two-syllable test: both signals correspond to the same text.
  // Pitch difference must arise in acoustic comparison, not transcript matching.
  const steady = generateSpeechLikeSignal(220, flat, 1.3);
  const falling = generateSpeechLikeSignal(180, t => -5 * t, 1.3);
  const same = compareAcousticTones(steady, steady);
  const mismatched = compareAcousticTones(steady, falling);
  assert.ok(same && mismatched);
  assert.ok(same.score - mismatched.score >= 0.12,
    "level vs falling pitch should differ: " + same.score + " versus " + mismatched.score);
});

test("different natural voice pitch with identical falling shape remains a good match", () => {
  const low = generateSpeechLikeSignal(110, t => -4 * t, 1.3);
  const high = generateSpeechLikeSignal(225, t => -4 * t, 1.3);
  const result = compareAcousticTones(low, high);
  assert.ok(result);
  assert.ok(result.score > 0.65, "matching contours across voice range scored " + result.score + ", distance " + result.meanCentsDifference);
});

test("short spoken word with long trailing silence is scored using active audio only", () => {
  const reference = generateSpeechLikeSignal(155, riseFall, 0.6);
  const learner = generateSpeechLikeSignal(235, riseFall, 0.85);
  const paddedReference = new Float32Array(sampleRate * 3.6);
  const paddedLearner = new Float32Array(sampleRate * 4.2);
  paddedReference.set(reference);
  paddedLearner.set(learner);
  const trimmedReference = isolateActiveSpeech(paddedReference);
  const trimmedLearner = isolateActiveSpeech(paddedLearner);
  assert.ok(trimmedReference && trimmedLearner);
  assert.ok(trimmedReference.length < paddedReference.length);
  const result = compareAcousticTones(trimmedReference, trimmedLearner);
  assert.ok(result, "valid speech should be compared despite unrelated trailing silence");
  assert.ok(result.score >= 0 && result.score <= 1);
});

test("API uses active speech consistently; unscorable audio returns 422 rather than 500", () => {
  const source = fs.readFileSync(path.join(__dirname, "../src/services/pronunciation-feedback.service.ts"), "utf8");
  assert.match(source, /isolateActiveSpeech\(masterRawAudio\)/);
  assert.match(source, /isolateActiveSpeech\(userRawAudio\)/);
  assert.match(source, /compareAcousticTones\(acousticReference, acousticLearner\)/);
  assert.match(source, /"We could not measure enough clear voiced speech/);
  assert.match(source, /422,/);
  assert.match(source, /if \(error\?\.isOperational && error\?\.statusCode\) throw error/);
});

test("standalone Pàrà requires an explicit reference voice and echoes the selected baseline", () => {
  const source = fs.readFileSync(path.join(__dirname, "../src/services/pronunciation-feedback.service.ts"), "utf8");
  assert.doesNotMatch(source, /voice\s*=\s*"femaleVoice"/);
  assert.match(source, /voice !== "maleVoice" && voice !== "femaleVoice"/);
  assert.match(source, /url = masterPronunciation\.get\(voice\) as string/);
  assert.match(source, /referenceVoice: voice, referencePronunciationId: audioId/);
  assert.match(source, /"Reference voice selection is required \(maleVoice or femaleVoice\)\."/);
  const controller = fs.readFileSync(path.join(__dirname, "../src/controllers/referencePronunciation.controller.ts"), "utf8");
  assert.match(controller, /const \{ voice, isInLesson/);
  assert.match(controller, /referencePronunciationId,\s*voice,/);
});

test("isolated octave tracker errors are corrected; true sustained tone changes remain", () => {
  const original = [180, 184, 364, 181, 182];
  const fixed = repairIsolatedOctaveFrames(original);
  assert.equal(fixed.repaired, 1);
  assert.ok(Math.abs((fixed.pitches[2] ?? 0) - 182) < 4);
  const prolonged = repairIsolatedOctaveFrames([180, 184, 364, 365, 368, 185]);
  assert.equal(prolonged.repaired, 0);
  assert.deepEqual(prolonged.pitches, [180, 184, 364, 365, 368, 185]);
  const gap = repairIsolatedOctaveFrames([180, null, 364, 181, 182]);
  assert.equal(gap.repaired, 0);
});

test("corrected acoustic scoring remains bounded and retains discrimination", () => {
  const target = generateSpeechLikeSignal(175, riseFall);
  const close = generateSpeechLikeSignal(230, riseFall);
  const incorrect = generateSpeechLikeSignal(175, fallRise);
  const positive = compareAcousticTones(target, close, true);
  const negative = compareAcousticTones(target, incorrect, true);
  assert.ok(positive && negative);
  assert.ok(positive.score > negative.score + 0.12);
  assert.ok(positive.score <= 1 && negative.score >= 0);
});
