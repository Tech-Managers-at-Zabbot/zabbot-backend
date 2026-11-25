/**
 * Pàrà calibration diagnostics, opt-in for authenticated STAGING requests.
 * IMPORTANT: shadowScore is an unvalidated what-if scenario, not a learner score.
 * Live scoring does not change when diagnostic mode is enabled.
 */
import { normalizeTranscript, transcriptScore } from "./transcription-scoring";
import { timedPitchContour, compareAcousticTones } from "./acoustic-tone-scoring";

export type ParaScorePath = "acoustic-syllable-transcript" | "acoustic-transcript-fallback" | "legacy-text-only";
export type ParaScoringDiagnostics = {
  version: 1;
  kind: "experimental-shadow-calibration";
  reference: { pronunciationId: string | null; voice: string | null; expectedWord: string | null };
  recognition: {
    referenceTranscript: string;
    learnerTranscript: string;
    referenceNormalized: string;
    learnerNormalized: string;
    recognizedTranscriptAgreement: number;
    expectedWordAgreement: number | null;
    transcriptionRisk: "high" | "low";
  };
  scoring: {
    path: ParaScorePath;
    weights: { acoustic: number; syllableTone: number; transcript: number };
    components: {
      acoustic: number | null;
      syllableTone: number | null;
      transcript: number;
      syllablePattern: number | null;
      interSyllable: number | null;
    };
    liveScore: number;
    reconstruction: number;
    effectiveAsrDecision?: "retain" | "withhold";
    effectiveWeights?: { acoustic: number; syllableTone: number; transcript: number };
    effectiveScore?: number;
  };
  pitchQuality: {
    referenceOctaveJumpCandidates: number | null;
    learnerOctaveJumpCandidates: number | null;
  };
  evidenceQualityCalibration: {
    referenceAsrReliable: boolean | null;
    asrDecision: "withhold-unreliable-reference" | "retain-provisional" | "unknown";
    rawAcousticScore: number | null;
    correctedAcousticScore: number | null;
    correctedRelativeScore: number | null;
    correctedAcousticDelta: number | null;
    correctedReferenceOctaveJumpCandidates: number | null;
    correctedLearnerOctaveJumpCandidates: number | null;
    transcriptUsedInCandidate: boolean;
    changesLiveScore: false;
    explanation: string;
  };
  shadowCalibration: {
    score: number | null;
    weights: { acoustic: number; syllableTone: number; transcript: number } | null;
    reason: string;
    isLearnerScore: false;
  };
};

const round = (n: number) => Math.round(n * 1000) / 1000;
const clamp = (n: number) => Math.max(0, Math.min(1, n));

export function wordIdentityAgreement(recognized: string, expected: string | null): number | null {
  if (!expected) return null;
  // Word-identity diagnostics only. Whitespace/case/punctuation are not
  // pronunciation evidence. Do not discard tone marks for this diagnostic.
  const a = normalizeTranscript(recognized).replace(/\s+/g, "");
  const b = normalizeTranscript(expected).replace(/\s+/g, "");
  return a && b ? transcriptScore(a, b) : 0;
}

export function octaveJumpCandidates(audio: Float32Array | null): number | null {
  if (!audio) return null;
  const points = timedPitchContour(audio);
  if (!points || points.length < 5) return null;
  let count = 0;
  // A one-frame ~octave jump which immediately returns is a likely tracker
  // anomaly. No pitch or score is modified by this diagnostic.
  for (let i = 1; i < points.length - 1; i++) {
    const previous = points[i - 1];
    const current = points[i];
    const next = points[i + 1];
    if (current.x - previous.x > 0.055 || next.x - current.x > 0.055) continue;
    const d1 = current.cents - previous.cents;
    const d2 = current.cents - next.cents;
    if (Math.sign(d1) === Math.sign(d2) && Math.abs(d1) >= 750 &&
        Math.abs(d2) >= 750 && Math.abs(previous.cents - next.cents) <= 280) count++;
  }
  return count;
}

