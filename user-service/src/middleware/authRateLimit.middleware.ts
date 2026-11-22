import { createHash } from "crypto";
import { Request, Response, NextFunction } from "express";

type Counter = { count: number; resetsAt: number };
type Limit = { scope: string; windowMs: number; perAccount: number; perIp: number };

// A per-process backstop. The user service currently runs as one child process
// of the backend gateway. A shared Redis-backed store is required if this
// service is horizontally replicated.
const counters = new Map<string, Counter>();
const MAX_ENTRIES = 50000;
const MAX_EMAIL_LENGTH = 254;

const fingerprint = (value: string): string =>
  createHash("sha256").update(value).digest("hex");

function increment(key: string, max: number, windowMs: number, now: number) {
  const previous = counters.get(key);
  const current = !previous || previous.resetsAt <= now
    ? { count: 1, resetsAt: now + windowMs }
    : { count: previous.count + 1, resetsAt: previous.resetsAt };
  counters.delete(key);
  counters.set(key, current);
  return current.count > max ? current.resetsAt : 0;
}

function prune(now: number) {
  if (counters.size < 5000) return;
  for (const [key, counter] of counters) {
    if (counter.resetsAt <= now) counters.delete(key);
  }
  // Bounded memory in case many distinct addresses/accounts are submitted.
  while (counters.size > MAX_ENTRIES) {
    const oldest = counters.keys().next().value;
    if (typeof oldest !== "string") break;
    counters.delete(oldest);
  }
}

export function limitAuthRequests(config: Limit) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const now = Date.now();
    prune(now);
    // Express trusts only the internal loopback gateway. Never parse a
    // browser-provided X-Forwarded-For header directly.
    const ip = request.ip || request.socket.remoteAddress || "unknown";
    const email = typeof request.body?.email === "string"
      ? request.body.email.trim().toLowerCase().slice(0, MAX_EMAIL_LENGTH)
      : "";
    const origin = fingerprint(ip);
    const account = email ? fingerprint(email) : "missing-email";
    const waitByIp = increment(
      `${config.scope}:ip:${origin}`, config.perIp, config.windowMs, now,
    );
    const waitByAccount = increment(
      `${config.scope}:account:${origin}:${account}`,
      config.perAccount, config.windowMs, now,
    );
    const retryAt = Math.max(waitByIp, waitByAccount);
    if (retryAt > now) {
      const seconds = Math.max(1, Math.ceil((retryAt - now) / 1000));
      response.setHeader("Retry-After", String(seconds));
      response.setHeader("Cache-Control", "no-store");
      response.status(429).json({
        message: "Too many attempts. Please wait a few minutes and try again.",
      });
      return;
    }
    next();
  };
}

const WINDOW = 15 * 60 * 1000;
export const loginLimiter = limitAuthRequests({
  scope: "login", windowMs: WINDOW, perAccount: 12, perIp: 300,
});
export const verifyOtpLimiter = limitAuthRequests({
  scope: "verify-otp", windowMs: WINDOW, perAccount: 12, perIp: 300,
});
export const resendOtpLimiter = limitAuthRequests({
  scope: "resend-otp", windowMs: WINDOW, perAccount: 3, perIp: 120,
});
export const passwordResetRequestLimiter = limitAuthRequests({
  scope: "reset-request", windowMs: WINDOW, perAccount: 4, perIp: 120,
});
