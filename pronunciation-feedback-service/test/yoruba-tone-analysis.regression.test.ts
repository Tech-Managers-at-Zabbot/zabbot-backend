import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import path from "node:path";
import {
  analyzeYorubaTones,
  extractVowelTones,
  expectedRelativeToneScore,
  syllableMedians,
} from "../src/services/yoruba-tone-analysis";

const RATE = 16000;

/** Generate two syllable vowel-like pure-voiced segments at selected semitone levels. */
function voicedWord(baseHz: number, offsets: number[], seconds = 1.6): Float32Array {
  const length = Math.floor(RATE * seconds);
  const audio = new Float32Array(length);
  let phase = 0;
  for (let i = 0; i < length; i++) {
    const part = Math.min(offsets.length - 1, Math.floor(i / length * offsets.length));
    const freq = baseHz * Math.pow(2, offsets[part] / 12);
    phase += 2 * Math.PI * freq / RATE;
    const ramp = Math.min(1, i / 240, (length - i - 1) / 240);
    audio[i] = 0.25 * Math.max(0, ramp) * (Math.sin(phase) + 0.08 * Math.sin(2 * phase));
  }
  return audio;
}

test("diacritics: dot-below is vowel identity, NOT a low tone", () => {
  assert.deepEqual(extractVowelTones("ẹyin"), ["M", "M"]);
  assert.deepEqual(extractVowelTones("ẸYIN"), ["M", "M"]);
  assert.deepEqual(extractVowelTones("ẹ̀yín"), ["L", "H"]);
  assert.deepEqual(extractVowelTones("ilé"), ["M", "H"]);
  assert.deepEqual(extractVowelTones("ìlú"), ["L", "H"]);
  assert.deepEqual(extractVowelTones("àgbà"), ["L", "L"]);
  assert.deepEqual(extractVowelTones("ọ̀rọ̀"), ["L", "L"]);
});

test("unknown or unsafe spelling never fabricates syllable guidance", () => {
  assert.equal(extractVowelTones(""), null);
  assert.equal(extractVowelTones("ẹ"), null);
  assert.equal(extractVowelTones("ẹyin rere"), null);
  assert.equal(extractVowelTones("ẹyin1"), null);
  assert.equal(extractVowelTones("ẹ̃yin"), null);
  assert.equal(extractVowelTones("ẹ̀́yin"), null);
});

test("mid-mid EGG reference: level learner outranks a falling second syllable", () => {
  const reference = voicedWord(170, [0, 0]);
  const correct = analyzeYorubaTones("ẹyin", reference, voicedWord(245, [0, 0]));
  const falling = analyzeYorubaTones("ẹyin", reference, voicedWord(245, [0, -5]));
  const rising = analyzeYorubaTones("ẹyin", reference, voicedWord(245, [0, 5]));
  assert.ok(correct && falling && rising);
  assert.equal(correct.expectedPattern.join(""), "MM");
  assert.ok(correct.interSyllableScore > falling.interSyllableScore + 0.12,
    "correct: " + correct.interSyllableScore + ", falling: " + falling.interSyllableScore);
  assert.ok(correct.interSyllableScore > rising.interSyllableScore + 0.12);
  assert.ok(correct.learnerPatternScore > falling.learnerPatternScore);
});

test("cross-speaker low-to-high word: baritone reference and soprano learner match relative target", () => {
  const reference = voicedWord(112, [-3, 3]);
  const matching = analyzeYorubaTones("ìlú", reference, voicedWord(225, [-3, 3]));
  const wrong = analyzeYorubaTones("ìlú", reference, voicedWord(225, [3, -3]));
  assert.ok(matching && wrong);
  assert.equal(matching.expectedPattern.join(""), "LH");
  assert.ok(matching.interSyllableScore > wrong.interSyllableScore + 0.10);
});

test("silence or insufficient pitched evidence cannot produce a syllable verdict", () => {
  const reference = voicedWord(175, [0, 0]);
  assert.equal(analyzeYorubaTones("ẹyin", reference, new Float32Array(RATE)), null);
  assert.equal(analyzeYorubaTones(null, reference, reference), null);
  assert.equal(syllableMedians([10, 20, 30], 2), null);
});

test("tone-pattern comparison favors prescribed relative rises and falls", () => {
  assert.ok(expectedRelativeToneScore(["L", "H"], [-150, 150]) >
    expectedRelativeToneScore(["L", "H"], [150, -150]));
  assert.ok(expectedRelativeToneScore(["M", "M"], [0, 15]) >
    expectedRelativeToneScore(["M", "M"], [0, -400]));
});

test("new analysis is gated and does not change existing Pàrà user-facing remarks or interface", () => {
  const source = fs.readFileSync(path.join(__dirname, "../src/services/pronunciation-feedback.service.ts"), "utf8");
  assert.match(source, /process\.env\.ZABBOT_PARA_ACOUSTIC_SCORING_V1 === "true"/);
  assert.match(source, /trustedYorubaWord = masterPronunciation\.get\("yorubaWord"\)/);
  assert.match(source, /analyzeYorubaTones\(\s*trustedYorubaWord,/);
  assert.match(source, /0\.55 \* acoustic\.score \+ 0\.25 \* syllableScore \+ 0\.20 \* lexicalMatch/);
  assert.match(source, /selectedSimilarity = acoustic\.score \* 0\.6 \+ lexicalMatch \* 0\.4/);
  assert.match(source, /Excellent! Your pronunciation is perfect or close to perfect\./);
  assert.match(source, /Good attempt — there is room for improvement\./);
  assert.match(source, /Needs improvement — listen and try again\./);
});

test("trusted hyphenated Yorùbá compounds retain exact tone pattern", () => {
  const compound = extractVowelTones("MẸ́Ẹ̀-D-ÓGÚN");
  assert.deepEqual(compound, extractVowelTones("MẸ́Ẹ̀DÓGÚN"));
  assert.ok(compound && compound.length >= 2);
  assert.deepEqual(extractVowelTones("ÌLÙ"), ["L","L"]);
  assert.deepEqual(extractVowelTones("OMI"), ["M","M"]);
});