export function buildParaScoringDiagnostics(input: {
  referenceId?: string | null;
  voice?: string | null;
  expectedWord?: string | null;
  referenceTranscript: string;
  learnerTranscript: string;
  path: ParaScorePath;
  acousticScore: number | null;
  syllableScore: number | null;
  syllablePatternScore: number | null;
  interSyllableScore: number | null;
  transcriptComponent: number;
  liveScore: number;
  referenceAudio: Float32Array | null;
  learnerAudio: Float32Array | null;
}): ParaScoringDiagnostics {
  const { path, acousticScore, syllableScore, transcriptComponent, liveScore } = input;
  const weights = path === "acoustic-syllable-transcript" ?
    { acoustic: 0.55, syllableTone: 0.25, transcript: 0.20 } :
    path === "acoustic-transcript-fallback" ?
      { acoustic: 0.60, syllableTone: 0, transcript: 0.40 } :
      { acoustic: 0, syllableTone: 0, transcript: 1 };
  const reconstruction = path === "legacy-text-only" ? transcriptComponent :
    weights.acoustic * (acousticScore ?? 0) +
    weights.syllableTone * (syllableScore ?? 0) +
    weights.transcript * transcriptComponent;

  // Illustrative candidate: reduce uncertain ASR influence to 5%.
  // Redistribute the remaining weight in proportion to acoustic and tone
  // evidence. Do NOT change displayed score, remarks or entitlements.
  const shadowWeights = path === "acoustic-syllable-transcript" ?
    { acoustic: 0.70, syllableTone: 0.25, transcript: 0.05 } :
    path === "acoustic-transcript-fallback" ?
      { acoustic: 0.95, syllableTone: 0, transcript: 0.05 } : null;
  const shadow = shadowWeights && acousticScore !== null && (shadowWeights.syllableTone === 0 || syllableScore !== null)
    ? clamp(shadowWeights.acoustic * acousticScore +
      shadowWeights.syllableTone * (syllableScore ?? 0) +
      shadowWeights.transcript * transcriptComponent) : null;
  const wordAgreement = wordIdentityAgreement(input.learnerTranscript, input.expectedWord ?? null);
  const agreement = transcriptScore(input.learnerTranscript, input.referenceTranscript);
  // Reference ASR quality is measurable only if a trusted stored reference
  // word exists. A learner mismatch alone can be a real mistake and must
  // never be automatically forgiven as an ASR failure.
  const referenceWordAgreement = wordIdentityAgreement(
    input.referenceTranscript, input.expectedWord ?? null,
  );
  const referenceAsrReliable = referenceWordAgreement === null ? null : referenceWordAgreement >= 0.65;
  const asrDecision = referenceAsrReliable === null ? "unknown" as const :
    !referenceAsrReliable ? "withhold-unreliable-reference" as const : "retain-provisional" as const;
  const correctedAcoustic = input.referenceAudio && input.learnerAudio
    ? compareAcousticTones(input.referenceAudio, input.learnerAudio, true)
    : null;
  // This is a quality-corrected SHADOW estimate, not a learner score.
  // Use existing raw 55/25/20 or 60/40 weighting if baseline ASR appears
  // useful. If baseline ASR fails the stored word, withhold its component
  // and renormalize remaining evidence. Never treat missing ASR as 100%.
  let correctedRelativeScore: number | null = null;
  if (correctedAcoustic && path !== "legacy-text-only") {
    const toneWeight = path === "acoustic-syllable-transcript" && syllableScore !== null ? 0.25 : 0;
    const rawAcousticWeight = path === "acoustic-syllable-transcript" ? 0.55 : 0.60;
    const transcriptWeight = path === "acoustic-syllable-transcript" ? 0.20 : 0.40;
    const useTranscript = referenceAsrReliable !== false;
    const remaining = rawAcousticWeight + toneWeight + (useTranscript ? transcriptWeight : 0);
    correctedRelativeScore = clamp((
      rawAcousticWeight * correctedAcoustic.score +
      toneWeight * (syllableScore ?? 0) +
      (useTranscript ? transcriptWeight * transcriptComponent : 0)
    ) / remaining);
  }
  const correctedReferencePoints = input.referenceAudio ? timedPitchContour(input.referenceAudio, true) : null;
  const correctedLearnerPoints = input.learnerAudio ? timedPitchContour(input.learnerAudio, true) : null;
  const countJumpCandidates = (points: Array<{x:number;cents:number}> | null): number | null => {
    if (!points || points.length < 5) return null;
    let count = 0;
    for(let i=1;i<points.length-1;i++){
      if(points[i].x-points[i-1].x>0.055 || points[i+1].x-points[i].x>0.055) continue;
      const p=points[i-1].cents, c=points[i].cents, n=points[i+1].cents;
      if(Math.sign(c-p)===Math.sign(c-n) && Math.abs(c-p)>=750 &&
         Math.abs(c-n)>=750 && Math.abs(p-n)<=280) count++;
    }
    return count;
  };
  return {
    version: 1,
    kind: "experimental-shadow-calibration",
    reference: {
      pronunciationId: input.referenceId ?? null,
      voice: input.voice ?? null,
      expectedWord: input.expectedWord ?? null,
    },
    recognition: {
      referenceTranscript: input.referenceTranscript,
      learnerTranscript: input.learnerTranscript,
      referenceNormalized: normalizeTranscript(input.referenceTranscript),
      learnerNormalized: normalizeTranscript(input.learnerTranscript),
      recognizedTranscriptAgreement: agreement,
      expectedWordAgreement: wordAgreement,
      transcriptionRisk: agreement < 0.75 || (wordAgreement !== null && wordAgreement < 0.65) ? "high" : "low",
    },
    scoring: {
      path,
      weights,
      components: {
        acoustic: acousticScore === null ? null : round(acousticScore),
        syllableTone: syllableScore === null ? null : round(syllableScore),
        transcript: round(transcriptComponent),
        syllablePattern: input.syllablePatternScore === null ? null : round(input.syllablePatternScore),
        interSyllable: input.interSyllableScore === null ? null : round(input.interSyllableScore),
      },
      liveScore: round(liveScore),
      reconstruction: round(reconstruction),
    },
    pitchQuality: {
      referenceOctaveJumpCandidates: octaveJumpCandidates(input.referenceAudio),
      learnerOctaveJumpCandidates: octaveJumpCandidates(input.learnerAudio),
    },
    evidenceQualityCalibration: {
      referenceAsrReliable,
      asrDecision,
      rawAcousticScore: acousticScore === null ? null : round(acousticScore),
      correctedAcousticScore: correctedAcoustic ? round(correctedAcoustic.score) : null,
      correctedRelativeScore: correctedRelativeScore === null ? null : round(correctedRelativeScore),
      correctedAcousticDelta: correctedAcoustic && acousticScore !== null
        ? round(correctedAcoustic.score - acousticScore) : null,
      correctedReferenceOctaveJumpCandidates: countJumpCandidates(correctedReferencePoints),
      correctedLearnerOctaveJumpCandidates: countJumpCandidates(correctedLearnerPoints),
      transcriptUsedInCandidate: referenceAsrReliable !== false,
      changesLiveScore: false,
      explanation: "Experimental shadow only. Single-frame octave repair and reference-ASR trust gating; no change to actual scoring or weights.",
    },
    shadowCalibration: {
      score: shadow === null ? null : round(shadow),
      weights: shadowWeights,
      reason: "Research-only sensitivity test reducing ASR weight to 5%; not calibrated against speaker ratings.",
      isLearnerScore: false,
    },
  };
}
