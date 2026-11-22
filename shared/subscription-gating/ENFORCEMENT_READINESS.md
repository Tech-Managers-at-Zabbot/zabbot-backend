# Phase 2 subscription gating — enforcement readiness checklist

**Do not set `ZABBOT_SUBSCRIPTION_GATING_ENFORCE=true` in staging or
production until this checklist is completed.** All changes remain isolated
to `feature/subscription-gating-phase2`.

## Verified free-preview IDs (staging AND production)

- Journey: `1a64676a-f16e-4054-9d61-bef443f32339`
- Lesson: `2dfcd37e-364e-4490-a8ef-7e3b18caa6c6`

Only that lesson is free. Parent Journey is browsable only. ADMIN
`isActive=false` overrides both subscription and the free exception.

## Implemented behind default-off flag

- `GET /lessons/lessons/lesson-with-contents/:lessonId`: checks lesson,
  parent Journey ADMIN state, free-preview lesson ID, entitlement.
- `GET /lessons/contents/lesson/:lessonId`: same.
- `GET /lessons/contents/:id`: resolves actual lessonId from content DB
  before checking entitlement.
- `GET /lessons/contents/` and
  `GET /lessons/contents/language-contents/:languageId`: premium-only,
  authenticated bulk results.
- `GET /lessons/quizzes/:courseId`: premium-only course-wide quiz list;
  free introductory quizzes use the scoped lesson-detail response.
- `GET /lessons/flashcards/` and `/:id`: premium-only.
- `GET /lessons/lessons/course-lessons/:courseId`: removes embedded
  content bodies from the listing when the flag is enabled; lesson metadata
  is retained for the Journey browser.

## NOT YET COVERED — BLOCKS ENABLING FLAG

1. **BLOCKER:** `/api/chat` in Next.js directly invokes OpenAI without
   authenticated subscription verification or the backend's 30-message daily
   quota. In-lesson Ọ̀rẹ́ uses this route. A free-lesson exception cannot trust
   a client-supplied lesson ID; requires a server-verified lesson/content context
   and bounded usage BEFORE enforcement. Do not globally block the route
   without preserving the approved free introductory exercise.
2. **STAGED, NOT TESTED:** Standalone Ọ̀rẹ́ creation and message-send routes
   now call `requirePremiumEntitlement` behind the default-off switch.
   Conversation history reads remain accessible. Test quota, ownership and
   payment transitions, plus direct API calls, before activation.
3. **STAGED, NOT TESTED:** Pronunciation feedback now uses
   `requirePronunciationEntitlement` behind the default-off switch. Its
   free-preview exemption checks the posted reference ID against
   `content_files -> contents -> lessons -> courses` using database state,
   not client `isInLessonAudioId` or URL. Verify that the reference ID used
   by the actual free-lesson UI corresponds to the content-file ID.
   Because multipart upload is parsed before this check, assess file-size
   limits, unauthorized disk writes and cleanup before activation.
4. Audit user-course progress, user-lessons, quiz answer endpoints, alternate
   content-files, and media/public asset URLs for indirect access or progress
   mutations by unsubscribed users.
5. Audit all guest/admin learning-page behaviors before changing bulk/list
   APIs. No global route gate may block the approved free lesson.
6. Reconcile/refund/dispute history, legacy lifetime records, trial conversion
   and overlapping recurring transaction evidence before trusting entitlement
   answers for enforcement. Transaction rows keyed to shared plan IDs are not
   sufficient to settle refund/revocation sequences.
7. Run TypeScript builds, unit tests, and staging integration/API bypass tests.
   The tests are committed but have NOT been executed in CI.
8. Review feature flag precedence and rollback. No staging or production
   deployment has been performed.

## Failure modes

- An inactive lesson or inactive parent Journey must return
  `CURRICULUM_UNAVAILABLE` even to paid users.
- Paid content requires a valid server-computed entitlement; direct URL and
  direct HTTP requests cannot circumvent checks.
- An entitlement lookup outage must not grant paid access.
- No subscription-required paywall should appear on ADMIN-inactive tiles.
- Do not erase progress when access expires.
