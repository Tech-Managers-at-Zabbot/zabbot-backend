# Release C — Pàrà scoring assessment and validation

## Observations from current STAGING source
- The legacy percentage uses **70% semantic cosine similarity of Whisper transcriptions** and **30% transcript edit/sequence similarity**. It does not directly compare phonemes, pitch contours, lexical tones, or timing.
- The graph overlays trimmed audio **amplitudes**, not pitch; it cannot be called a tone-accuracy graph.
- Semantic similarity may rate two differently pronounced words highly if their recognized meanings are related. This is a **structural risk**; magnitude on real Yorùbá attempts has not been measured.
- A long recording previously used `Math.max(...samples)`, risking a JavaScript argument-limit / stack-overflow error. The patched implementation uses a bounded-memory scan.
- Reference download previously resolved when the source ended rather than after the destination file finished writing. It now waits for the writable stream's finish event.
- The legacy remark claimed "perfect or close to perfect" pronunciation based on a text proxy. This is now removed.

## Repeatable code-level measurements (CI)
Run `npx ts-node --transpile-only pronunciation-feedback-service/test/transcription-scoring.regression.test.ts`.
The V2 transcript algorithm is tested for:
1. Exact matched recognized text: score **1.00**.
2. Different `hello` vs `goodbye`: score **0.00**.
3. Empty learner transcript: **0.00**.
4. Same letters with different Yorùbá tone marks: score is **below 1.00** when the ASR actually supplies those marks.
5. Finite scores in **[0, 1]** and no misleading tone-accuracy claims.

These tests establish algorithmic properties, **not measured pronunciation accuracy**.

## STAGING-only experiment
`ZABBOT_PARA_TRANSCRIPT_SCORING_V2=true` selects the new normalized Unicode-aware transcript edit-distance scoring and avoids semantic-embedding inflation. Default unset/false continues the legacy calculation. Do **not** enable in PRODUCTION without the user approving results.

V2 is still ASR-text similarity, not tone detection. Whisper may omit or misrecognize tone marks; the V2 algorithm cannot recover tones missing from its transcript. Neither algorithm should be advertised as phonetic or lexical-tone accuracy.

## Before accepting a tone-accuracy release
Obtain consented, expert-labeled Yorùbá recordings spanning:
- At least 10 words / minimal-pair examples where tone changes meaning, for each participating speaker/accent.
- Multiple correct native-speaker readings, plausible wrong-tone readings, other-word readings, silence/noise, and repeated takes.
- Record the speaker/accent group, reference voice, recording device, expert 0–100 rubric score and specific tone errors.

Run blinded paired comparisons of baseline vs proposed scores. Report Spearman rank correlation with expert ratings, mean absolute error, incorrect high-score rate on wrong-tone/other-word examples, and within-speaker repeat variability. Define acceptable thresholds with a Yorùbá linguist **before** tuning. Without these recordings, a claim of accurate tonal scoring is not supportable.

## Release containment
This PR changes no deployment settings or subscription enforcement. After CI, merge to STAGING only with explicit user approval. Score V2 remains opt-in; production remains unchanged.
