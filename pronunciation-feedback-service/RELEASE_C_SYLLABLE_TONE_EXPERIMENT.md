# Release C — syllable-aware Yorùbá tonal evidence (experimental STAGING)

## Activation and scope
- Only active when backend `ZABBOT_PARA_ACOUSTIC_SCORING_V1=true`. The flag remains OFF by default in code. Leave `ZABBOT_PARA_TRANSCRIPT_SCORING_V2=false`.
- No changes to learner-facing copy, UI, graph, subscriptions, schema, or PRODUCTION environment variables.
- Retains the current PCM reference-versus-learner contour scorer and speaker-relative pitch normalization.

## New analysis
1. Use the database-owned `ReferencePronunciation.yorubaWord` for standalone Pàrà (never an untrusted user-provided URL or Whisper transcription).
2. Decompose Unicode tone-marked vowels; Yoruba vowel underdots indicate vowel **quality**, not low pitch. Acute = high (MI), grave = low (DO), unmarked = mid (RE).
3. For eligible single words with 2–6 vowel nuclei, calculate robust median voiced pitch for proportional central segments in both actual recordings. These are **syllable proxies**, not aligned, verified phonemes.
4. Verify that the reference pitch ordering is consistent with the expected annotated tone ordering. If not, refuse the syllable-tone component; do not pretend the dataset and audio agree.
5. When eligible, calculate independent-speaker inter-syllable pitch-change similarity plus learner-to-tone-pattern consistency. Add this evidence to the provisional overall score: 55% full contour + 25% syllable-proxy evidence + 20% normalized recognized-text similarity.
6. If ineligible (single-syllable, unsafe spelling, phrases, no reliable voiced frames, unsuitable or mismatched reference), retain previous acoustic experiment's 60% full-contour + 40% transcript blend. No fabricated syllable verdict.
7. Existing Pàrà graph, learner text, and API data shape are unchanged. Server diagnostics log tone pattern and aggregate scores **without exposing learner recordings**.

## Scientific limitations
- Proportional segmentation is **not syllable alignment**. Real syllables have unequal duration and unvoiced consonants; the current approach is only a conservative experiment, not phoneme-level precision.
- A single-syllable high/mid/low pitch **cannot be scored reliably from speaker-independent absolute pitch** without phrase context, contextual speaker baseline, or calibration recordings.
- The exact 55/25/20 weight and tolerance thresholds are uncalibrated and must not be represented as validated pronunciation accuracy.
- Expert-reviewed words, reference audio, actual syllable boundaries, and a multi-speaker dataset are required before assigning learner-specific DO–RE–MI corrections.
- No learner-facing “you should sing RE” feedback is introduced without explicit approval.

## CI and STAGING validation
Run the existing acoustic test and the new `pronunciation-feedback-service/test/yoruba-tone-analysis.regression.test.ts`.
The new tests cover the canonical `ẹyin` (egg) mid–mid spelling, low/high minimal contrasts, underdots, cross-pitch reference/learner recordings, silent audio, unsafe spelling, and approved-copy preservation.
After merged/deployed in STAGING and with the acoustic flag TRUE, compare repeated egg attempts using the same reference and inspect logs. Verify non-subscribers still receive the normal subscription-required response, normal score/graph remain, no user-facing text is changed, and PRODUCTION stays unchanged.
