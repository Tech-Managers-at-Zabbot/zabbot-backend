/**
 * Conservative, STAGING-only Pàrà ASR evidence decision.
 *
 * A short Yorùbá word's ASR spelling is not reliable proof of pronunciation
 * quality. Never turn absent ASR into a perfect transcription score, and never
 * award a high score from acoustic evidence if syllable analysis is unusable.
 *
 * Scores and weights used when both transcripts pass the gate are unchanged.
 * When the REFERENCE transcript is unreliable, the ASR component is omitted
 * and the existing acoustic and syllable weights are renormalized (55:25).
 *
 * A reliably recognized reference but unclear learner transcription cannot
 * safely be treated as correct (wrong word vs ASR failure): request a retry.
 */
import { normalizeTranscript, transcriptScore } from "./transcription-scoring";
import { wordIdentityAgreement } from "./para-scoring-diagnostics";

export type AsrEvidenceDecision =
  | { kind: "retain"; score: number; asrScore: number; referenceAgreement: number; learnerAgreement: number }
  | { kind: "withhold"; score: number; asrScore: null; referenceAgreement: number; learnerAgreement: number | null }
  | { kind: "ungraded"; reason: string; referenceAgreement: number | null; learnerAgreement: number | null };

const ASR_MATCH_THRESHOLD = 0.65;
const MIN_VOICED_FRAMES = 8;

export function decideParaAsrEvidence(input: {
  expectedWord: string | null | undefined;
  referenceTranscript: string;
  learnerTranscript: string;
  acousticScore: number | null;
  acousticReferenceVoicedFrames: number | null;
  acousticLearnerVoicedFrames: number | null;
  syllableToneScore: number | null;
  referencePatternScore: number | null;
  alignmentConfidence: "limited" | "moderate" | null;
}): AsrEvidenceDecision {
  const expected = input.expectedWord?.trim() ?? "";
  // Gating is defined only for trusted single-word Pàrà references.
  if (!expected || /\s/u.test(expected)) {
    return { kind: "ungraded", reason: "This word needs a reviewed syllable pattern before Pàrà can assign a reliable grade.", referenceAgreement: null, learnerAgreement: null };
  }
  const refAgreement = wordIdentityAgreement(input.referenceTranscript, expected);
  const learnerAgreement = wordIdentityAgreement(input.learnerTranscript, expected);
  const audioGood = input.acousticScore !== null && Number.isFinite(input.acousticScore) &&
    input.acousticScore >= 0 && input.acousticScore <= 1 &&
    (input.acousticReferenceVoicedFrames ?? 0) >= MIN_VOICED_FRAMES &&
    (input.acousticLearnerVoicedFrames ?? 0) >= MIN_VOICED_FRAMES;
  // Acoustic evidence must exist for an evidence-based comparison.
  // This function is reached only after the speech detector has accepted
  // both recordings. A missing score therefore means analysis unavailable,
  // NOT proof the learner's microphone recording is bad.
  if (!audioGood) {
    return { kind: "ungraded",
      reason: "We detected speech, but the acoustic comparison could not establish a reliable result. Your attempt is ungraded.",
      referenceAgreement: refAgreement, learnerAgreement };
  }
  const toneGood = input.syllableToneScore !== null &&
    Number.isFinite(input.syllableToneScore) &&
    input.syllableToneScore >= 0 && input.syllableToneScore <= 1 &&
    input.referencePatternScore !== null && input.referencePatternScore >= 0.65 &&
    input.alignmentConfidence === "moderate";
  // We may show available acoustic evidence, but never substitute it for a
  // missing syllable-tone component or silently assign a high final grade.
  if (!toneGood) {
    return { kind: "ungraded",
      reason: "We heard your recording, but couldn't confidently align its syllables. You can practice with the reference; no grade was assigned.",
      referenceAgreement: refAgreement, learnerAgreement };
  }
  const refReliable = normalizeTranscript(input.referenceTranscript).length > 0 &&
    refAgreement !== null && refAgreement >= ASR_MATCH_THRESHOLD;
  const learnerReliable = normalizeTranscript(input.learnerTranscript).length > 0 &&
    learnerAgreement !== null && learnerAgreement >= ASR_MATCH_THRESHOLD;

  if (!refReliable) {
    // Reference-ASR disagreement is not evidence against a learner. Retain
    // only the verified acoustic and syllable evidence (same relative weights).
    const score = (0.55 * input.acousticScore! + 0.25 * input.syllableToneScore!) / 0.80;
    return { kind: "withhold", score, asrScore: null, referenceAgreement: refAgreement ?? 0, learnerAgreement };
  }
  if (!learnerReliable) {
    // A failed learner transcription may signal a different word OR bad ASR.
    // Do not silently remove the penalty or grant an unearned high score.
    return {
      kind: "ungraded",
      reason: "Speech recognition could not confirm the expected word. Your attempt is ungraded; listen to the reference and practice again.",
      referenceAgreement: refAgreement,
      learnerAgreement,
    };
  }
  const asrScore = transcriptScore(input.learnerTranscript, input.referenceTranscript);
  const score = 0.55 * input.acousticScore! + 0.25 * input.syllableToneScore! + 0.20 * asrScore;
  return {
    kind: "retain", score, asrScore,
    referenceAgreement: refAgreement!, learnerAgreement: learnerAgreement!,
  };
}
