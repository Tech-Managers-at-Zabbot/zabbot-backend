# Pàrà: STAGING octave-tracker repair & unreliable ASR evidence release

## Scope and guardrails
This is a diagnostic-first release. Keep the displayed score, existing 55/25/20 and 60/40 scoring weights, entitlement rules, speech recognition request, and current wording unchanged.

New logic:
1. `repairIsolatedOctaveFrames`: corrects only a one-frame pitch estimate approximately 900–1450 cents above/below **both** adjacent voiced samples, provided those adjacent pitches differ by no more than 250 cents. It never interpolates gaps or suppresses sustained tone changes.
2. `compareAcousticTones(..., true)` and `timedPitchContour(..., true)`: reuse the same optionally corrected pitch extraction for experimental scoring and corrected pitch graph.
3. The existing `data.scoringDiagnostics.evidenceQualityCalibration` object computes a research-only corrected acoustic score and composite, flags reference-ASR mismatches with the trusted Yorùbá word and avoids treating bad reference ASR as proof of learner error.
4. If the reference transcription does not sufficiently resemble the trusted predefined Yorùbá word (threshold 0.65), the *shadow-only* composite excludes ASR evidence and renormalizes the original acoustic/tone portions. If the reference is recognized or no trusted word exists, preserve provisional transcript evidence in the candidate. **These thresholds are provisional and not a production scoring rule.**

## STAGING flags
Already used: `ZABBOT_PARA_SCORING_DIAGNOSTICS_V1=true` (required for expanded diagnostics), `ZABBOT_PARA_PITCH_FEEDBACK_V2=true`, `ZABBOT_PARA_ACOUSTIC_SCORING_V1=true`.

New optional flag **only for the corrected graph**:
```env
ZABBOT_PARA_PITCH_GRAPH_OCTAVE_REPAIR_V1=true
```
If OFF, graph remains the old curve and the new shadow diagnostics still measure candidate corrected scoring. This allows before/after comparison without changing actual scoring. Set this only on DigitalOcean STAGING backend after code deployment. Do not set on production.

## Verification
- Compare the supplied GBOGBO female baseline and same-speaker recording; baseline previously had a single +1180-cent jump. Corrected graph should no longer display that isolated error when the graph flag is true.
- Confirm diagnostic `correctedReferenceOctaveJumpCandidates` is zero for this clip; record `rawAcousticScore`, `correctedAcousticScore`, `correctedRelativeScore`, and whether baseline ASR was withheld.
- Confirm `finalScore`, `remark` and `scoring.liveScore` are **unchanged** with flags toggled.
- Test EGG and other real same-speaker pairs, different speakers, and intentionally wrong DO/RE/MI tones; preserve strong penalties for genuine mistakes.
- If ASR recognizes baseline as “Buh-bye” instead of GBOGBO, `asrDecision` should be `withhold-unreliable-reference`; this is diagnostic-only.
- Validate that no unvoiced gaps are bridged and sustained changes or 2-frame pitch movements are left intact.

## Rollback
Set `ZABBOT_PARA_PITCH_GRAPH_OCTAVE_REPAIR_V1=false` and redeploy STAGING backend to restore original displayed contours. Toggle `ZABBOT_PARA_SCORING_DIAGNOSTICS_V1=false` to hide all experimental diagnostics.

## Important limitation
This is **not** a phonetic forced alignment, a certified Yorùbá pronunciation model, or ASR-confidence calibration. Baseline spelling agreement is a proxy, not model confidence. Do not promote the candidate score to grading until recordings are rated independently by fluent speakers.
