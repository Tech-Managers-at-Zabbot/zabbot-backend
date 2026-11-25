/**
 * Experimental speaker-centered pitch-contour comparison for Pàrà.
 *
 * This is a proxy for lexical-tone similarity, NOT a validated Yorùbá
 * tone/phoneme recognizer. No claim of pronunciation accuracy should be
 * inferred without labeled recordings. Do not change learner-facing copy.
 *
 * Audio input must be mono PCM, 16 kHz, already trimmed of leading silence.
 */
const SAMPLE_RATE = 16000;
const FRAME_LENGTH = 960; // 60 ms: more periods for deep/falling voices, 20 ms hop
const HOP_LENGTH = 320; // 20 ms
const MIN_F0 = 75; // supports many baritone voices
const MAX_F0 = 500; // supports many soprano voices
const MAX_SECONDS = 10;
const MIN_VOICED_FRAMES = 8;
const MIN_CORRELATION = 0.76;
const EPSILON = 1e-10;

export type ToneComparison = {
  score: number; // 0..1, an uncalibrated similarity estimate
  meanCentsDifference: number;
  referenceVoicedFrames: number;
  learnerVoicedFrames: number;
};

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

function median(input: number[]): number {
  const a = [...input].sort((x, y) => x - y);
  const middle = Math.floor(a.length / 2);
  return a.length % 2 ? a[middle] : (a[middle - 1] + a[middle]) / 2;
}

/**
 * Normalized autocorrelation: invariant to overall microphone loudness.
 * Center the samples to avoid DC bias; Hann-window to reduce edge effects.
 * Discard frames that are quiet or have unreliable periodicity.
 */
function framePitch(samples: Float32Array, offset: number): number | null {
  let mean = 0;
  for (let i = 0; i < FRAME_LENGTH; i++) mean += samples[offset + i];
  mean /= FRAME_LENGTH;
  const frame = new Float64Array(FRAME_LENGTH);
  let energy = 0;
  for (let i = 0; i < FRAME_LENGTH; i++) {
    const taper = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (FRAME_LENGTH - 1));
    const value = (samples[offset + i] - mean) * taper;
    frame[i] = value;
    energy += value * value;
  }
  if (Math.sqrt(energy / FRAME_LENGTH) < 0.006) return null;

  const minLag = Math.floor(SAMPLE_RATE / MAX_F0);
  const maxLag = Math.ceil(SAMPLE_RATE / MIN_F0);
  let bestLag = -1;
  let best = -1;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let dot = 0;
    let leftEnergy = 0;
    let rightEnergy = 0;
    for (let i = 0; i < FRAME_LENGTH - lag; i++) {
      const left = frame[i];
      const right = frame[i + lag];
      dot += left * right;
      leftEnergy += left * left;
      rightEnergy += right * right;
    }
    const correlation = dot / Math.sqrt(leftEnergy * rightEnergy + EPSILON);
    if (correlation > best) {
      best = correlation;
      bestLag = lag;
    }
  }
  if (bestLag < 0 || best < MIN_CORRELATION) return null;
  return SAMPLE_RATE / bestLag;
}

/**
 * Correct an isolated, approximately one-octave tracker error only when
 * BOTH immediate neighboring frames are voiced and mutually consistent.
 * Sustained movements and unvoiced gaps are never interpolated.
 * An audio-frame candidate is NOT evidence of an incorrect lexical tone.
 */
export function repairIsolatedOctaveFrames(pitches: Array<number | null>): {
  pitches: Array<number | null>;
  repaired: number;
} {
  const corrected = [...pitches];
  let repaired = 0;
  const cents = (a: number, b: number) => 1200 * Math.log2(a / b);
  for (let i = 1; i < pitches.length - 1; i++) {
    const left = pitches[i - 1], middle = pitches[i], right = pitches[i + 1];
    if (left === null || middle === null || right === null ||
        left <= 0 || middle <= 0 || right <= 0) continue;
    if (Math.abs(cents(left, right)) > 250) continue;
    const deltaLeft = cents(middle, left);
    const deltaRight = cents(middle, right);
    if (Math.sign(deltaLeft) !== Math.sign(deltaRight) ||
        Math.abs(deltaLeft) < 900 || Math.abs(deltaLeft) > 1450 ||
        Math.abs(deltaRight) < 900 || Math.abs(deltaRight) > 1450) continue;
    corrected[i] = Math.sqrt(left * right);
    repaired++;
  }
  return { pitches: corrected, repaired };
}

function framePitchTrack(audio: Float32Array, correctIsolatedOctaves: boolean):
  Array<{ x: number; pitch: number }> {
  const limit = Math.min(audio.length, SAMPLE_RATE * MAX_SECONDS);
  const raw: Array<number | null> = [];
  for (let start = 0; start + FRAME_LENGTH <= limit; start += HOP_LENGTH) {
    raw.push(framePitch(audio, start));
  }
  const values = correctIsolatedOctaves ? repairIsolatedOctaveFrames(raw).pitches : raw;
  return values.flatMap((pitch, index) => pitch !== null && Number.isFinite(pitch)
    ? [{ x: (index * HOP_LENGTH + FRAME_LENGTH / 2) / Math.max(1, limit), pitch }]
    : []);
}

