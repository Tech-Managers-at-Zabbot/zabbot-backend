# Release C — experimental acoustic comparison

## Status and isolation
This is a **STAGING-only candidate**, behind a **new default-OFF** backend flag:
`ZABBOT_PARA_ACOUSTIC_SCORING_V1=true`.

Do not enable this on PRODUCTION. `ZABBOT_PARA_TRANSCRIPT_SCORING_V2` remains separate and OFF by default.

## What it computes
1. Reference: the existing approved pre-recorded audio. Learner: the user's own microphone audio.
2. Existing FFmpeg preprocessing decodes both to mono 16 kHz and trims leading silence.
3. Sliding 40 ms windows (20 ms hop) estimate voiced fundamental frequency by normalized autocorrelation, with unreliable/silent frames rejected.
4. Convert F0 into log pitch (cents) and subtract **each speaker's median log F0 independently**, to reduce systematic baritone/soprano pitch offsets while preserving local pitch changes.
5. Time-align the two relative contours by constrained dynamic time warping (DTW).
6. Compute an **uncalibrated** contour similarity as `exp(-meanAbsoluteCentsDifference / 350)`.
7. Blend 60% acoustic contour similarity and 40% normalized transcript edit-distance similarity as an experiment. Existing remark text, API fields, graph, recording storage, authorization checks and UI remain unchanged. If pitch evidence is insufficient with the experimental flag ON, fail the comparison rather than silently returning a misleading transcript-only score. The legacy behavior remains unchanged when the flag is OFF.

## Known limitations (not a validated pronunciation checker)
- **No syllable segmentation, phoneme assessment or independent Yorùbá tone classification yet.** Pitch contours are an acoustic proxy. A non-tonal language word or synthetic sine wave can match a tone contour without matching Yorùbá pronunciation.
- Whisper may omit lexical tone marks; transcript component may not distinguish wrong-tone minimal pairs.
- Centering over one whole word cannot guarantee the high/mid/low target is correctly interpreted, especially for one-syllable words or uniform contour shifts.
- Pitch trackers may make octave errors, particularly with creaky voice, high voices and strong harmonics.
- Pauses and unvoiced consonants are discarded. The best-path alignment may conceal some segmental errors.
- The weighting 60/40 and the scale 350 cents are **hypotheses**, not expert-calibrated; passing synthetic tests does not validate human educational accuracy.
- The existing user-facing labels remain unchanged **by request**, not because this experimental score establishes their scientific accuracy.

## Technical validation
Run: `npx ts-node --transpile-only pronunciation-feedback-service/test/acoustic-tone-scoring.regression.test.ts`.

Synthetic PCM tests examine:
- Baritone/soprano offsets with matching relative pitch.
- Same-speaker opposite pitch movements.
- 1.2 vs 1.8 s utterance pacing.
- Silence and too-short inputs.
- Large duration mismatch rejection.
- Score bounds and approved-copy guard.

## Evidence required before enabling/accepting in STAGING
1. Explicitly verify current legacy scoring still returns score + plot with the acoustic flag absent, for subscribed accounts; non-subscribers still see subscription denial.
2. Use consented and human-labeled real Yorùbá reference/learner recordings, including men and women and the same word pronounced correctly and with wrong tones.
3. Pre-register evaluation metrics: rank correlation with expert scores; wrong-tone false-pass rate; variance across speaker sex/range, microphones and repeat attempts; proportion with insufficient voiced evidence and fallback; processing latency.
4. Establish safe thresholds with a Yorùbá linguist *before* tuning weights or promoting.
5. No PRODUCTION promotion of acoustic flag or code unless explicitly approved following STAGING acceptance.

## Rollback
Unset or set `ZABBOT_PARA_ACOUSTIC_SCORING_V1=false` on the **STAGING backend**, then redeploy the STAGING backend. Existing legacy scoring continues. Do not modify PRODUCTION variables.

## November 24 real-sample regression finding
Two user-submitted ~2–3-second recordings labelled `.wav` were inspected and found to contain **WebM media** rather than RIFF WAV. A preliminary independent pitch analysis showed one relatively flat voiced section and a markedly different contour in the other. The recordings must **not** be committed to this repository without explicit consent. Synthetic regressions now test level-versus-falling contours and speaker pitch differences; the real samples remain acceptance fixtures provided separately by the user. This work does not establish correctness of the two speakers' lexical Yorùbá tones relative to a separately stored reference recording.

When the acoustic flag is enabled, diagnostic logs include acousticScore, meanCentsDifference and voiced-frame counts. Check these metrics when two attempts receive identical displayed scores. If the flag is absent or OFF, identical transcript-derived scores are entirely possible.
