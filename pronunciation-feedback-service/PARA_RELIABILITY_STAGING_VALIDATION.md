# Pàrà STAGING reliability and spelling/display contract — 2026-11-25

## Objective
Replace repeated generic 422 retry loops for usable short-word recordings with honest **ungraded practice results** when syllable evidence is uncertain. No invented acoustic/tone score; no grade persisted. Existing reliable 55/25/20 and reference-ASR-excluded 55:25 scoring unchanged. Existing male/female per-word reference selection remains unchanged.

## API contract
- `status=success`, `data.graded=false`, `data.assessmentStatus="ungraded"`, `data.finalScore=null`, `data.message` and optional cautious `pitchFeedback` when speech is present but reference ASR, alignment, word analysis or pitch quality cannot justify a grade.
- `status=success`, `data.finalScore` numeric for valid reliable scoring.
- 422 only when the learner audio truly fails speech quality checks or the reference source itself is unusable. Reference failures get distinct messaging.
- An ungraded result must not be stored as learner progress; the browser playback/download of the attempt remains available.

## Fixed catalog spelling handling
Hyphen and Unicode dash separators are ignored for *tone-vowel extraction and graph syllable labels only*. Original stored Yorùbá spelling and reference audio are never altered. This supports `MẸ́Ẹ̀-D-ÓGÚN` without treating punctuation as a vowel.

## Required STAGING regression matrix
Run automated tests for parser and scoring paths for GBOGBO, BÀTÀ, ÀBÚRÒ, Ẹ̀JẸ̀, ÌLÙ, OMI and MẸ́Ẹ̀-D-ÓGÚN, as well as insufficient pitch, limited syllable alignment, valid high/low tone matches, wrong words, silent learner audio and defective reference. Confirm score = null (not 0) for all ungraded responses. The named-word tests are a *sample*, not a full live database/reference catalog audit.

## Frontend display contract
Uppercase original Yorùbá spelling (diacritics retained); tone names lowercase in brackets, e.g. ÀBÚRÒ (do–mi–do), syllable BÚ (mi). Format only on client display. The LISTEN and RECORD actions continue to share the selected male/female reference identifier; LISTEN is not required before RECORD.

## Release
STAGING branches and CI only until manual acceptance. A true catalog-wide audit requires querying the live STAGING database and checking every reference URL's audio (not supported by repository fixture-only tests). Do not promote to PRODUCTION without representative recordings and validation.
