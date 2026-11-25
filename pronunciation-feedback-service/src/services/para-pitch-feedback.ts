/**
 * STAGING-only learner pitch visualization and cautiously aligned tone guidance.
 * Boundary search uses short-time energy valleys near estimated nucleus positions.
 * This is NOT phonetic forced alignment. Missing evidence never creates a verdict.
 */
import { timedPitchContour } from "./acoustic-tone-scoring";
import { analyzeYorubaTones, extractVowelTones, type YorubaTone } from "./yoruba-tone-analysis";

export type ParaPitchFeedback = {
  version: 2;
  alignment: "estimated-energy-boundaries";
  confidence: "limited" | "moderate";
  expectedPattern: YorubaTone[];
  syllables: Array<{
    index: number;
    label: string;
    expected: YorubaTone;
    solfege: "DO" | "RE" | "MI";
    start: number;
    end: number;
    status: "practice" | "close" | "uncertain";
    differenceCents: number | null;
  }>;
  referencePitch: Array<{ x: number; cents: number }>;
  learnerPitch: Array<{ x: number; cents: number }>;
  guidance: string;
};

const RATE = 16000;
const HOP = 320;
const FRAME = 960;
const MAX_SECONDS = 10;
const MIN_ACTIVE_SECONDS = 0.3;
const solfege: Record<YorubaTone, "DO" | "RE" | "MI"> = { L: "DO", M: "RE", H: "MI" };
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));


function rms(audio: Float32Array, begin: number): number {
  let total = 0;
  for (let i = begin; i < Math.min(begin + FRAME, audio.length); i++) total += audio[i] * audio[i];
  return Math.sqrt(total / Math.max(1, Math.min(FRAME, audio.length - begin)));
}

/**
 * Crop the quiet tail after the spoken word before calculating normalized
 * syllable boundaries. The existing ffmpeg silence filter removes only the
 * beginning of a recording, and actual EGG clips can have >1 s trailing silence.
 * Retain short padding to avoid losing speech endings; do not change the WAV
 * sent to transcription or the existing overall scoring algorithm.
 */
export function isolateActiveSpeech(audio: Float32Array): Float32Array | null {
  if (audio.length < RATE * MIN_ACTIVE_SECONDS || audio.length > RATE * 60) return null;
  const energies: Array<{ start: number; energy: number }> = [];
  const limit = Math.min(audio.length, RATE * MAX_SECONDS);
  for (let start = 0; start + FRAME <= limit; start += HOP) {
    energies.push({ start, energy: rms(audio, start) });
  }
  if (!energies.length) return null;
  const maximum = Math.max(...energies.map(frame => frame.energy));
  const threshold = Math.max(0.012, maximum * 0.12);
  const active = energies.filter(frame => frame.energy > threshold);
  if (!active.length) return null;
  const start = Math.max(0, active[0].start - Math.round(RATE * 0.04));
  const end = Math.min(limit, active[active.length - 1].start + FRAME + Math.round(RATE * 0.10));
  return end - start >= RATE * MIN_ACTIVE_SECONDS ? audio.slice(start, end) : null;
}

/**
 * Boundary candidates are quiet short-time frames in a restricted interval
 * around each proportional syllable break. A weak valley or excessive timing
 * mismatch makes correction uncertain. Boundaries are not authoritative.
 */
export function estimateSyllableBoundaries(audio: Float32Array, count: number):
  { boundaries: number[]; quality: number } | null {
  if (count < 2 || count > 6 || audio.length < RATE * MIN_ACTIVE_SECONDS || audio.length > RATE * MAX_SECONDS) return null;
  const frameEnergies: number[] = [];
  for (let i = 0; i + FRAME <= audio.length; i += HOP) frameEnergies.push(rms(audio, i));
  if (frameEnergies.length < count * 8) return null;
  const boundaries = [0];
  let quality = 1;
  for (let k = 1; k < count; k++) {
    const center = k / count;
    const lower = Math.max(boundaries[k - 1] + 0.08, center - 0.11);
    const upper = Math.min(1 - (count - k) * 0.08, center + 0.11);
    if (lower >= upper) return null;
    let best = -1;
    let minimum = Infinity;
    let average = 0;
    let visited = 0;
    for (let j = Math.ceil(lower * (frameEnergies.length - 1)); j <= Math.floor(upper * (frameEnergies.length - 1)); j++) {
      if (j < 0 || j >= frameEnergies.length) continue;
      const energy = frameEnergies[j];
      average += energy;
      visited++;
      if (energy < minimum) { minimum = energy; best = j; }
    }
    if (best < 0 || !visited) return null;
    average /= visited;
    const contrast = average > 0.001 ? clamp01((average - minimum) / average) : 0;
    quality = Math.min(quality, contrast);
    boundaries.push(best / (frameEnergies.length - 1));
  }
  boundaries.push(1);
  if (boundaries.some((value, index) => index && value - boundaries[index - 1] < 0.06)) return null;
  return { boundaries, quality };
}

