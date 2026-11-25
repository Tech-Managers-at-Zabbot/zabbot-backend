# Pàrà STAGING-only scoring diagnostics and shadow calibration

## Intent
Diagnose why similar GBOGBO recordings may receive low scores, without silently changing the learner's grade. Real uploaded recordings are NOT committed to the repository.

## Enable on the STAGING backend only
```env
ZABBOT_PARA_ACOUSTIC_SCORING_V1=true
ZABBOT_PARA_PITCH_FEEDBACK_V2=true
ZABBOT_PARA_SCORING_DIAGNOSTICS_V1=true
```
Production must leave `ZABBOT_PARA_SCORING_DIAGNOSTICS_V1` unset/false. The feature is gated by backend configuration. When disabled, the API omits `scoringDiagnostics` and the panel disappears automatically. The diagnostic does not add new API endpoints, bypass authentication, alter entitlements, or change scoring. Ensure STAGING deployment environment has the flag and redeploy after setting it.

## Diagnostic response
Authenticated successful Pàrà comparison optionally adds `data.scoringDiagnostics` with:
- Trusted reference word, selected reference voice and pronunciation ID
- Actual reference and learner Whisper transcripts, normalized versions, agreement to each other, learner agreement to trusted expected word
- Selected scoring path, exact weighting, acoustic, tone and transcript components, actual score and reconstructed score
- Count of isolated octave-sized pitch tracker jump *candidates* (not proof of octave mistakes and not corrected)
- A **non-grading** shadow score that reduces transcript weight to 5% (70/25/5 when tone evidence exists, 95/0/5 otherwise). This is hypothetical and not human-calibrated.

Raw transcripts are returned only to authenticated callers of the already protected comparison endpoint when the flag is enabled. Review STAGING users/data access before enabling, and do not expose this diagnostic in production.

## Acceptance checklist
1. Confirm backend TypeScript build, pure diagnostic tests and Pàrà tests all pass.
2. Confirm frontend typecheck and integration regression tests pass, and PRs merge to staging.
3. On STAGING with flag OFF, verify unchanged response and identical final score.
4. Turn flag ON on STAGING backend, re-record GBOGBO against the selected female reference; note the exact returned voice and transcription texts.
5. Compare `scoring.liveScore` with `scoring.reconstruction` (rounding tolerance up to 0.005); inspect path and component scores.
6. Verify the expandable STAGING panel displays and is absent when flag OFF.
7. Repeat with male reference, EGG reference and 3 prior learner attempts. Compare individual vocal attempts; do not treat same-speaker identity as automatic 100%.
8. Collect expert-rated recordings before adopting any weight calibration. A hypothetical score is not validated learner accuracy.

## Rollback
Set `ZABBOT_PARA_SCORING_DIAGNOSTICS_V1=false` and redeploy STAGING backend. No scoring code or weights need reverting. UI panel remains hidden because payload is absent.

## Boundaries
- This release is **diagnostic**; the current Pàrà live score and feedback message do not change.
- Whisper transcribes short Yorùbá audio without explicit language/context. The reported transcript score is a measure of ASR-text agreement, not phonetic correctness.
- Suspected octave jumps are observed, not automatically fixed. This release supports deciding what subsequent acoustic correction is justified.
