/**
 * Experimental syllable-proxy tonal assessment, behind the existing
 * ZABBOT_PARA_ACOUSTIC_SCORING_V1 flag. No changes to learner-facing wording.
 *
 * WARNING: vowel nuclei are not an authoritative syllabification of Yorùbá.
 * Proportional voiced-frame windows are an approximation, NOT forced alignment.
 * This only supplies a cautious additional signal when a trusted, correctly
 * tone-marked single Yorùbá word is available from the reference database.
 */
import { normalizedPitchContour } from "./acoustic-tone-scoring";

export type YorubaTone = "L" | "M" | "H";

export type SyllableToneEvidence = {
  syllable: number;
  expected: YorubaTone;
  referenceCents: number;
  learnerCents: number;
};

export type ToneAnalysis = {
  expectedPattern: YorubaTone[];
  referencePatternScore: number;
  learnerPatternScore: number;
  interSyllableScore: number;
  evidence: SyllableToneEvidence[];
};

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const VOWELS = /^[aeẹioọu]$/u;
const COMBINING = /\p{M}/u;
const TONE_HIGH = "\u0301";
const TONE_LOW = "\u0300";

/**
 * Extract only vowel-nucleus tone marks. Under-dotted ẹ and ọ are VOWEL
 * QUALITY (not low pitch). Unmarked vowels are mid.
 * A phrase, digit, unknown combining accent or contradictory tone is unsafe
 * for automated syllable scoring and is refused.
 */
export function extractVowelTones(word: string): YorubaTone[] | null {
  if (!word || word.trim() !== word || /\s|[0-9]/u.test(word)) return null;
  // Hyphens are orthographic separators, not sound nuclei. Preserve trusted
  // spelling elsewhere while ignoring only these separators for tone extraction.
  const normalized = word.replace(/[-‐‑–—]/gu, "");
  const graphemes = Array.from(normalized.normalize("NFD").toLocaleLowerCase("yo").matchAll(/(\P{M})(\p{M}*)/gu));
  const result: YorubaTone[] = [];
  for (const match of graphemes) {
    const base = match[1];
    const marks = match[2] || "";
    if (!/^[a-z]$/u.test(base)) return null;
    if (VOWELS.test(base) || (base === "e" && marks.includes("\u0323")) || (base === "o" && marks.includes("\u0323"))) {
      const isLow = marks.includes(TONE_LOW);
      const isHigh = marks.includes(TONE_HIGH);
      if (isHigh && isLow) return null;
      if ([...marks].some(mark => mark !== "\u0323" && mark !== TONE_HIGH && mark !== TONE_LOW)) return null;
      result.push(isLow ? "L" : isHigh ? "H" : "M");
    } else if ([...marks].some(mark => mark !== "\u0323")) {
      // A nasal diacritic or unusual spelling needs linguistic review.
      return null;
    }
  }
  // One-tone words cannot be assessed with relative speaker-normalized pitch;
  // more than 6 nuclei suggests a phrase or unsupported segmentation.
  return result.length >= 2 && result.length <= 6 ? result : null;
}

function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Sample robust central pitch from each approximate syllable interval. Unlike
 * absolute F0, differences between syllables remain comparable for a deep
 * reference voice and a naturally higher-pitched learner.
 */
export function syllableMedians(contour: number[], count: number): number[] | null {
  if (count < 2 || count > 6 || contour.length < count * 7) return null;
  const result: number[] = [];
  for (let part = 0; part < count; part++) {
    const begin = Math.floor((part + 0.20) * contour.length / count);
    const end = Math.ceil((part + 0.80) * contour.length / count);
    const values = contour.slice(begin, end).filter(Number.isFinite).sort((a, b) => a - b);
    if (values.length < 3) return null;
    result.push(values[Math.floor(values.length / 2)]);
  }
  return result;
}

/**
 * Compare adjacent syllables to the written tone ordering. Mid-to-mid should
 * be near level; H after M should increase; L after M should decrease.
 * Magnitudes are provisional thresholds, NOT calibrated phonetic cutoffs.
 */
export function expectedRelativeToneScore(tone: YorubaTone[], cents: number[]): number {
  if (tone.length !== cents.length || tone.length < 2) return 0;
  const levels = { L: -1, M: 0, H: 1 };
  const pairs: number[] = [];
  for (let i = 1; i < tone.length; i++) {
    const targetDelta = levels[tone[i]] - levels[tone[i - 1]];
    const observed = cents[i] - cents[i - 1];
    let error: number;
    if (targetDelta === 0) {
      // Natural coarticulation / phrase-final lowering is expected; large
      // differences should count against an expected level sequence.
      error = Math.max(0, Math.abs(observed) - 85);
    } else {
      // At least 70 cents in the expected direction, but do not penalize
      // naturally larger changes in a speaker with a different pitch range.
      const aligned = Math.sign(targetDelta) * observed;
      error = Math.max(0, 70 - aligned);
    }
    pairs.push(clamp(Math.exp(-error / 200)));
  }
  return mean(pairs);
}

/**
 * Calibrate against the actual reference too: don't overrule the reference
 * recording with an unreliable word split or badly marked metadata. A pattern
 * is considered only when the trusted reference is sufficiently consistent
 * with its spelling. Do not fabricate a passing tone score otherwise.
 */
export function analyzeYorubaTones(
  word: string | null | undefined,
  referenceAudio: Float32Array,
  learnerAudio: Float32Array,
): ToneAnalysis | null {
  const expected = extractVowelTones(word ?? "");
  if (!expected) return null;
  const referenceContour = normalizedPitchContour(referenceAudio);
  const learnerContour = normalizedPitchContour(learnerAudio);
  if (!referenceContour || !learnerContour) return null;
  const referenceCents = syllableMedians(referenceContour, expected.length);
  const learnerCents = syllableMedians(learnerContour, expected.length);
  if (!referenceCents || !learnerCents) return null;

  const referencePatternScore = expectedRelativeToneScore(expected, referenceCents);
  const learnerPatternScore = expectedRelativeToneScore(expected, learnerCents);
  // The reference is the ground truth audio. If the reference itself does
  // not align with the approximate syllable mapping, fall back to acoustic
  // contour comparison and avoid imposing a misleading pattern penalty.
  if (referencePatternScore < 0.65) return null;

  const relativeDistances: number[] = [];
  for (let i = 1; i < expected.length; i++) {
    const referenceDelta = referenceCents[i] - referenceCents[i - 1];
    const learnerDelta = learnerCents[i] - learnerCents[i - 1];
    relativeDistances.push(Math.abs(referenceDelta - learnerDelta));
  }
  const distance = mean(relativeDistances);
  const interSyllableScore = clamp(Math.exp(-distance / 210));
  return {
    expectedPattern: expected,
    referencePatternScore,
    learnerPatternScore,
    interSyllableScore,
    evidence: expected.map((tone, index) => ({
      syllable: index + 1,
      expected: tone,
      referenceCents: Math.round(referenceCents[index]),
      learnerCents: Math.round(learnerCents[index]),
    })),
  };
}
