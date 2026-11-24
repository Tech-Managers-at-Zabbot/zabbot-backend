# Pàrà Phase 2 — STAGING-only pitch guidance

## Branches / pull requests
- Backend: `phase2/staging-para-pitch-feedback-backend-20261124`
- Frontend: `phase2/staging-para-pitch-feedback-frontend-20261124`
- Both PRs target `staging` only and require tests and review before merge.

## Flags
Set ONLY on the dedicated STAGING backend after merge and deploy:
- `ZABBOT_PARA_ACOUSTIC_SCORING_V1=true`
- `ZABBOT_PARA_PITCH_FEEDBACK_V2=true`
- `ZABBOT_PARA_TRANSCRIPT_SCORING_V2=false`

With either acoustic or pitch-feedback flag OFF, `pitchFeedback` is absent and the existing frontend waveform remains. No PRODUCTION environment changes.

## API
The existing pronunciation success response optionally adds `data.pitchFeedback`:
- `version: 2`
- `alignment: "estimated-energy-boundaries"`
- `confidence: "limited" | "moderate"`
- `expectedPattern` (L/M/H from trusted `yorubaWord`)
- `syllables[]`: index, vowel-nucleus label, expected, solfege, normalized start/end, status, relative pitch-change difference
- `referencePitch[]`, `learnerPitch[]`: normalized real-recording positions and independent-speaker-centered pitch in cents
- `guidance`: guarded text describing one estimated syllable to practice, or explaining uncertainty

Response is omitted for unsafe/unmarked metadata without suitable evidence, unusable F0, unsupported clips and current in-lesson uploads (which do not have verified trusted word-to-audio alignment). No user-supplied lesson text is trusted for scoring.

## Safety and accuracy
Boundaries are energy-valley *estimates*, not true syllable/phoneme alignment. Corrective feedback is tentative; DO/RE/MI refers to the reference word's orthographic tone category, not a universal absolute Hz. The first syllable cannot be independently evaluated by relative-pitch evidence alone. Short voiced speech, speaker register differences, background noise, uneven syllable durations, and connected speech need human-rated evaluation. No automated correction should claim definitive accuracy.

## Acceptance checks before enabling
1. Confirm backend + frontend CI green, static type build and no subscription regression.
2. With flags OFF, compare and verify legacy score, API, waveform, auth and billing.
3. Enable flags on STAGING backend only; confirm EGG (ẹyin) reference + multiple actual learner attempts (level, falling, rising).
4. Verify reference/learner contours use audio-time positions; no invented pitch through silence, no misleading "accurate" verdict on unclear audio.
5. Verify mobile and desktop for standalone Pàrà. In-lesson screen stays waveform-only until trusted word mapping exists.
6. Verify speaker-register invariance and real reference clips for additional tone patterns with expert review.
7. Do not enable in PRODUCTION until human-rated pronunciation feedback and boundary alignment are validated.

## Rollback
Set `ZABBOT_PARA_PITCH_FEEDBACK_V2=false` on STAGING backend and redeploy. Optional payload disappears; the UI shows its legacy waveform.
