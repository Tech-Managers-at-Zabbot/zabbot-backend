# Pàrà STAGING — evidence recovery without fake scores

## Purpose
Recover gradable short-word recordings that previously returned "We couldn't measure enough reliable pitch" or were marked ungraded simply because graph energy-valley alignment was limited.

## Changes
1. **Only if the standard acoustic comparator cannot score:** retry fundamental-frequency extraction with a 40ms frame, 10ms hop and a STRICTER autocorrelation threshold (0.82 vs 0.76). It is restricted to clips with 0.3–2.2 seconds of active audio, at least 12 voiced frames per side, and at least 22% voiced-frame coverage. The original acoustic scoring formula and duration-ratio/DTW safeguards remain unchanged. No score bonus is given.
2. **Decouple graph alignment from gradeability:** graph energy-valley quality only governs which specific syllable guidance can be displayed. The independent vowel-tone syllable analyzer already checks enough voiced frames per nucleus and consistency of the trusted reference tone pattern (>= 0.65). When these pass, retain the original 55/25/20 formula if both ASR outputs match the known word, or renormalize 55/25 when reference ASR is demonstrably unreliable.
3. **Guarded 60/40 fallback:** when independent syllable-tone evidence is unavailable, permit the existing 60% acoustic/40% transcription formula ONLY when both the trusted reference AND learner transcription independently agree with the expected word. If either is unreliable, return ungraded rather than pretending acoustic match proves correct word identity.
4. **Production untouched:** no changes to model, word catalog, pricing, entitlements, random reference selection or learner tone-feedback presentation.

## Acceptance
- CI must pass acoustic synthetic 450ms speech, silence, differing tone patterns, low vs high pitch, and controlled ASR combinations.
- Validate *real recordings* of GBOGBO, ÀBÚRÒ, BÀTÀ, Ẹ̀JẸ̀, ÌLÙ, OMI and MẸ́Ẹ̀-D-ÓGÚN, for both reference voices where available.
- A high score requires independent tone evidence or trustworthy word recognition; ungradable inputs remain explicitly ungraded, not 0% or falsely high.
- Dashboard may continue to mark individual syllables as uncertain if energy valleys lack confidence, even when a verified separate tone analyzer supports grading.
- Do not promise every recording will yield a grade. Compare rates of ungraded results and correct-vs-intentionally-wrong tone separation before production promotion.

## Rollback
Revert this PR's squash merge on STAGING only. Existing diagnostic flag(s) are preserved. No environment variable changes required.