/**
 * Recovery for short/quiet but genuinely voiced speech. This is deliberately
 * SECONDARY: normal Pàrà scoring is byte-for-byte unchanged when available.
 * Correlation is amplitude-independent; a per-clip noise floor avoids the
 * arbitrary 0.006 frame RMS veto on a quiet microphone. Require enough
 * periodic voiced frames and coverage, and never infer pitch from silence.
 */
function recoveredPitchContour(audio: Float32Array): number[] | null {
  if (audio.length < SAMPLE_RATE * 0.20 || audio.length > SAMPLE_RATE * 10) return null;
  const frameLength = 640; // 40ms for short vowels (standard uses 60ms)
  const hop = 160; // 10ms
  let peakRms = 0;
  for (let start = 0; start + frameLength <= audio.length; start += hop) {
    let energy = 0;
    for (let i = start; i < start + frameLength; i++) energy += audio[i] * audio[i];
    peakRms = Math.max(peakRms, Math.sqrt(energy / frameLength));
  }
  // Mic activity must be distinguishable from silence.
  if (peakRms < 0.0018) return null;
  const amplitudeFloor = Math.max(0.0012, peakRms * 0.12);
  const pitches: number[] = [];
  const windows = Math.floor((audio.length - frameLength) / hop) + 1;
  for (let start = 0; start + frameLength <= audio.length; start += hop) {
    let mean = 0;
    for (let i = start; i < start + frameLength; i++) mean += audio[i];
    mean /= frameLength;
    const frame = new Float64Array(frameLength);
    let energy = 0;
    for (let i = 0; i < frameLength; i++) {
      const taper = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (frameLength - 1));
      frame[i] = (audio[start + i] - mean) * taper;
      energy += frame[i] * frame[i];
    }
    if (Math.sqrt(energy / frameLength) < amplitudeFloor) continue;
    const minLag = Math.floor(SAMPLE_RATE / MAX_F0);
    const maxLag = Math.ceil(SAMPLE_RATE / MIN_F0);
    let best = -1;
    let bestLag = 0;
    for (let lag = minLag; lag <= maxLag; lag++) {
      let dot = 0, left = 0, right = 0;
      for (let i = 0; i < frameLength - lag; i++) {
        const a = frame[i], b = frame[i + lag];
        dot += a * b;
        left += a * a;
        right += b * b;
      }
      const corr = dot / Math.sqrt(left * right + EPSILON);
      if (corr > best) { best = corr; bestLag = lag; }
    }
    // Higher than the standard correlation gate. Reject periodicity noise.
    if (bestLag && best >= 0.80) pitches.push(SAMPLE_RATE / bestLag);
  }
  if (pitches.length < 8 || pitches.length / Math.max(1, windows) < 0.18) return null;
  const center = median(pitches.map(p => Math.log2(p)));
  return pitches.map(p => 1200 * (Math.log2(p) - center));
}

/**
 * Try an alternate, conservative F0 extraction only after standard scoring
 * fails. No word recognition or tone evidence is fabricated; only observed
 * voiced periodicity contributes. The same shape/duration comparison applies.
 */
export function compareRecoveredAcousticTones(
  reference: Float32Array, learner: Float32Array,
): ToneComparison | null {
  const a = recoveredPitchContour(reference);
  const b = recoveredPitchContour(learner);
  if (!a || !b) return null;
  const warped = contourDistance(a, b);
  const shape = contourShapeDistance(a, b);
  if (!Number.isFinite(warped) || !Number.isFinite(shape)) return null;
  const meanCentsDifference = 0.35 * warped + 0.65 * shape;
  return {
    score: Math.round(clamp01(Math.exp(-meanCentsDifference / 250)) * 100) / 100,
    meanCentsDifference,
    referenceVoicedFrames: a.length,
    learnerVoicedFrames: b.length,
  };
}

/**
 * Each recording is independently centered in log pitch (cents).
 * A 110 Hz reference and 220 Hz learner with the same relative contours
 * thus have matching curves; relative rises/falls remain measurable.
 */
export function normalizedPitchContour(
  audio: Float32Array,
  correctIsolatedOctaves = false,
): number[] | null {
  if (audio.length < FRAME_LENGTH || audio.length > SAMPLE_RATE * 60) return null;
  const pitches = framePitchTrack(audio, correctIsolatedOctaves).map(point => point.pitch);
  if (pitches.length < MIN_VOICED_FRAMES) return null;
  const center = median(pitches.map(value => Math.log2(value)));
  return pitches.map(value => 1200 * (Math.log2(value) - center));
}

/**
 * Time-preserving voiced F0 points for visual feedback. Unlike the legacy
 * normalizedPitchContour array, unvoiced gaps retain their wall-clock spacing.
 * The whole recording's log-F0 median is subtracted per speaker.
 */
