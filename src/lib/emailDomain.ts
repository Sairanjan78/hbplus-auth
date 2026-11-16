/**
 * Pure domain matcher (no imports, so it is unit-testable with plain Node).
 * Takes the text after the LAST "@" and compares it exactly, case-insensitively.
 * Rejects look-alikes such as "a@hbplus.fit.evil.com", "a@sub.hbplus.fit",
 * "a@xhbplus.fit" and malformed values.
 */
export function matchesDomain(email: string | null | undefined, allowedDomain: string): boolean {
  if (!email || !allowedDomain) return false;
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf('@');
  if (at <= 0 || at === normalized.length - 1) return false;
  return normalized.slice(at + 1) === allowedDomain.trim().toLowerCase();
}
