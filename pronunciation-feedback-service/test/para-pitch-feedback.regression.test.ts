import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { buildParaPitchFeedback, estimateSyllableBoundaries, isolateActiveSpeech, referenceSyllableLabels } from "../src/services/para-pitch-feedback";
import { timedPitchContour } from "../src/services/acoustic-tone-scoring";

const RATE = 16000;
function recording(hz: number, semitones: number[], duration = 1.6): Float32Array {
  const result = new Float32Array(Math.round(RATE * duration));
  let phase = 0;
  for (let i = 0; i < result.length; i++) {
    const position = i / result.length;
    const index = Math.min(semitones.length - 1, Math.floor(position * semitones.length));
    const f = hz * Math.pow(2, semitones[index] / 12);
    phase += 2 * Math.PI * f / RATE;
    // Short but clearly voiced segments with a break at syllable midpoint.
    const local = position * semitones.length - index;
    const envelope = Math.min(1, local * 28, (1 - local) * 28);
    result[i] = 0.27 * Math.max(0, envelope) * Math.sin(phase);
  }
  return result;
}

test("silence and unsupported metadata do not create confident guidance", () => {
  const ref = recording(170, [0, 0]);
  assert.equal(buildParaPitchFeedback("ẹyin", ref, new Float32Array(RATE)), null);
  assert.equal(buildParaPitchFeedback("ẹyin rere", ref, ref), null);
  assert.equal(buildParaPitchFeedback(null, ref, ref), null);
  assert.equal(estimateSyllableBoundaries(new Float32Array(30), 2), null);
});

test("time-preserving pitch includes the gap between voiced regions", () => {
  const audio = recording(175, [0, 0]);
  const points = timedPitchContour(audio);
  assert.ok(points && points.length > 12);
  assert.ok(points.every(point => point.x >= 0 && point.x <= 1));
  assert.ok(points.every((point, index) => !index || point.x > points[index - 1].x));
});

test("egg mid-mid keeps solfege and cross-speaker pitch-relative graph data", () => {
  const result = buildParaPitchFeedback("ẹyin", recording(145, [0, 0]), recording(245, [0, 0]));
  assert.ok(result);
  assert.equal(result.version, 2);
  assert.deepEqual(result.expectedPattern, ["M", "M"]);
  assert.deepEqual(result.syllables.map(s => s.solfege), ["RE", "RE"]);
  assert.ok(result.referencePitch.length > 10 && result.learnerPitch.length > 10);
  assert.ok(result.syllables.every(s => s.start < s.end));
});

test("same spelling with opposite syllable movement does not label it a proven match", () => {
  const result = buildParaPitchFeedback("ẹyin", recording(150, [0, 0]), recording(235, [0, -5]));
  assert.ok(result);
  assert.equal(result.syllables[0].status, "uncertain");
  assert.ok(result.syllables[1].status !== "close" || result.confidence === "limited",
    "misleading close verdict for falling second syllable");
});

test("API guidance is fully opt-in; legacy response shape remains", () => {
  const source = fs.readFileSync(path.join(__dirname, "../src/services/pronunciation-feedback.service.ts"), "utf8");
  assert.ok(source.includes('process.env.ZABBOT_PARA_PITCH_FEEDBACK_V2 === "true"'));
  assert.ok(source.includes("...(pitchFeedback ? { pitchFeedback } : {})"));
  assert.ok(source.includes("buildParaPitchFeedback(\n") && source.includes("acousticReference!,\n            acousticLearner!,"));
});

test("long trailing silence does not erase the pitch graph for short EGG speech", () => {
  const shortReference = recording(170, [0, 0], 0.64);
  const shortLearner = recording(210, [0, 0], 0.74);
  const reference = new Float32Array(RATE * 2);
  const learner = new Float32Array(RATE * 2);
  reference.set(shortReference);
  learner.set(shortLearner);
  const clipped = isolateActiveSpeech(reference);
  assert.ok(clipped && clipped.length < RATE);
  const feedback = buildParaPitchFeedback("ẹyin", reference, learner);
  assert.ok(feedback, "should produce time-aligned graph even when syllable verdict is uncertain");
  assert.equal(feedback.expectedPattern.join(""), "MM");
  assert.equal(feedback.syllables[0].status, "uncertain");
});

test("quiet or silent clips never produce invented tone guidance", () => {
  assert.equal(isolateActiveSpeech(new Float32Array(RATE * 2)), null);
});

test("rendered labels preserve complete trusted Yoruba syllables rather than vowel fragments", () => {
  assert.deepEqual(referenceSyllableLabels("ẹyin"), ["ẹ", "yin"]);
  assert.deepEqual(referenceSyllableLabels("ẸYIN"), ["Ẹ", "YIN"]);
  assert.deepEqual(referenceSyllableLabels("ilé"), ["i", "lé"]);
  assert.deepEqual(referenceSyllableLabels("ìlú"), ["ì", "lú"]);
  assert.deepEqual(referenceSyllableLabels("ọ̀rọ̀"), ["ọ̀", "rọ̀"]);
});

test("hyphenated compound preserves trusted uppercase syllables without treating separators as vowels", () => {
  const labels = referenceSyllableLabels("MẸ́Ẹ̀-D-ÓGÚN");
  assert.ok(labels.length >= 3);
  assert.ok(labels.every(x => !x.includes("-")));
  assert.equal(labels.join(""), "MẸ́Ẹ̀DÓGÚN");
});
