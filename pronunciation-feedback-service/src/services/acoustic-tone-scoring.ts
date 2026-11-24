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
 * Each recording is independently centered in log pitch (cents).
 * A 110 Hz reference and 220 Hz learner with the same relative contours
 * thus have matching curves; relative rises/falls remain measurable.
 */
export function normalizedPitchContour(
  audio: Float32Array,
): number[] | null {
  if (audio.length < FRAME_LENGTH || audio.length > SAMPLE_RATE * 60) return null;
  const pitches: number[] = [];
  const limit = Math.min(audio.length, SAMPLE_RATE * MAX_SECONDS);
  for (let start = 0; start + FRAME_LENGTH <= limit; start += HOP_LENGTH) {
    const pitch = framePitch(audio, start);
    if (pitch !== null && Number.isFinite(pitch)) pitches.push(pitch);
  }
  if (pitches.length < MIN_VOICED_FRAMES) return null;
  const center = median(pitches.map(value => Math.log2(value)));
  return pitches.map(value => 1200 * (Math.log2(value) - center));
}

/**
 * Time-preserving voiced F0 points for visual feedback. Unlike the legacy
 * normalizedPitchContour array, unvoiced gaps retain their wall-clock spacing.
 * The whole recording's log-F0 median is subtracted per speaker.
 */
export function timedPitchContour(audio: Float32Array):
  Array<{ x: number; cents: number }> | null {
  if (audio.length < FRAME_LENGTH || audio.length > SAMPLE_RATE * 60) return null;
  const limit = Math.min(audio.length, SAMPLE_RATE * MAX_SECONDS);
  const samples: Array<{ x: number; logF0: number }> = [];
  for (let start = 0; start + FRAME_LENGTH <= limit; start += HOP_LENGTH) {
    const pitch = framePitch(audio, start);
    if (pitch !== null && Number.isFinite(pitch)) {
      samples.push({
        x: (start + FRAME_LENGTH / 2) / Math.max(1, limit),
        logF0: Math.log2(pitch),
      });
    }
  }
  if (samples.length < MIN_VOICED_FRAMES) return null;
  const center = median(samples.map(point => point.logF0));
  return samples.map(point => ({
    x: point.x,
    cents: Math.round(1200 * (point.logF0 - center)),
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
): ToneComparison | null {
  const referenceContour = normalizedPitchContour(reference);
  const learnerContour = normalizedPitchContour(learner);
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
