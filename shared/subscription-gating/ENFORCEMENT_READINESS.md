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

1. **STAGED, NOT TESTED:** In-lesson Ọ̀rẹ́ now has
   `POST /users/chat/lesson-practice` behind the default-off backend switch.
   The Next.js `/api/chat` route proxies to it when the frontend switch is
   also enabled; it otherwise preserves the legacy direct-OpenAI behavior.
   The modal now sends the database `contentId` and access token.
   The backend resolves content -> lesson -> parent Journey, checks ADMIN
   availability, free-preview or valid entitlement, validates lesson vocabulary,
   and reserves the SAME atomic 30/day quota as standalone Ọ̀rẹ́.
   **BLOCKER:** Test both flags together. If the frontend switch remains OFF,
   the legacy direct-OpenAI endpoint still bypasses subscription and quota.
   Confirm live/staging API URL and token flow, content wording, error states,
   prompt scoping, rate limiting, and lesson usability before enabling either.
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
   The initial policy tests have run in CI; expanded integration tests remain outstanding.
8. Review feature flag precedence and rollback. No staging or production
   deployment has been performed.


## 2026-11-22 remediation commits (NOT deployed)

- Exact entitlement transaction linkage: recurring uses Stripe gateway subscription ID;
  new lifetime records use `lifetime:<transaction UUID>`. Legacy lifetime records
  lacking that identifier fail closed and require reconciliation/backfill.
- Signed Stripe `charge.refunded` (full refund) and `charge.dispute.created`
  events attempt to revoke the *specific mapped* successful transaction.
  Historical records lacking payment-intent metadata are NOT safely reconciled
  and must be investigated. Partial refunds and dispute outcomes still require
  an explicit policy and corresponding tests.
- Paid renewal retries update the existing invoice transaction and restore the
  matching FAILED subscription instead of creating duplicate subscription rows.
- Delayed lifetime charge uses an atomic claim and Stripe idempotency key per
  attempt. Stale PROCESSING attempts still need an operator recovery procedure.
- ADMIN-only authorization for subscription plan creation and bulk Journey
  creation. User lesson/Journey progress writes are protected behind the
  default-off gating switch; Journey-progress deletion requires record ownership.
- Pronunciation history now requires authentication and row-level ownership,
  reference pronunciation creation requires ADMIN, and in-lesson audio URL is
  overwritten from the database reference. Uploaded audio has a 10 MB limit and
  error-response cleanup.
- The unauthenticated direct-OpenAI Next.js chat route was removed. All lesson
  chats proxy through authenticated, quota-limited backend practice, with the
  paid-gating rule still default-OFF. Deploy backend before frontend in any
  controlled staging test so this API is available.
- Frontend tiles/entitlement network queries are now default-OFF behind
  `NEXT_PUBLIC_ZABBOT_SUBSCRIPTION_GATING_ENFORCE=true`.
- GitHub Actions compile/typecheck and initial policy tests have run, but
  there is still NO end-to-end staging validation.

## Remaining blockers

1. Run `billing-reconciliation-audit.sql` READ ONLY against staging; investigate
   missing gateway references, legacy paid lifetime rows, historical refunds,
   disputed/partially refunded charges, and stale PROCESSING lifetime records.
   Then reconcile against Stripe TEST MODE; never update a production customer
   subscription by inference.
2. Verify the event payload shape and payment-intent linkage for real checkout,
   delayed lifetime, renewal, refund and dispute webhook events. Some historical
   transactions may lack linkable metadata. Introduce an audited backfill plan.
3. Unit/integration tests for signed webhook retries/reversals, overlapping
   invoices, owner-scoped progress writes, direct API access and ADMIN overrides.
4. Verify single-lesson quiz access and all approved free lesson embedded exercises.
5. Test cross-environment flag coordination, rollback, invalidation after billing,
   and ensure no other production-facing service uses an insecure legacy AI path.
6. Audit media-serving URLs and any publicly accessible raw curriculum/media
   assets that cannot be revoked by API entitlement middleware.
7. Do not enable enforcement in staging or production until payment reconciliation
   and denial tests are demonstrated. Neither draft PR may be merged yet.

## Failure modes

- An inactive lesson or inactive parent Journey must return
  `CURRICULUM_UNAVAILABLE` even to paid users.
- Paid content requires a valid server-computed entitlement; direct URL and
  direct HTTP requests cannot circumvent checks.
- An entitlement lookup outage must not grant paid access.
- No subscription-required paywall should appear on ADMIN-inactive tiles.
- Do not erase progress when access expires.
