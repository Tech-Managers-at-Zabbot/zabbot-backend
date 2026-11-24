/**
 * Evidence-limited scoring: estimates agreement between ASR transcripts.
 * This does NOT assess acoustic pronunciation or Yoruba lexical tones.
 * Enable in STAGING only after reviewing its behavior on labeled recordings.
 */
export const normalizeTranscript = (text: string): string =>
  text.normalize("NFC").toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ").trim();

export const transcriptSimilarity = (learner: string, reference: string): number => {
  const a = Array.from(normalizeTranscript(learner));
  const b = Array.from(normalizeTranscript(reference));
  if (!a.length || !b.length) return 0;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return Math.max(0, 1 - previous[b.length] / Math.max(a.length, b.length));
};

export const transcriptScore = (learner: string, reference: string): number => {
  const similarity = transcriptSimilarity(learner, reference);
  return Math.round(similarity * 100) / 100;
};

export const transcriptFeedback = (score: number): string => {
  if (score >= 0.85) {
    return "Your recognized words closely match the reference. This check does not assess Yorùbá tones. Listen and compare your tones with the reference audio.";
  }
  if (score >= 0.6) {
    return "Some recognized sounds or words differ from the reference. Listen and try again. Yorùbá tones are not assessed by this score.";
  }
  return "The recognized words differ from the reference. Please listen and record again. Yorùbá tones are not assessed by this score.";
};