export function timedPitchContour(audio: Float32Array, correctIsolatedOctaves = false):
  Array<{ x: number; cents: number }> | null {
  if (audio.length < FRAME_LENGTH || audio.length > SAMPLE_RATE * 60) return null;
  const samples = framePitchTrack(audio, correctIsolatedOctaves);
  if (samples.length < MIN_VOICED_FRAMES) return null;
  const center = median(samples.map(point => Math.log2(point.pitch)));
  return samples.map(point => ({
    x: point.x,
    cents: Math.round(1200 * (Math.log2(point.pitch) - center)),
  }));
}

/**
 * Constrained DTW accounts for moderate speaking-rate differences while
 * keeping contours in temporal order; it cannot align unrelated utterances
 * arbitrarily. Compare by mean absolute difference along the best path.
 */
export function contourDistance(reference: number[], learner: number[]): number {
  const n = reference.length;
  const m = learner.length;
  if (n < MIN_VOICED_FRAMES || m < MIN_VOICED_FRAMES) return Infinity;
  // Large duration differences are a warning sign for unsuitable audio.
  if (Math.max(n, m) / Math.min(n, m) > 2.5) return Infinity;
  const previous = new Float64Array(m + 1).fill(Infinity);
  const previousSteps = new Uint16Array(m + 1);
  previous[0] = 0;
  for (let i = 1; i <= n; i++) {
    const current = new Float64Array(m + 1).fill(Infinity);
    const steps = new Uint16Array(m + 1);
    for (let j = 1; j <= m; j++) {
      // Safely constrain warping around relative position (variable duration).
      if (Math.abs(i / n - j / m) > 0.25) continue;
      let best = previous[j - 1];
      let count = previousSteps[j - 1];
      if (previous[j] < best) { best = previous[j]; count = previousSteps[j]; }
      if (current[j - 1] < best) { best = current[j - 1]; count = steps[j - 1]; }
      if (!Number.isFinite(best)) continue;
      current[j] = best + Math.abs(reference[i - 1] - learner[j - 1]);
      steps[j] = count + 1;
    }
    previous.set(current);
    previousSteps.set(steps);
  }
  return previousSteps[m] ? previous[m] / previousSteps[m] : Infinity;
}

/**
 * Compare the normalized contour both in absolute relative-pitch position and
 * in local pitch changes. Unconstrained DTW alone can over-align distinct
 * speech melodies; a fixed-time comparison preserves genuine rising/falling
 * timing patterns and distinguishes nearly level vs substantially falling
 * utterances. Speaker pitch level is already removed by log-F0 centering.
 */
function resampleContour(contour: number[], count = 32): number[] {
  return Array.from({ length: count }, (_, index) => {
    const position = index * (contour.length - 1) / (count - 1);
    const start = Math.floor(position);
    const end = Math.min(contour.length - 1, start + 1);
    const fraction = position - start;
    return contour[start] * (1 - fraction) + contour[end] * fraction;
  });
}

export function contourShapeDistance(reference: number[], learner: number[]): number {
  if (reference.length < MIN_VOICED_FRAMES || learner.length < MIN_VOICED_FRAMES) return Infinity;
  const ref = resampleContour(reference);
  const user = resampleContour(learner);
  let positionDifference = 0;
  let movementDifference = 0;
  for (let i = 0; i < ref.length; i++) {
    positionDifference += Math.abs(ref[i] - user[i]);
    if (i > 0) {
      movementDifference += Math.abs((ref[i] - ref[i - 1]) - (user[i] - user[i - 1]));
    }
  }
  return 0.7 * positionDifference / ref.length +
    0.3 * movementDifference / (ref.length - 1);
}

/**
 * This estimate is not calibrated; only comparative experiments with expert
 * Yorùbá labels can establish valid cutoffs or whether it should be shipped.
 */
export function compareAcousticTones(
  reference: Float32Array,
  learner: Float32Array,
  correctIsolatedOctaves = false,
): ToneComparison | null {
  const referenceContour = normalizedPitchContour(reference, correctIsolatedOctaves);
  const learnerContour = normalizedPitchContour(learner, correctIsolatedOctaves);
  if (!referenceContour || !learnerContour) return null;
  const warpedDistance = contourDistance(referenceContour, learnerContour);
  const shapeDistance = contourShapeDistance(referenceContour, learnerContour);
  if (!Number.isFinite(warpedDistance) || !Number.isFinite(shapeDistance)) return null;
  // Weight fixed-time movement patterns higher than warping to avoid hiding
  // tonal mismatches. These weights still require human Yorùbá calibration.
  const meanCentsDifference = 0.35 * warpedDistance + 0.65 * shapeDistance;
  return {
    score: Math.round(clamp01(Math.exp(-meanCentsDifference / 250)) * 100) / 100,
    meanCentsDifference,
    referenceVoicedFrames: referenceContour.length,
    learnerVoicedFrames: learnerContour.length,
  };
}