/**
 * Derive readable syllable spans from the trusted, tone-marked reference word.
 * Preserve the complete supplied spelling (including diacritics and consonants).
 * This orthographic segmentation is only used for display; it does not claim
 * that the audio's syllable boundaries have been phonetically verified.
 * Consonants preceding a vowel belong to that following syllable.
 */
export function referenceSyllableLabels(word: string): string[] {
  const clusters = Array.from(word.replace(/[-‐‑–—]/gu, "").normalize("NFC").matchAll(/(\P{M})(\p{M}*)/gu),
    match => match[0]);
  const isVowel = (cluster: string): boolean =>
    /^[aeẹioọu]$/iu.test(cluster.normalize("NFD").replace(/\p{M}/gu, "").replace(/^e$/iu, "e")) ||
    /^[aáàeéèẹíìiọoóòuúù]/iu.test(cluster);
  const labels: string[] = [];
  let pending = "";
  for (const cluster of clusters) {
    pending += cluster;
    if (isVowel(cluster)) {
      labels.push(pending);
      pending = "";
    }
  }
  if (pending && labels.length) labels[labels.length - 1] += pending;
  return labels;
}

function segmentMedian(points: Array<{ x: number; cents: number }>, start: number, end: number): number | null {
  const values = points.filter(point => point.x >= start + (end - start) * 0.16 &&
    point.x <= end - (end - start) * 0.16).map(point => point.cents).sort((a, b) => a - b);
  return values.length >= 3 ? values[Math.floor(values.length / 2)] : null;
}

export function buildParaPitchFeedback(word: string | null | undefined, reference: Float32Array,
  learner: Float32Array, correctPitchDisplay = false): ParaPitchFeedback | null {
  const expected = extractVowelTones(word ?? "");
  if (!expected || !word) return null;
  const activeReference = isolateActiveSpeech(reference);
  const activeLearner = isolateActiveSpeech(learner);
  if (!activeReference || !activeLearner) return null;
  const analysis = analyzeYorubaTones(word, activeReference, activeLearner);
  const ref = timedPitchContour(activeReference, correctPitchDisplay);
  const user = timedPitchContour(activeLearner, correctPitchDisplay);
  const refBounds = estimateSyllableBoundaries(activeReference, expected.length);
  const userBounds = estimateSyllableBoundaries(activeLearner, expected.length);
  if (!ref || !user || !refBounds || !userBounds) return null;
  const labels = referenceSyllableLabels(word);
  if (labels.length !== expected.length) return null;
  const alignmentQuality = Math.min(refBounds.quality, userBounds.quality);
  // Low-contrast intervals are ambiguous (connected speech with no valleys).
  // Still show the pitch graph, but do not state which syllable is incorrect.
  const reliable = alignmentQuality >= 0.25 && !!analysis && analysis.referencePatternScore >= 0.75;
  const referenceCenters = expected.map((_, i) => segmentMedian(ref, refBounds.boundaries[i], refBounds.boundaries[i + 1]));
  const learnerCenters = expected.map((_, i) => segmentMedian(user, userBounds.boundaries[i], userBounds.boundaries[i + 1]));
  // Compare inter-syllable motion, not absolute F0; natural voice range differs.
  const differences = expected.map((_, i) => {
    if (i === 0 || referenceCenters[i] === null || referenceCenters[i - 1] === null ||
        learnerCenters[i] === null || learnerCenters[i - 1] === null) return null;
    return Math.round(((learnerCenters[i]! - learnerCenters[i - 1]!) -
      (referenceCenters[i]! - referenceCenters[i - 1]!)));
  });
  const syllables: ParaPitchFeedback["syllables"] = expected.map((tone, i) => ({
    index: i + 1,
    label: labels[i],
    expected: tone,
    solfege: solfege[tone],
    start: Math.round(userBounds.boundaries[i] * 1000) / 1000,
    end: Math.round(userBounds.boundaries[i + 1] * 1000) / 1000,
    status: !reliable || differences[i] === null ? "uncertain" :
      Math.abs(differences[i]!) >= 190 ? "practice" : "close",
    differenceCents: reliable ? differences[i] : null,
  }));
  const practice = syllables.find(s => s.status === "practice");
  const guidance = practice
    ? `Practice syllable ${practice.index} (${practice.label}): aim for ${practice.solfege}. Listen to the reference and repeat the tone movement.`
    : reliable && syllables.slice(1).every(s => s.status === "close")
      ? "Your relative tone movement is close to the reference. Listen and repeat to refine it."
      : "Listen to the reference pronunciation and try again.";
  return {
    version: 2,
    alignment: "estimated-energy-boundaries",
    confidence: reliable ? "moderate" : "limited",
    expectedPattern: expected,
    syllables,
    referencePitch: ref,
    learnerPitch: user,
    guidance,
  };
}
