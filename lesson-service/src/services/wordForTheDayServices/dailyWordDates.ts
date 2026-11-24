/**
 * Daily Words DATEONLY values use a calendar date, not a timestamp.
 * Both selection and the 30-day reuse boundary must be derived from the
 * SAME learner-local date. UTC is used for server-side cron assignments.
 */
export function dailyWordDateAndReuseCutoff(
  now: Date,
  timeZone = "UTC",
): { today: string; reuseCutoff: string } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = (type: string) => parts.find(part => part.type === type)?.value;
  const year = value("year");
  const month = value("month");
  const day = value("day");
  if (!year || !month || !day) throw new Error("Unable to resolve Daily Word calendar date");

  const today = `${year}-${month}-${day}`;
  // Date-only arithmetic is done at UTC midnight, AFTER resolving local day.
  // This avoids DST and UTC-offset changes moving the cutoff by one day.
  const cutoff = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  cutoff.setUTCDate(cutoff.getUTCDate() - 30);
  return {
    today,
    reuseCutoff: cutoff.toISOString().slice(0, 10),
  };
}
