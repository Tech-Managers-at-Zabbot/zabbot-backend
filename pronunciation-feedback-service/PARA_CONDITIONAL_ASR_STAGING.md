# Pàrà STAGING — Conditional ASR scoring with conservative retries

## Behavior (standalone predefined words only, STAGING branch)

This change is automatically active for standalone Pàrà when the existing
`ZABBOT_PARA_ACOUSTIC_SCORING_V1=true` is enabled on the STAGING backend.
No additional flag is needed. Production and in-lesson scoring are unchanged.

1. **Retain ASR evidence:** When the trusted reference and the learner transcript both agree sufficiently with the database word (normalized word agreement >= 0.65), keep the existing weighted formula: 55% acoustic + 25% syllable tone + 20% transcript agreement.
2. **Withhold ASR evidence:** When the trusted reference ASR is empty or does not agree with the database word, do not treat that as a learner mistake. With reliable acoustic and syllable evidence, compute `(0.55 × acoustic + 0.25 × syllableTone) / 0.80`. This is renormalization, not a 100% artificial ASR score. The original 55:25 ratio is unchanged.
3. **Request a retry, no score:** Missing/insufficient acoustic evidence, missing tone evidence, weak reference-pattern compatibility, or low-confidence estimated syllable alignment triggers a clear HTTP 422 retry message. No grade or pronunciation record is saved.
4. If the reference ASR agrees with the word but the learner ASR does not, retry instead of silently withholding a possible wrong-word penalty. This conservative choice avoids giving high scores to potentially different words.

**Limitations:** 0.65 text agreement and confidence thresholds are provisional; Whisper recognition is not a calibrated confidence measurement, and estimated syllable boundaries are not forced alignment. Real wrong-word/wrong-tone and repeated fluent-speaker validation is required before production promotion.

## Diagnostics
Existing `ZABBOT_PARA_SCORING_DIAGNOSTICS_V1=true` panel now additionally reports `scoring.effectiveAsrDecision`, `scoring.effectiveWeights`, and `scoring.effectiveScore`. `scoring.reconstruction` continues to reconstruct the **old formula**, and should not be mistaken for the actual grade under the new ASR gate.

## Acceptance
- Repeat GBOGBO with both male and female baselines, including reference ASR empty or misrecognized. Expect ASR exclusion only if syllable alignment is sufficiently reliable; otherwise an HTTP 422 retry.
- Compare valid `Gbogbo` vs `Gbo gbo` transcriptions, ensure 55/25/20 retained and no shift to inappropriate bonus.
- Test silence, weak syllable boundaries, bad tonal pattern, different-word learner ASR, and intentionally incorrect tones. No fabricated high score.
- Validate continued error rendering on the frontend, and unchanged lessons/subscription gating.

## Rollback
Revert the STAGING backend PR. No production flag or migration changes.
