/**
 * Phase 2 subscription-gating free preview.
 *
 * IDs verified against Neon STAGING on 2026-11-22.
 * Scope is intentionally narrow: only the introductory lesson is a free
 * learning experience. The parent Journey may be browsed, but its remaining
 * lessons are NOT free. Admin isActive must be checked separately and FIRST.
 *
 * Do not authorize based on a client-supplied title or array position.
 * Check staging/prod record parity before activating enforcement in production.
 */
export const FREE_PREVIEW_JOURNEY_ID =
  "1a64676a-f16e-4054-9d61-bef443f32339";

export const FREE_PREVIEW_LESSON_ID =
  "2dfcd37e-364e-4490-a8ef-7e3b18caa6c6";

export function isFreePreviewLesson(lessonId: string): boolean {
  return lessonId === FREE_PREVIEW_LESSON_ID;
}

export function isFreePreviewJourney(journeyId: string): boolean {
  return journeyId === FREE_PREVIEW_JOURNEY_ID;
}
